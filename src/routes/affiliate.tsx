import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { runBatchOnboarding } from "../lib/orchestrator";
import { getAffiliateAccounts } from "../lib/db";
import CreateBunsosPage from "../views/affiliate/index";

const activeJobs = new Map<number, AbortController>();

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
  return c.json({ accounts, hasActiveJob: activeJobs.has(user.id) });
});

affiliateRoutes.post("/create-bunsos/stream", authMiddleware, async (c) => {
  const user = getSession(c)!;

  if (activeJobs.has(user.id)) {
    return c.json({ error: "Process already running" }, 409);
  }

  const body = await c.req.parseBody();
  const count = Math.min(Math.max(Number(body.count) || 1, 1), 5);
  const identity = String(body.identity || "").trim();

  const abortController = new AbortController();
  activeJobs.set(user.id, abortController);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of runBatchOnboarding(user.id, count, identity, abortController.signal)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } catch (e: any) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ accountIndex: 0, accountName: "System", step: "error", status: "failed", detail: e.message })}\n\n`)
        );
      } finally {
        activeJobs.delete(user.id);
        controller.close();
      }
    },
    cancel() {
      abortController.abort();
    },
  });

  const cleanup = () => {
    abortController.abort();
    activeJobs.delete(user.id);
  };

  c.req.raw.signal?.addEventListener("abort", cleanup);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

export default affiliateRoutes;
