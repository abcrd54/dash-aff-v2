import { getCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import { getUserById } from "../lib/db";

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  role: "admin" | "user";
  two_factor_enabled: number;
}

export function getAuthUser(c: Context): AuthUser | null {
  return c.get("authUser") || null;
}

export function getSession(c: Context): AuthUser | null {
  return c.get("authUser") || null;
}

export async function authMiddleware(c: Context, next: Next) {
  const sessionStr = getCookie(c, "session");
  
  if (!sessionStr) {
    return c.redirect("/login");
  }

  try {
    const sessionData = JSON.parse(sessionStr) as { id: number; username: string; role: string; email?: string };
    
    if (!sessionData.id || !sessionData.username) {
      return c.redirect("/login");
    }

    const user = getUserById(sessionData.id);
    if (!user) {
      return c.redirect("/login");
    }

    if (user.username !== sessionData.username) {
      return c.redirect("/logout");
    }

    c.set("authUser", {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      two_factor_enabled: user.two_factor_enabled,
    });

    await next();
  } catch {
    return c.redirect("/login");
  }
}

export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get("authUser") as AuthUser | null;
  if (!user || user.role !== "admin") {
    return c.redirect("/dashboard");
  }
  await next();
}
