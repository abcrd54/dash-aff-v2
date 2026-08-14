import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getAffiliateAccounts, getConnectionsByAccount, updateAffiliateAccount, getConnection, createConnection } from "../lib/db";
import { getPlatformList, createPortalLink, checkAndSyncConnection, syncChannel, syncDisconnect, platformNeedsChannel } from "../lib/platform-connect";
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

platformRoutes.post("/api/platform/portal", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.json();
  const accountId = Number(body.accountId);
  const platform = String(body.platform || "").toUpperCase();

  if (!accountId || !platform) {
    return c.json({ error: "accountId and platform required" }, 400);
  }

  const account = getAffiliateAccounts(user.id).find((a) => a.id === accountId);
  if (!account || !account.api_key || !account.team_id) {
    return c.json({ error: "Account not ready" }, 400);
  }

  let conn = getConnection(accountId, platform);
  if (!conn) {
    conn = createConnection(accountId, platform);
  }

  try {
    const redirectUrl = `${process.env.APP_URL || "http://localhost:4000"}/platform/connect`;
    const portalUrl = await createPortalLink(account.api_key, account.team_id, platform, redirectUrl);
    return c.json({ url: portalUrl });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

platformRoutes.post("/api/platform/check-status", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.json();
  const accountId = Number(body.accountId);
  const platform = String(body.platform || "").toUpperCase();

  if (!accountId || !platform) {
    return c.json({ error: "accountId and platform required" }, 400);
  }

  const account = getAffiliateAccounts(user.id).find((a) => a.id === accountId);
  if (!account || !account.api_key || !account.team_id) {
    return c.json({ error: "Account not ready" }, 400);
  }

  try {
    const result = await checkAndSyncConnection(accountId, account.api_key, account.team_id, platform);
    const conn = getConnection(accountId, platform);
    return c.json({
      status: result.status,
      channels: result.channels,
      username: result.username,
      connection: conn,
      needsChannel: platformNeedsChannel(platform),
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

platformRoutes.post("/api/platform/set-channel", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.json();
  const accountId = Number(body.accountId);
  const platform = String(body.platform || "").toUpperCase();
  const channelId = String(body.channelId || "");
  const channelName = String(body.channelName || "");

  if (!accountId || !platform || !channelId) {
    return c.json({ error: "accountId, platform, and channelId required" }, 400);
  }

  const account = getAffiliateAccounts(user.id).find((a) => a.id === accountId);
  if (!account || !account.api_key || !account.team_id) {
    return c.json({ error: "Account not ready" }, 400);
  }

  try {
    await syncChannel(accountId, account.api_key, account.team_id, platform, channelId, channelName);
    const conn = getConnection(accountId, platform);
    return c.json({ success: true, connection: conn });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

platformRoutes.post("/api/platform/disconnect", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.json();
  const accountId = Number(body.accountId);
  const platform = String(body.platform || "").toUpperCase();

  if (!accountId || !platform) {
    return c.json({ error: "accountId and platform required" }, 400);
  }

  const account = getAffiliateAccounts(user.id).find((a) => a.id === accountId);
  if (!account || !account.api_key || !account.team_id) {
    return c.json({ error: "Account not ready" }, 400);
  }

  try {
    await syncDisconnect(accountId, account.api_key, account.team_id, platform);
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
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