import { getCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import { getUserById } from "../lib/db";

const configuredSecret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET;
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("BETTER_AUTH_SECRET or JWT_SECRET must be at least 32 characters in production");
}
export const SESSION_SECRET = configuredSecret || crypto.randomUUID();

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  role: "admin" | "user";
  two_factor_enabled: number;
  session_version: number;
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

export interface SessionPayload {
  id: number;
  username: string;
  role: string;
  email?: string | null;
  exp: number;
  iat: number;
  sv: number;
}

export async function verifySessionCookie(sessionStr: string): Promise<SessionPayload | null> {
  try {
    const parts = sessionStr.split(".");
    if (parts.length !== 2 || !(await verifyPayload(parts[0], parts[1]))) return null;
    const data = JSON.parse(atob(parts[0])) as SessionPayload;
    if (!data.id || !data.username || !data.exp || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
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

    const sessionData = JSON.parse(atob(payload)) as { id: number; username: string; role: string; email?: string; exp?: number; sv?: number };
    
    if (!sessionData.id || !sessionData.username || !sessionData.exp || sessionData.exp <= Math.floor(Date.now() / 1000)) {
      return c.redirect("/login");
    }

    const user = getUserById(sessionData.id);
    if (!user) {
      return c.redirect("/login");
    }

    if (user.username !== sessionData.username) {
      return c.redirect("/logout");
    }
    if (sessionData.sv !== user.session_version) {
      return c.redirect("/login");
    }

    c.set("authUser", {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      two_factor_enabled: user.two_factor_enabled,
      session_version: user.session_version,
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

export async function createSessionCookie(
  payload: { id: number; username: string; role: string; email?: string | null; session_version: number },
  ttlSeconds = 60 * 60 * 24
): Promise<string> {
  const encoded = btoa(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    sv: payload.session_version,
  }));
  const sig = await signPayload(encoded);
  return `${encoded}.${sig}`;
}
