export function getKumailConfig() {
  return {
    base_url: process.env.KUMAIL_URL || "http://localhost:3000",
    api_key: process.env.KUMAIL_API_KEY || "dev-key",
  };
}

export interface KumailMailbox {
  address: string;
}

export interface KumailMessage {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
}

export interface KumailMessageDetail {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
  html: string;
  text: string;
}

export interface KumailResponse<T> {
  success: boolean;
  data: T;
  meta: { requestId: string; timestamp: string };
  error?: { code: string; message: string; details: string };
}

const config = getKumailConfig();

async function request<T>(path: string, init?: RequestInit): Promise<KumailResponse<T>> {
  const res = await fetch(`${config.base_url}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.api_key,
      ...init?.headers,
    },
  });
  const json = await res.json() as KumailResponse<T>;
  if (!json.success) {
    throw new Error(json.error?.message || "Kumail request failed");
  }
  return json;
}

export async function generateMailbox(domains: string[]): Promise<string> {
  const res = await request<KumailMailbox>("/api/v1/mailboxes/random", {
    method: "POST",
    body: JSON.stringify({ domains }),
  });
  return res.data.address;
}

export async function checkMessages(address: string): Promise<KumailMessage[]> {
  const res = await request<{ address: string; messages: KumailMessage[] }>(
    "/api/v1/mailboxes/messages",
    {
      method: "POST",
      body: JSON.stringify({ address }),
    }
  );
  return res.data.messages || [];
}

export async function getMessageDetail(address: string, id: string): Promise<KumailMessageDetail> {
  const res = await request<{ address: string; message: KumailMessageDetail }>(
    "/api/v1/mailboxes/messages/detail",
    {
      method: "POST",
      body: JSON.stringify({ address, id }),
    }
  );
  return res.data.message;
}