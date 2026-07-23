import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { runBatchOnboarding } from "../lib/orchestrator";
import { getAffiliateAccounts } from "../lib/db";
import CreateBunsosPage from "../views/affiliate/index";
import { raw } from "hono/html";

const affiliateRoutes = new Hono();

affiliateRoutes.get("/create-bunsos", authMiddleware, (c) => {
  const user = getSession(c)!;
  const accounts = getAffiliateAccounts(user.id);
  return c.html(<CreateBunsosPage user={user} accounts={accounts} />);
});

affiliateRoutes.post("/create-bunsos/stream", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.parseBody();
  const count = Math.min(Math.max(Number(body.count) || 1, 1), 5);
  const identity = String(body.identity || "").trim();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of runBatchOnboarding(user.id, count, identity)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } catch (e: any) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ accountIndex: 0, accountName: "System", step: "error", status: "failed", detail: e.message })}\n\n`)
        );
      }
      controller.close();
    },
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