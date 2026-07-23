export function getBunsocialConfig() {
  return {
    base_url: process.env.BUNSOCIAL_URL || "https://bunsocial.kumavps.my.id",
    api_key: process.env.BUNSOCIAL_API_KEY || "dev-key",
  };
}

interface BunsocialResponse<T> {
  success: boolean;
  data: T;
  meta: { requestId: string; timestamp: string };
  error?: { code: string; message: string; details: string };
}

const config = getBunsocialConfig();

async function request<T>(path: string, init?: RequestInit): Promise<BunsocialResponse<T>> {
  const res = await fetch(`${config.base_url}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.api_key,
      ...init?.headers,
    },
  });
  const json = await res.json() as BunsocialResponse<T>;
  if (!json.success) {
    throw new Error(json.error?.message || "Bunsocial request failed");
  }
  return json;
}

export async function signup(email: string, password: string) {
  return request<{ id: string; email: string; emailConfirmedAt: string | null; needsVerification: boolean }>(
    "/api/auth/signup",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
}

export async function verifyLink(url: string) {
  return request<{ verified: boolean; status: number; finalUrl: string }>(
    "/api/auth/verify-link",
    { method: "POST", body: JSON.stringify({ url }) }
  );
}

export async function getToken(email: string, password: string) {
  return request<{ accessToken: string; tokenType: string; expiresIn: number }>(
    "/api/auth/token",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
}

export async function getUserMe(accessToken: string) {
  return request<{ id: string; email: string; organizationId: string }>(
    "/api/user/me",
    { method: "POST", body: JSON.stringify({ accessToken }) }
  );
}

export async function setupProfile(accessToken: string, profile: {
  firstName: string;
  lastName: string;
  organizationName: string;
  timezone: string;
}) {
  return request<{ firstName: string; lastName: string; organizationName: string; timezone: string }>(
    "/api/user/me/setup",
    { method: "PATCH", body: JSON.stringify({ accessToken, profile }) }
  );
}

export async function createApiKey(accessToken: string, organizationId: string, name: string) {
  return request<{ id: string; name: string; key: string }>(
    "/api/api-keys",
    { method: "POST", body: JSON.stringify({ accessToken, organizationId, name }) }
  );
}

export async function createTeam(apiKey: string, name: string) {
  const res = await fetch("https://api.bundle.social/api/v1/team/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ name }),
  });
  const json = await res.json() as { id: string; name: string; organizationId: string };
  if (!json.id) {
    throw new Error(json as any ? (json as any).message || "Team creation failed" : "Team creation failed");
  }
  return json;
}