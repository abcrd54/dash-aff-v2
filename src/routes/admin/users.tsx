import { Hono } from "hono";
import { authMiddleware, adminMiddleware, getSession } from "../../middleware/auth";
import { getAllUsers, createUser, updateUser, deleteUser, getUserByUsername } from "../../lib/db";
import UsersPage from "../../views/admin/users";

const adminUserRoutes = new Hono();

adminUserRoutes.get("/admin/users", authMiddleware, adminMiddleware, (c) => {
  const user = getSession(c)!;
  const users = getAllUsers();
  const error = c.req.query("error") || "";
  const success = c.req.query("success") || "";
  return c.html(<UsersPage user={user} users={users} error={error} success={success} />);
});

adminUserRoutes.post("/admin/users", authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.parseBody();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password || password.length < 6) {
    return c.redirect("/admin/users?error=" + encodeURIComponent("Username dan password minimal 6 karakter"));
  }

  const existing = getUserByUsername(username);
  if (existing) {
    return c.redirect("/admin/users?error=" + encodeURIComponent("Username sudah digunakan"));
  }

  try {
    const passwordHash = await Bun.password.hash(password, "bcrypt");
    createUser(username, passwordHash, "user");
  } catch (e) {
    return c.redirect("/admin/users?error=" + encodeURIComponent("Gagal membuat user"));
  }

  return c.redirect("/admin/users");
});

adminUserRoutes.put("/admin/users/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.parseBody();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const role = String(body.role || "user");

  const data: { username?: string; password_hash?: string; role?: string } = {};
  if (username) data.username = username;
  if (password) data.password_hash = await Bun.password.hash(password, "bcrypt");
  if (role) data.role = role;

  updateUser(id, data);

  return c.redirect("/admin/users");
});

adminUserRoutes.delete("/admin/users/:id", authMiddleware, adminMiddleware, (c) => {
  const id = Number(c.req.param("id"));
  deleteUser(id);
  return c.redirect("/admin/users");
});

export default adminUserRoutes;