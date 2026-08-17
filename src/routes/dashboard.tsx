import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getAllUsers, getPosts, getAffiliateAccounts, getConnectionsByAccount, hasAnyAutoPostEnabled, hasAnyAutoGenerateEnabled } from "../lib/db";
import UserDashboard from "../views/dashboard/index";

const dashboardRoutes = new Hono();

dashboardRoutes.get("/dashboard", authMiddleware, (c) => {
  const user = getSession(c)!;
  const users = getAllUsers();
  const posts = getPosts(user.role === "admin" ? undefined : user.id);

  const accounts = getAffiliateAccounts(user.id);
  const doneAccounts = accounts.filter((a) => a.status === "done");
  const connectedPlatforms = new Set<string>();
  for (const acc of doneAccounts) {
    const conns = getConnectionsByAccount(acc.id);
    for (const conn of conns) {
      if (conn.status === "connected") {
        connectedPlatforms.add(`${acc.id}-${conn.platform}`);
      }
    }
  }

  const uniqueIdentities = new Set(doneAccounts.map((a) => a.identity || "Uncategorized"));

  const autoPostActive = user.role === "user" ? hasAnyAutoPostEnabled(user.id) : false;
  const autoGenerateActive = user.role === "user" ? hasAnyAutoGenerateEnabled(user.id) : false;

  return c.html(
    <UserDashboard
      user={user}
      stats={{
        users: users.length,
        posts: posts.length,
        bunsocialTotal: accounts.length,
        bunsocialReady: doneAccounts.length,
        platformsConnected: connectedPlatforms.size,
        identityGroups: uniqueIdentities.size,
        estimatedMonthlyPosts: doneAccounts.length * 20,
      }}
      autoPostActive={autoPostActive}
      autoGenerateActive={autoGenerateActive}
    />
  );
});

export default dashboardRoutes;
