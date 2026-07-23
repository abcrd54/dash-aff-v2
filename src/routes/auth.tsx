import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import LoginPage from "../views/login";
import { createToken } from "../middleware/auth";
import { getUserByUsername } from "../lib/db";

const authRoutes = new Hono();

authRoutes.get("/login", (c) => {
  return c.html(<LoginPage />);
});

authRoutes.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password) {
    return c.html(<LoginPage error="Username dan password wajib diisi." />);
  }

  const user = getUserByUsername(username);
  if (!user || !(await Bun.password.verify(password, user.password_hash, "bcrypt"))) {
    return c.html(<LoginPage error="Username atau password salah." />);
  }

  const token = await createToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });

  setCookie(c, "session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 86400,
  });

  return c.redirect("/dashboard");
});

authRoutes.get("/logout", (c) => {
  deleteCookie(c, "session", {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    httpOnly: true,
  });
  return c.redirect("/login");
});

export default authRoutes;
