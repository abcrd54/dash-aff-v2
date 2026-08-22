import { Hono } from "hono";
import { authMiddleware, adminMiddleware, getSession } from "../../middleware/auth";
import { getAllUsers, createUser, updateUser, deleteUser, getUserByUsername, getUserByEmail, getUserById, revokeUserSessions, addSecurityAuditLog } from "../../lib/db";
import { createUserSchema, updateUserSchema } from "../../lib/validate";
import UsersPage from "../../views/admin/users";

const adminUserRoutes = new Hono();

adminUserRoutes.get("/admin/users", authMiddleware, adminMiddleware, (c) => {
  const user = getSession(c)!;
  const users = getAllUsers();
  return c.html(<UsersPage user={user} users={users} />);
});

adminUserRoutes.post("/admin/users", authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.parseBody();
  const result = createUserSchema.safeParse({
    username: String(body.username || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    password: String(body.password || ""),
    role: String(body.role || "user"),
  });

  if (!result.success) {
    return c.json({ error: result.error.issues.map(i => i.message).join(", ") });
  }

  const { username, email, password, role } = result.data;

  const existing = getUserByUsername(username);
  if (existing) {
    return c.json({ error: "Username sudah digunakan" });
  }

  const existingEmail = getUserByEmail(email);
  if (existingEmail) {
    return c.json({ error: "Email sudah digunakan" });
  }

  try {
    const passwordHash = await Bun.password.hash(password, "bcrypt");
    createUser(username, email, passwordHash, role as "admin" | "user");
  } catch (e) {
    return c.json({ error: "Gagal membuat user" });
  }

  return c.json({ success: true });
});

adminUserRoutes.put("/admin/users/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.parseBody();
  const result = updateUserSchema.safeParse({
    username: String(body.username || "").trim() || undefined,
    email: String(body.email || "").trim().toLowerCase() || undefined,
    password: String(body.password || "") || undefined,
    role: String(body.role || "") || undefined,
    two_factor_enabled: body.two_factor_enabled !== undefined ? String(body.two_factor_enabled) : undefined,
  });

  if (!result.success) {
    return c.redirect("/admin/users?error=" + encodeURIComponent(result.error.issues.map(i => i.message).join(", ")));
  }

  const currentUser = getSession(c)!;

  const twoFactorValue = result.data.two_factor_enabled !== undefined ? Number(result.data.two_factor_enabled) : undefined;

  if (id === currentUser.id && twoFactorValue === 0) {
    return c.redirect("/admin/users?error=" + encodeURIComponent("Tidak bisa menonaktifkan 2FA untuk akun sendiri"));
  }

  const existingOtherId = getUserById(id);
  if (!existingOtherId) {
    return c.redirect("/admin/users?error=" + encodeURIComponent("User tidak ditemukan"));
  }

  const data: { username?: string; email?: string; password_hash?: string; role?: string; two_factor_enabled?: number } = {};
  
  if (result.data.username) data.username = result.data.username;
  if (result.data.email) data.email = result.data.email;
  if (result.data.password) data.password_hash = await Bun.password.hash(result.data.password, "bcrypt");
  if (result.data.role) data.role = result.data.role;
  if (twoFactorValue !== undefined) data.two_factor_enabled = twoFactorValue;

  updateUser(id, data);
  if (result.data.password || result.data.role) revokeUserSessions(id);
  addSecurityAuditLog({ user_id: currentUser.id, event: "admin.user_updated", user_agent: c.req.header("user-agent"), metadata: { target_user_id: id } });

  return c.redirect("/admin/users?success=" + encodeURIComponent("User berhasil diupdate"));
});

adminUserRoutes.delete("/admin/users/:id", authMiddleware, adminMiddleware, (c) => {
  const id = Number(c.req.param("id"));
  const currentUser = getSession(c)!;

  if (id === currentUser.id) {
    return c.redirect("/admin/users?error=" + encodeURIComponent("Tidak bisa menghapus akun sendiri"));
  }

  deleteUser(id);
  addSecurityAuditLog({ user_id: currentUser.id, event: "admin.user_deleted", user_agent: c.req.header("user-agent"), metadata: { target_user_id: id } });
  
  return c.redirect("/admin/users?success=" + encodeURIComponent("User berhasil dihapus"));
});

export default adminUserRoutes;
