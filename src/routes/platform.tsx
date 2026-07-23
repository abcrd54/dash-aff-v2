import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getAffiliateAccounts, getConnectionsByAccount, updateAffiliateAccount } from "../lib/db";
import { getPlatformList, massConnectPlatform } from "../lib/platform-connect";
import { parseCookies } from "../lib/puppeteer";
import PlatformConnectPage from "../views/platform/connect";

const platformRoutes = new Hono();

platformRoutes.get("/platform/connect", authMiddleware, (c) => {
  const user = getSession(c)!;
  const accounts = getAffiliateAccounts(user.id).filter((a) => a.status === "done");
  const platforms = getPlatformList();

  const accountsWithConnections = accounts.map((acc) => ({
    ...acc,
    connections: getConnectionsByAccount(acc.id),
  }));

  return c.html(
    <PlatformConnectPage
      user={user}
      accounts={accountsWithConnections}
      platforms={platforms}
    />
  );
});

platformRoutes.post("/platform/connect/stream", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.parseBody();
  const platform = String(body.platform || "").toUpperCase();
  const accountIdsStr = String(body.accountIds || "");
  const cookies = String(body.cookies || "");

  if (!platform || !accountIdsStr || !cookies) {
    return c.json({ success: false, error: "Platform, accountIds, and cookies required" }, 400);
  }

  try {
    parseCookies(cookies, platform);
  } catch {
    return c.json({ success: false, error: "Invalid cookie format" }, 400);
  }

  const accountIds = accountIdsStr.split(",").map(Number).filter((n) => !isNaN(n));

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of massConnectPlatform(user.id, platform, accountIds, cookies)) {
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

platformRoutes.post("/platform/connect/identity", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.parseBody();
  const accountId = Number(body.accountId);
  const identity = String(body.identity || "").trim();

  if (!accountId || isNaN(accountId)) {
    return c.json({ success: false, error: "Invalid accountId" }, 400);
  }

  const account = getAffiliateAccounts(user.id).find((a) => a.id === accountId);
  if (!account) {
    return c.json({ success: false, error: "Account not found" }, 404);
  }

  updateAffiliateAccount(accountId, { identity });
  return c.json({ success: true, identity });
});

export default platformRoutes;