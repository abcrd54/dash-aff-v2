import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context, Next } from "hono";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is required");
}

export interface JWTPayload {
  id: number;
  username: string;
  role: "admin" | "user";
}

export async function createToken(payload: JWTPayload): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 86400 })
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${header}.${body}`)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${header}.${body}.${sigB64}`;
}

export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = Uint8Array.from(atob(parts[2]), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(`${parts[0]}.${parts[1]}`)
    );

    if (!valid) return null;

    const payload = JSON.parse(atob(parts[1])) as JWTPayload & { exp: number };
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return { id: payload.id, username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}

export function getSession(c: Context): JWTPayload | null {
  return c.get("user") || null;
}

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, "session");

  if (!token) {
    return c.redirect("/login");
  }

  const payload = await verifyToken(token);
  if (!payload) {
    deleteCookie(c, "session");
    return c.redirect("/login");
  }

  c.set("user", payload);
  await next();
}

export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get("user") as JWTPayload | null;
  if (!user || user.role !== "admin") {
    return c.redirect("/dashboard");
  }
  await next();
}
