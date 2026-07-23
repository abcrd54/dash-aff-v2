import { getAffiliateAccounts, getConnection, createConnection, updateConnection, type AffiliateAccount } from "./db";
import { runOAuthFlow, parseCookies } from "./puppeteer";

interface BatchEvent {
  accountIndex: number;
  accountName: string;
  step: string;
  status: string;
  detail?: string;
}

const PLATFORMS = [
  "TWITTER", "FACEBOOK", "INSTAGRAM", "TIKTOK", "THREADS",
  "PINTEREST", "LINKEDIN", "YOUTUBE", "REDDIT", "DISCORD",
  "SLACK", "MASTODON", "BLUESKY", "GOOGLE_BUSINESS", "SNAPCHAT",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export function getPlatformList(): readonly string[] {
  return PLATFORMS;
}

async function getOAuthUrl(
  apiKey: string,
  teamId: string,
  platform: string,
  redirectUrl: string
): Promise<string> {
  const platformType = platform.toLowerCase();
  const res = await fetch("https://api.bundle.social/api/v1/social-account/connect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      type: platformType,
      teamId,
      redirectUrl,
    }),
  });
  const json = await res.json() as { url?: string; message?: string };
  if (!json.url) {
    throw new Error(json.message || `Failed to get OAuth URL for ${platformType}`);
  }
  return json.url;
}

export async function* massConnectPlatform(
  userId: number,
  platform: string,
  accountIds: number[],
  cookies: string
): AsyncGenerator<BatchEvent> {
  const accounts = getAffiliateAccounts(userId).filter((a) =>
    accountIds.includes(a.id) && a.status === "done" && a.team_id && a.api_key
  );

  let connected = 0;
  let failed = 0;

  const parsedCookies = parseCookies(cookies, platform);

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    const idx = i + 1;

    const existing = getConnection(acc.id, platform);
    if (existing && existing.status === "connected") {
      yield { accountIndex: idx, accountName: acc.name, step: "skip", status: "done", detail: "Already connected" };
      connected++;
      continue;
    }

    let conn = existing;
    if (!conn) {
      conn = createConnection(acc.id, platform);
    }

    yield { accountIndex: idx, accountName: acc.name, step: "oauth", status: "running", detail: "Getting OAuth URL..." };

    try {
      const redirectUrl = `https://bundle.social/dashboard?teamId=${acc.team_id}`;
      const oauthUrl = await getOAuthUrl(acc.api_key!, acc.team_id!, platform, redirectUrl);

      yield { accountIndex: idx, accountName: acc.name, step: "oauth", status: "running", detail: "Opening OAuth..." };

      const result = await runOAuthFlow(oauthUrl, parsedCookies, platform);

      if (result.success) {
        updateConnection(acc.id, platform, {
          status: "connected",
          social_account_id: result.socialAccountId || null,
          username: result.username || null,
        });
        yield { accountIndex: idx, accountName: acc.name, step: "connect", status: "done", detail: "Connected" };
        connected++;
      } else {
        updateConnection(acc.id, platform, { status: "failed", error: result.error });
        yield { accountIndex: idx, accountName: acc.name, step: "connect", status: "failed", detail: result.error || "OAuth failed" };
        failed++;
      }
    } catch (e: any) {
      updateConnection(acc.id, platform, { status: "failed", error: e.message });
      yield { accountIndex: idx, accountName: acc.name, step: "error", status: "failed", detail: e.message };
      failed++;
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  yield { accountIndex: 0, accountName: "System", step: "complete", status: "done", detail: `${connected} connected, ${failed} failed` };
}