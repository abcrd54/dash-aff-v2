import { getAffiliateAccounts, getConnectionsByAccount, addPostLog } from "./db";

const BUNDLE_API = "https://api.bundle.social/api/v1";

interface PostPayload {
  teamId: string;
  title: string;
  postDate: string;
  status: "SCHEDULED";
  socialAccountTypes: string[];
  data: Record<string, any>;
  firstComment?: Record<string, string>;
}

interface PostResult {
  accountId: number;
  email: string;
  platforms: string[];
  success: boolean;
  bundlePostId?: string;
  error?: string;
}

async function bundlePost(apiKey: string, payload: PostPayload): Promise<{ id: string }> {
  const res = await fetch(`${BUNDLE_API}/post/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = {}; }

  if (!res.ok) {
    throw new Error(json.message || json.error || `Bundle API error ${res.status}`);
  }

  return json;
}

function buildPlatformData(
  platform: string,
  caption: string,
  options: {
    link: string;
    comment: string;
    placement: "caption" | "comment";
    channelId?: string | null;
    channelName?: string | null;
  }
): { data: Record<string, any>; firstComment?: Record<string, string> } {
  const { link, comment, placement, channelId, channelName } = options;
  const text = placement === "caption" && link ? `${caption}\n\n${link}` : caption;
  const data: Record<string, any> = {};
  const firstComment: Record<string, string> = {};

  switch (platform) {
    case "TWITTER":
      data[platform] = { text };
      break;

    case "FACEBOOK":
      data[platform] = {
        type: "POST",
        text,
        ...(link ? { link } : {}),
      };
      if (comment) {
        firstComment[platform] = placement === "comment" && link
          ? `${comment}\n\n${link}`
          : comment;
      }
      break;

    case "INSTAGRAM":
      data[platform] = {
        type: "POST",
        text,
      };
      if (comment) {
        firstComment[platform] = placement === "comment" && link
          ? `${comment}\n\n${link}`
          : comment;
      }
      break;

    case "TIKTOK":
      data[platform] = {
        type: "VIDEO",
        text,
        privacy: "PUBLIC_TO_EVERYONE",
      };
      break;

    case "PINTEREST":
      data[platform] = {
        text,
        description: caption,
        boardName: channelName || "Default",
        ...(link ? { link } : {}),
      };
      break;

    case "THREADS":
      data[platform] = { text };
      break;

    case "LINKEDIN":
      data[platform] = {
        text,
        ...(link ? { link } : {}),
      };
      break;

    case "YOUTUBE":
      data[platform] = {
        type: "SHORT",
        text,
      };
      break;

    case "REDDIT":
      data[platform] = {
        sr: channelName || "u_me",
        text,
        ...(link ? { link } : {}),
      };
      break;

    case "MASTODON":
      data[platform] = { text };
      break;

    case "BLUESKY":
      data[platform] = {
        text,
        ...(link ? { externalUrl: link, externalTitle: caption.slice(0, 100) } : {}),
      };
      break;

    case "GOOGLE_BUSINESS":
      data[platform] = {
        text,
        topicType: "STANDARD",
      };
      break;

    case "SNAPCHAT":
      data[platform] = {
        type: "STORY",
        text,
      };
      break;

    case "DISCORD":
      data[platform] = {
        channelId: channelId || "",
        text,
      };
      break;

    case "SLACK":
      data[platform] = {
        channelId: channelId || "",
        text,
      };
      break;

    default:
      data[platform] = { text };
  }

  return { data, firstComment: Object.keys(firstComment).length > 0 ? firstComment : undefined };
}

export async function sendPostToGroup(
  identity: string,
  caption: string,
  userId: number,
  options?: {
    link?: string;
    comment?: string;
    placement?: "caption" | "comment";
  }
): Promise<PostResult[]> {
  const accounts = getAffiliateAccounts(userId);
  const groupAccounts = accounts.filter(
    (a) => a.status === "done" && (a.identity || "Uncategorized") === identity && a.api_key && a.team_id
  );

  if (groupAccounts.length === 0) {
    throw new Error(`Tidak ada akun siap di grup "${identity}". Pastikan akun sudah dibuat dan platform terhubung.`);
  }

  const now = new Date().toISOString();
  const results: PostResult[] = [];

  for (const account of groupAccounts) {
    const connections = getConnectionsByAccount(account.id);
    const connected = connections.filter((c) => c.status === "connected");

    if (connected.length === 0) {
      results.push({
        accountId: account.id,
        email: account.email,
        platforms: [],
        success: false,
        error: "Tidak ada platform terhubung",
      });
      continue;
    }

    const platformTypes = connected.map((c) => c.platform.toUpperCase());
    const allData: Record<string, any> = {};
    const allFirstComments: Record<string, string> = {};

    const link = options?.link || "";
    const comment = options?.comment || "";
    const placement = options?.placement || "comment";

    for (const conn of connected) {
      const platform = conn.platform.toUpperCase();
      const { data, firstComment } = buildPlatformData(platform, caption, {
        link,
        comment,
        placement,
        channelId: conn.channel_id,
        channelName: conn.channel_name,
      });

      Object.assign(allData, data);
      if (firstComment) {
        Object.assign(allFirstComments, firstComment);
      }
    }

    try {
      const payload: PostPayload = {
        teamId: account.team_id!,
        title: `Post ${identity} - ${new Date().toLocaleDateString("id-ID")}`,
        postDate: now,
        status: "SCHEDULED",
        socialAccountTypes: platformTypes,
        data: allData,
      };

      if (Object.keys(allFirstComments).length > 0) {
        payload.firstComment = allFirstComments;
      }

      const result = await bundlePost(account.api_key!, payload);
      results.push({
        accountId: account.id,
        email: account.email,
        platforms: platformTypes,
        success: true,
        bundlePostId: result.id,
      });
      addPostLog({
        user_id: userId,
        group_name: identity,
        account_email: account.email,
        platforms: JSON.stringify(platformTypes),
        caption,
        status: "success",
        bundle_post_id: result.id,
      });
    } catch (e: any) {
      results.push({
        accountId: account.id,
        email: account.email,
        platforms: platformTypes,
        success: false,
        error: e.message,
      });
      addPostLog({
        user_id: userId,
        group_name: identity,
        account_email: account.email,
        platforms: JSON.stringify(platformTypes),
        caption,
        status: "failed",
        error: e.message,
      });
    }
  }

  return results;
}