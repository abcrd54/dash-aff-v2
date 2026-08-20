import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { authMiddleware, getSession } from "../middleware/auth";
import { updateUser, getUserByUsername, getUserById, ensureJadiapaConfig, revokeUserSessions, addSecurityAuditLog } from "../lib/db";
import { createSessionCookie } from "../middleware/auth";
import { changePasswordSchema, setEmailSchema, changeUsernameSchema } from "../lib/validate";
import AccountPage from "../views/account/index";
import ManageAccountPage from "../views/account/manage";

const accountRoutes = new Hono();

async function refreshCurrentSession(c: any, userId: number) {
  const user = getUserById(userId)!;
  setCookie(c, "session", await createSessionCookie({
    id: user.id, username: user.username, role: user.role, email: user.email,
    session_version: user.session_version,
  }), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict", path: "/", maxAge: 86400,
  });
}

accountRoutes.get("/account", authMiddleware, (c) => {
  const user = getSession(c)!;
  const jadiapa = ensureJadiapaConfig(user.id);
  const url = new URL(c.req.url);
  const error = url.searchParams.get("error") || undefined;
  const success = url.searchParams.get("success") || undefined;

  const fullUser = getUserByUsername(user.username);

  return c.html(
    <AccountPage
      user={user}
      error={error}
      success={success}
      jadiapa={{
        balance: jadiapa.balance || "0",
        usageImages: jadiapa.usage_images || 0,
        usageVideos: jadiapa.usage_videos || 0,
        lastChecked: jadiapa.last_checked_at || "Belum pernah",
      }}
      email={fullUser?.email || null}
      twoFactorEnabled={fullUser?.two_factor_enabled || 0}
    />
  );
});

accountRoutes.post("/account/password", authMiddleware, async (c) => {
  const sessionUser = getSession(c)!;
  const body = await c.req.parseBody();
  const result = changePasswordSchema.safeParse({
    current_password: String(body.current_password || ""),
    new_password: String(body.new_password || ""),
  });

  if (!result.success) {
    return c.redirect("/account?error=" + encodeURIComponent(result.error.issues.map(i => i.message).join(", ")));
  }

  const { current_password, new_password } = result.data;

  const fullUser = getUserByUsername(sessionUser.username);
  if (!fullUser || !(await Bun.password.verify(current_password, fullUser.password_hash, "bcrypt"))) {
    return c.redirect("/account?error=" + encodeURIComponent("Password lama salah."));
  }

  const newHash = await Bun.password.hash(new_password, "bcrypt");
  updateUser(sessionUser.id, { password_hash: newHash });
  revokeUserSessions(sessionUser.id);
  await refreshCurrentSession(c, sessionUser.id);
  addSecurityAuditLog({ user_id: sessionUser.id, event: "account.password_changed", user_agent: c.req.header("user-agent") });

  return c.redirect("/account?success=" + encodeURIComponent("Password berhasil diubah!"));
});

accountRoutes.post("/account/email", authMiddleware, async (c) => {
  const sessionUser = getSession(c)!;
  const body = await c.req.parseBody();
  const result = setEmailSchema.safeParse({ email: String(body.email || "").trim().toLowerCase() });

  if (!result.success) {
    return c.redirect("/account?error=" + encodeURIComponent(result.error.issues.map(i => i.message).join(", ")));
  }

  updateUser(sessionUser.id, { email: result.data.email });
  revokeUserSessions(sessionUser.id);
  await refreshCurrentSession(c, sessionUser.id);
  addSecurityAuditLog({ user_id: sessionUser.id, event: "account.email_changed", user_agent: c.req.header("user-agent") });

  return c.redirect("/account?success=" + encodeURIComponent("Email berhasil diatur!"));
});

accountRoutes.post("/account/two-factor", authMiddleware, async (c) => {
  const sessionUser = getSession(c)!;
  const fullUser = getUserByUsername(sessionUser.username);

  if (!fullUser?.email) {
    return c.redirect("/account?error=" + encodeURIComponent("Email belum diatur. Silakan atur email dulu."));
  }

  const newValue = fullUser.two_factor_enabled === 1 ? 0 : 1;
  updateUser(sessionUser.id, { two_factor_enabled: newValue });
  revokeUserSessions(sessionUser.id);
  await refreshCurrentSession(c, sessionUser.id);
  addSecurityAuditLog({ user_id: sessionUser.id, event: "account.two_factor_changed", user_agent: c.req.header("user-agent"), metadata: { enabled: newValue === 1 } });

  const status = newValue === 1 ? "diaktifkan" : "dinonaktifkan";
  return c.redirect("/account?success=" + encodeURIComponent(`2FA ${status}.`));
});

accountRoutes.get("/manage-account", authMiddleware, (c) => {
  const user = getSession(c)!;
  const fullUser = getUserByUsername(user.username);
  const error = c.req.query("error") || undefined;
  const success = c.req.query("success") || undefined;
  return c.html(
    <ManageAccountPage
      user={user}
      email={fullUser?.email || null}
      twoFactorEnabled={fullUser?.two_factor_enabled || 0}
      error={error}
      success={success}
    />
  );
});

accountRoutes.post("/manage-account", authMiddleware, async (c) => {
  const sessionUser = getSession(c)!;
  const body = await c.req.parseBody();
  const result = changeUsernameSchema.safeParse({
    username: String(body.username || "").trim(),
    password: String(body.password || ""),
  });

  if (!result.success) {
    return c.redirect("/manage-account?error=" + encodeURIComponent(result.error.issues.map(i => i.message).join(", ")));
  }

  const { username: newUsername, password } = result.data;

  const fullUser = getUserByUsername(sessionUser.username);
  if (!fullUser || !(await Bun.password.verify(password, fullUser.password_hash, "bcrypt"))) {
    return c.redirect("/manage-account?error=" + encodeURIComponent("Password salah."));
  }

  const existing = getUserByUsername(newUsername);
  if (existing && existing.id !== sessionUser.id) {
    return c.redirect("/manage-account?error=" + encodeURIComponent("Username sudah digunakan."));
  }

  updateUser(sessionUser.id, { username: newUsername });

  return c.redirect("/manage-account?success=" + encodeURIComponent("Username berhasil diubah! Logout dan login ulang."));
});

export default accountRoutes;
