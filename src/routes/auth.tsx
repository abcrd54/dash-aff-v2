import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import LoginPage from "../views/login";
import VerifyOtpPage from "../views/login-verify";
import { getUserByEmail } from "../lib/db";
import { getDB } from "../db";
import { sendOTP } from "../lib/email";
import { loginSchema, otpSchema } from "../lib/validate";
import { createSessionCookie } from "../middleware/auth";

const authRoutes = new Hono();

function getPendingOTP(userId: number, otp: string): boolean {
  const db = getDB();

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const record = db
    .query("SELECT id FROM verification WHERE identifier = ? AND value = ? AND expires_at > ?")
    .get(`2fa_${userId}`, otp, now);

  if (record) {
    db.query("DELETE FROM verification WHERE identifier = ?").run(`2fa_${userId}`);
    return true;
  }

  return false;
}

function storeOTP(userId: number, otp: string): void {
  const db = getDB();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

  db.query("DELETE FROM verification WHERE identifier = ?").run(`2fa_${userId}`);

  db.query("INSERT INTO verification (id, identifier, value, expires_at) VALUES (?, ?, ?, ?)").run(
    crypto.randomUUID(),
    `2fa_${userId}`,
    otp,
    expiresAt
  );
}

authRoutes.get("/login", (c) => {
  return c.html(<LoginPage />);
});

authRoutes.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const result = loginSchema.safeParse({ email: String(body.email || "").trim().toLowerCase(), password: String(body.password || "") });

  if (!result.success) {
    return c.html(<LoginPage error={result.error.issues.map(i => i.message).join(", ")} />);
  }

  const { email, password } = result.data;

  const user = getUserByEmail(email);
  if (!user || !(await Bun.password.verify(password, user.password_hash, "bcrypt"))) {
    return c.html(<LoginPage error="Email atau password salah." />);
  }

  if (!user.email) {
    setCookie(c, "pending_user_id", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 900,
    });
    return c.html(
      <LoginPage
        error=""
        showSetEmail={true}
        userId={user.id}
        username={user.username}
      />
    );
  }

  if (!user.two_factor_enabled) {
    return c.redirect(`/account?error=${encodeURIComponent("2FA belum diaktifkan. Silakan atur email dan aktifkan di halaman Akun.")}`);
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  storeOTP(user.id, otp);

  const emailSent = await sendOTP(user.email, otp, user.username);
  if (!emailSent) {
    return c.html(<LoginPage error="Gagal mengirim OTP. Periksa konfigurasi email server." />);
  }

  setCookie(c, "pending_user_id", String(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",
    maxAge: 900,
  });

  return c.redirect("/login/verify-otp");
});

authRoutes.get("/login/verify-otp", (c) => {
  const error = c.req.query("error") || "";
  return c.html(<VerifyOtpPage error={error} />);
});

authRoutes.post("/login/verify-otp", async (c) => {
  const body = await c.req.parseBody();
  const otp = String(body.otp || "").trim();

  const userIdStr = getCookie(c, "pending_user_id");
  if (!userIdStr) {
    return c.redirect("/login?error=" + encodeURIComponent("Session expired. Silakan login ulang."));
  }

  const userId = parseInt(userIdStr, 10);
  if (isNaN(userId)) {
    return c.redirect("/login?error=" + encodeURIComponent("Session expired."));
  }

  const otpResult = otpSchema.safeParse({ otp });
  if (!otpResult.success) {
    return c.redirect("/login/verify-otp?error=" + encodeURIComponent("Kode OTP harus 6 digit angka."));
  }

  const dbUser = getDB()
    .query("SELECT id, username, email, role FROM users WHERE id = ?")
    .get(userId) as { id: number; username: string; email: string | null; role: string } | undefined;

  if (!dbUser) {
    return c.redirect("/login?error=" + encodeURIComponent("User tidak ditemukan."));
  }

  const valid = getPendingOTP(userId, otpResult.data.otp);

  deleteCookie(c, "pending_user_id", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  if (!valid) {
    return c.redirect("/login/verify-otp?error=" + encodeURIComponent("Kode OTP salah atau sudah kadaluarsa."));
  }

  setCookie(c, "session", await createSessionCookie({
    id: dbUser.id,
    username: dbUser.username,
    role: dbUser.role,
    email: dbUser.email,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",
    maxAge: 86400,
  });

  return c.redirect("/dashboard");
});

authRoutes.get("/logout", (c) => {
  deleteCookie(c, "session", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  deleteCookie(c, "pending_user_id", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  return c.redirect("/login");
});

export default authRoutes;
