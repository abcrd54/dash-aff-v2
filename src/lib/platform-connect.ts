import { getConnection, createConnection, updateConnection, deleteConnection } from "./db";

const BUNDLE_API = "https://api.bundle.social/api/v1";

const PLATFORMS = [
  "TWITTER", "FACEBOOK", "INSTAGRAM", "TIKTOK", "THREADS",
  "PINTEREST", "LINKEDIN", "YOUTUBE", "REDDIT", "DISCORD",
  "SLACK", "MASTODON", "BLUESKY", "GOOGLE_BUSINESS", "SNAPCHAT",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export function getPlatformList(): readonly string[] {
  return PLATFORMS;
}

const NEEDS_CHANNEL: Record<string, boolean> = {
  FACEBOOK: true,
  INSTAGRAM: true,
  LINKEDIN: true,
  YOUTUBE: true,
  GOOGLE_BUSINESS: true,
};

export function platformNeedsChannel(platform: string): boolean {
  return NEEDS_CHANNEL[platform.toUpperCase()] || false;
}

async function bundleFetch(
  path: string,
  init: RequestInit & { apiKey: string; teamId?: string }
): Promise<any> {
  const { apiKey, teamId, ...fetchInit } = init;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    ...(fetchInit.headers as Record<string, string> || {}),
  };

  const url = `${BUNDLE_API}${path}`;
  const res = await fetch(url, { ...fetchInit, headers });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = {}; }

  if (!res.ok) {
    throw new Error(json.message || json.error || `Bundle API error ${res.status}`);
  }

  return json;
}

export async function createPortalLink(
  apiKey: string,
  teamId: string,
  platform: string,
  redirectUrl: string
): Promise<string> {
  const json = await bundleFetch("/social-account/create-portal-link", {
    method: "POST",
    apiKey,
    body: JSON.stringify({
      teamId,
      redirectUrl,
      socialAccountTypes: [platform.toUpperCase()],
      withBusinessScope: true,
    }),
  });
  return json.url;
}

export async function getSocialAccount(
  apiKey: string,
  teamId: string,
  platform: string
): Promise<{
  id: string;
  type: string;
  username: string;
  channels: Array<{ id: string; name: string; type?: string }>;
  channelId: string | null;
  channelName: string | null;
} | null> {
  try {
    const json = await bundleFetch(
      `/social-account/by-type?type=${platform.toUpperCase()}&teamId=${teamId}`,
      { method: "GET", apiKey }
    );
    return json.socialAccount || json.data || null;
  } catch {
    return null;
  }
}

export async function setChannel(
  apiKey: string,
  teamId: string,
  platform: string,
  channelId: string
): Promise<void> {
  await bundleFetch("/social-account/set-channel", {
    method: "POST",
    apiKey,
    body: JSON.stringify({
      type: platform.toUpperCase(),
      teamId,
      channelId,
    }),
  });
}

export async function refreshChannels(
  apiKey: string,
  teamId: string,
  platform: string
): Promise<void> {
  await bundleFetch("/social-account/refresh-channels", {
    method: "POST",
    apiKey,
    body: JSON.stringify({
      type: platform.toUpperCase(),
      teamId,
    }),
  });
}

export async function disconnectSocialAccount(
  apiKey: string,
  teamId: string,
  platform: string
): Promise<void> {
  await bundleFetch("/social-account/disconnect", {
    method: "DELETE",
    apiKey,
    body: JSON.stringify({
      type: platform.toUpperCase(),
      teamId,
    }),
  });
}

export async function checkAndSyncConnection(
  accountId: number,
  apiKey: string,
  teamId: string,
  platform: string
): Promise<{ status: string; channels?: any[]; username?: string }> {
  const sa = await getSocialAccount(apiKey, teamId, platform);

  if (!sa) {
    const conn = getConnection(accountId, platform);
    if (conn && conn.status === "connected") {
      updateConnection(accountId, platform, { status: "disconnected" });
    }
    return { status: "not_connected" };
  }

  const needsChannel = platformNeedsChannel(platform);
  const hasChannel = sa.channelId && sa.channelName;

  if (needsChannel && !hasChannel) {
    updateConnection(accountId, platform, {
      status: "connected",
      social_account_id: sa.id,
      username: sa.username,
      channels: JSON.stringify(sa.channels || []),
    });
    return {
      status: "needs_channel",
      channels: sa.channels || [],
      username: sa.username,
    };
  }

  updateConnection(accountId, platform, {
    status: "connected",
    social_account_id: sa.id,
    username: sa.username,
    channel_id: sa.channelId,
    channel_name: sa.channelName,
    channels: JSON.stringify(sa.channels || []),
  });

  return {
    status: "connected",
    channels: sa.channels || [],
    username: sa.username,
  };
}

export async function syncChannel(
  accountId: number,
  apiKey: string,
  teamId: string,
  platform: string,
  channelId: string,
  channelName: string
): Promise<void> {
  await setChannel(apiKey, teamId, platform, channelId);
  updateConnection(accountId, platform, {
    channel_id: channelId,
    channel_name: channelName,
  });
}

export async function syncDisconnect(
  accountId: number,
  apiKey: string,
  teamId: string,
  platform: string
): Promise<void> {
  try {
    await disconnectSocialAccount(apiKey, teamId, platform);
  } catch {
    // disconnect might fail if already disconnected, that's ok
  }
  deleteConnection(accountId, platform);
}