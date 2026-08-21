import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { runBatchOnboarding } from "../lib/orchestrator";
import { getAffiliateAccounts } from "../lib/db";
import CreateBunsosPage from "../views/affiliate/index";

interface ActiveJob {
  active: boolean;
  controller: AbortController;
  count: number;
  accountIndex: number;
  step: string;
  percent: number;
  error: string | null;
}

const activeJobs = new Map<number, ActiveJob>();
const onboardingSteps = ["generate_email", "signup", "poll_inbox", "verify_link", "get_token", "setup_profile", "get_org", "create_api_key", "create_team", "complete"];

const affiliateRoutes = new Hono();

function publicAccount(account: ReturnType<typeof getAffiliateAccounts>[number]) {
  const { password, password_hash, access_token, api_key, api_key_id, ...safe } = account;
  return {
    ...safe,
    password: null,
    password_hash: "",
    access_token: null,
    api_key: null,
    api_key_id: null,
  };
}

affiliateRoutes.get("/create-bunsos", authMiddleware, (c) => {
  const user = getSession(c)!;
  const accounts = getAffiliateAccounts(user.id).map(publicAccount);
  return c.html(<CreateBunsosPage user={user} accounts={accounts} />);
});

affiliateRoutes.get("/api/affiliate/accounts", authMiddleware, (c) => {
  const user = getSession(c)!;
  const accounts = getAffiliateAccounts(user.id).map(publicAccount);
  const job = activeJobs.get(user.id);
  return c.json({
    accounts,
    hasActiveJob: Boolean(job?.active),
    job: job ? { active: job.active, count: job.count, accountIndex: job.accountIndex, step: job.step, percent: job.percent, error: job.error } : null,
  });
});

affiliateRoutes.post("/create-bunsos/stream", authMiddleware, async (c) => {
  const user = getSession(c)!;

  if (activeJobs.get(user.id)?.active) {
    return c.json({ error: "Process already running" }, 409);
  }

  const body = await c.req.parseBody();
  const count = Math.min(Math.max(Number(body.count) || 1, 1), 5);
  const identity = String(body.identity || "").trim();

  const abortController = new AbortController();
  const job: ActiveJob = { active: true, controller: abortController, count, accountIndex: 0, step: "starting", percent: 0, error: null };
  activeJobs.set(user.id, job);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of runBatchOnboarding(user.id, count, identity, abortController.signal)) {
          const stepIndex = onboardingSteps.indexOf(event.step);
          const completedInAccount = event.step === "error" || event.step === "cancelled"
            ? onboardingSteps.length
            : Math.max(0, stepIndex + (event.status === "done" ? 1 : 0));
          job.accountIndex = event.accountIndex;
          job.step = event.step;
          job.percent = Math.min(100, Math.round((((event.accountIndex - 1) * onboardingSteps.length + completedInAccount) / (count * onboardingSteps.length)) * 100));
          job.error = event.step === "error" ? event.detail || "Proses gagal" : job.error;
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          } catch {
            // Browser left the page; the server-side job intentionally continues.
          }
        }
      } catch (e: any) {
        job.error = e.message || "Proses gagal";
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ accountIndex: 0, accountName: "System", step: "error", status: "failed", detail: job.error })}\n\n`));
        } catch {}
      } finally {
        job.active = false;
        job.percent = 100;
        if (!job.error) job.step = "complete";
        setTimeout(() => {
          if (activeJobs.get(user.id) === job) activeJobs.delete(user.id);
        }, 10 * 60 * 1000);
        try { controller.close(); } catch {}
      }
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

export default affiliateRoutes;
