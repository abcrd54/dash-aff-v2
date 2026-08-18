import { getCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import { getUserById } from "../lib/db";

const SESSION_SECRET = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "fallback-secret-change-me";

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

async function signPayload(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET).slice(0, 32),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function verifyPayload(payload: string, signature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SESSION_SECRET).slice(0, 32),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
    return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payload));
  } catch {
    return false;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const sessionStr = getCookie(c, "session");
  
  if (!sessionStr) {
    return c.redirect("/login");
  }

  try {
    const parts = sessionStr.split(".");
    if (parts.length !== 2) {
      return c.redirect("/login");
    }

    const [payload, signature] = parts;
    const valid = await verifyPayload(payload, signature);
    if (!valid) {
      return c.redirect("/login");
    }

    const sessionData = JSON.parse(atob(payload)) as { id: number; username: string; role: string; email?: string };
    
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

export async function createSessionCookie(payload: { id: number; username: string; role: string; email?: string | null }): Promise<string> {
  const encoded = btoa(JSON.stringify(payload));
  const sig = await signPayload(encoded);
  return `${encoded}.${sig}`;
}