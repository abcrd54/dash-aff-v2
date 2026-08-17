import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { authMiddleware, getSession, createToken } from "../middleware/auth";
import { updateUser, getUserByUsername, ensureJadiapaConfig } from "../lib/db";
import AccountPage from "../views/account/index";
import ManageAccountPage from "../views/account/manage";

const accountRoutes = new Hono();

accountRoutes.get("/account", authMiddleware, (c) => {
  const user = getSession(c)!;
  const jadiapa = ensureJadiapaConfig(user.id);
  const url = new URL(c.req.url);
  const error = url.searchParams.get("error") || undefined;
  const success = url.searchParams.get("success") || undefined;

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
    />
  );
});

accountRoutes.post("/account/password", authMiddleware, async (c) => {
  const sessionUser = getSession(c)!;
  const body = await c.req.parseBody();
  const currentPassword = String(body.current_password || "");
  const newPassword = String(body.new_password || "");

  if (!currentPassword || !newPassword) {
    return c.redirect("/account?error=" + encodeURIComponent("Semua field wajib diisi."));
  }

  if (newPassword.length < 6) {
    return c.redirect("/account?error=" + encodeURIComponent("Password baru minimal 6 karakter."));
  }

  const fullUser = getUserByUsername(sessionUser.username);
  if (!fullUser || !(await Bun.password.verify(currentPassword, fullUser.password_hash, "bcrypt"))) {
    return c.redirect("/account?error=" + encodeURIComponent("Password lama salah."));
  }

  const newHash = await Bun.password.hash(newPassword, "bcrypt");
  updateUser(sessionUser.id, { password_hash: newHash });

  return c.redirect("/account?success=" + encodeURIComponent("Password berhasil diubah!"));
});

accountRoutes.get("/manage-account", authMiddleware, (c) => {
  const user = getSession(c)!;
  return c.html(<ManageAccountPage user={user} />);
});

accountRoutes.post("/manage-account", authMiddleware, async (c) => {
  const sessionUser = getSession(c)!;
  const body = await c.req.parseBody();
  const password = String(body.password || "");
  const newUsername = String(body.username || "").trim();

  if (!password || !newUsername) {
    return c.redirect("/manage-account?error=" + encodeURIComponent("Semua field wajib diisi."));
  }

  if (newUsername.length < 3) {
    return c.redirect("/manage-account?error=" + encodeURIComponent("Username minimal 3 karakter."));
  }

  const fullUser = getUserByUsername(sessionUser.username);
  if (!fullUser || !(await Bun.password.verify(password, fullUser.password_hash, "bcrypt"))) {
    return c.redirect("/manage-account?error=" + encodeURIComponent("Password salah."));
  }

  const existing = getUserByUsername(newUsername);
  if (existing && existing.id !== sessionUser.id) {
    return c.redirect("/manage-account?error=" + encodeURIComponent("Username sudah digunakan."));
  }

  updateUser(sessionUser.id, { username: newUsername });

  const newToken = await createToken({
    id: sessionUser.id,
    username: newUsername,
    role: sessionUser.role,
  });

  setCookie(c, "session", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 86400,
  });

  return c.redirect("/manage-account?success=" + encodeURIComponent("Username berhasil diubah!"));
});

export default accountRoutes;