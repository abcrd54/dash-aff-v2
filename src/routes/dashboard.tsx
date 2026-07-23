import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getAllUsers, getPosts, getAllContent } from "../lib/db";
import UserDashboard from "../views/dashboard/index";

const dashboardRoutes = new Hono();

dashboardRoutes.get("/dashboard", authMiddleware, (c) => {
  const user = getSession(c)!;
  const users = getAllUsers();
  const posts = getPosts(user.role === "admin" ? undefined : user.id);
  const content = getAllContent();

  return c.html(
    <UserDashboard
      user={user}
      stats={{
        users: users.length,
        posts: posts.length,
        content: content.length,
      }}
    />
  );
});

export default dashboardRoutes;
