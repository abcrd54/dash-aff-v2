import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { authMiddleware, getSession } from "../middleware/auth";
import { getAffiliateAccounts, getConnectionsByAccount, getSocialPosts, createSocialPost, deleteSocialPost, getUserPersonas, getGroupAutoPostConfigs, ensureGroupAutoPostConfig, updateGroupAutoPostConfig, hasAnyAutoPostEnabled, hasAnyAutoGenerateEnabled, getPostLogs } from "../lib/db";
import { sendPostToGroup } from "../lib/auto-post";
import PostPage from "../views/post/index";
import PostLogsPage from "../views/post/logs";

const postRoutes = new Hono();

postRoutes.get("/post", authMiddleware, (c) => {
  const user = getSession(c)!;
  const posts = getSocialPosts(user.id);

  const accounts = getAffiliateAccounts(user.id);
  const doneAccounts = accounts.filter((a) => a.status === "done");

  const groups = doneAccounts.map((a) => {
    const conns = getConnectionsByAccount(a.id);
    const connected = conns.filter((conn) => conn.status === "connected");
    return {
      identity: a.identity || "Uncategorized",
      accountId: a.id,
      email: a.email,
      platforms: connected.map((conn) => conn.platform),
    };
  });

  const grouped = groups.reduce((acc, g) => {
    const existing = acc.find((x) => x.identity === g.identity);
    if (existing) {
      existing.accounts.push({ id: g.accountId, email: g.email, platforms: g.platforms });
      existing.totalAccounts += 1;
      existing.totalPlatforms += g.platforms.length;
    } else {
      acc.push({
        identity: g.identity,
        accounts: [{ id: g.accountId, email: g.email, platforms: g.platforms }],
        totalAccounts: 1,
        totalPlatforms: g.platforms.length,
        monthlyCapacity: g.platforms.length * 20,
      });
    }
    return acc;
  }, [] as Array<{ identity: string; accounts: Array<{ id: number; email: string; platforms: string[] }>; totalAccounts: number; totalPlatforms: number; monthlyCapacity: number }>);

  const configs = getGroupAutoPostConfigs(user.id);
  const groupConfigs = grouped.map((g) => {
    const cfg = configs.find((c) => c.identity === g.identity);
    return {
      identity: g.identity,
      niche: cfg?.niche || "",
      autoPostEnabled: cfg?.auto_post_enabled === 1,
      autoGenerateEnabled: cfg?.auto_generate_enabled === 1,
      dailyPostCount: cfg?.daily_post_count || 5,
      startTime: cfg?.start_time || "12:00",
      useDefaultSchedule: cfg?.use_default_schedule !== 0,
    };
  });

  const personas = getUserPersonas(user.id).map((p) => ({
    id: p.persona_id,
    name: p.persona_name,
  }));

  const personaMap = new Map(personas.map((p) => [p.id, p.name]));
  const postList = posts.map((p) => ({
    id: p.id,
    caption: p.caption,
    comment: p.comment,
    link: p.link,
    image: p.image,
    placement: p.placement,
    groupName: p.group_name,
    status: p.status,
    personaName: p.persona_id ? personaMap.get(p.persona_id) ?? null : null,
    created_at: p.created_at,
  }));

  const autoPostActive = hasAnyAutoPostEnabled(user.id);
  const autoGenerateActive = hasAnyAutoGenerateEnabled(user.id);

  return c.html(
    <PostPage
      user={user}
      groups={grouped}
      groupConfigs={groupConfigs}
      posts={postList}
      personas={personas}
      autoPostActive={autoPostActive}
      autoGenerateActive={autoGenerateActive}
    />
  );
});

postRoutes.get("/api/post/list", authMiddleware, (c) => {
  const user = getSession(c)!;
  const posts = getSocialPosts(user.id);
  return c.json({ success: true, data: posts });
});

postRoutes.post("/api/post/save", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.json();

  const caption = body.caption;
  if (!caption) {
    return c.json({ success: false, error: "Caption harus diisi" }, 400);
  }

  try {
    const post = createSocialPost({
      user_id: user.id,
      group_name: body.groupName || "Uncategorized",
      caption: caption,
      comment: body.comment || "",
      link: body.link || "",
      placement: body.placement || "comment",
      persona_id: body.personaId || null,
    });

    return c.json({ success: true, data: post });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

postRoutes.post("/api/post/generate-caption", authMiddleware, (c) => {
  return c.json({
    success: false,
    error: "AI caption generation belum tersedia. Hubungkan persona AI terlebih dahulu.",
  });
});

postRoutes.delete("/api/post/:id", authMiddleware, (c) => {
  const id = Number(c.req.param("id"));
  if (!id || isNaN(id)) {
    return c.json({ success: false, error: "ID tidak valid" }, 400);
  }

  const ok = deleteSocialPost(id);
  if (!ok) {
    return c.json({ success: false, error: "Post tidak ditemukan" }, 404);
  }
  return c.json({ success: true });
});

postRoutes.post("/api/post/auto-config", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.json();
  const identity = body.identity;
  if (!identity) {
    return c.json({ success: false, error: "Grup harus dipilih" }, 400);
  }

  ensureGroupAutoPostConfig(user.id, identity);
  updateGroupAutoPostConfig(user.id, identity, {
    niche: body.niche || "",
    auto_post_enabled: body.autoPostEnabled ? 1 : 0,
    auto_generate_enabled: body.autoGenerateEnabled ? 1 : 0,
    daily_post_count: Number(body.dailyPostCount) || 5,
    start_time: body.startTime || "12:00",
    use_default_schedule: body.useDefaultSchedule ? 1 : 0,
  });

  return c.json({ success: true });
});

postRoutes.post("/api/post/send", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.json();

  const identity = body.groupName;
  if (!identity) {
    return c.json({ success: false, error: "Grup harus dipilih" }, 400);
  }

  const caption = body.caption;
  if (!caption) {
    return c.json({ success: false, error: "Caption harus diisi" }, 400);
  }

  try {
    const results = await sendPostToGroup(identity, caption, user.id, {
      link: body.link || "",
      comment: body.comment || "",
      placement: body.placement || "comment",
    });
    return c.json({ success: true, data: results });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

postRoutes.post("/api/post/send/stream", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.json();

  const identity = body.groupName;
  if (!identity) {
    return c.json({ success: false, error: "Grup harus dipilih" }, 400);
  }

  const caption = body.caption;
  if (!caption) {
    return c.json({ success: false, error: "Caption harus diisi" }, 400);
  }

  return streamSSE(c, async (stream) => {
    stream.writeSSE({ event: "start", data: JSON.stringify({ identity }) });

    const results = await sendPostToGroup(identity, caption, user.id, {
      link: body.link || "",
      comment: body.comment || "",
      placement: body.placement || "comment",
    });

    for (const result of results) {
      stream.writeSSE({ event: "result", data: JSON.stringify(result) });
    }

    stream.writeSSE({ event: "done", data: JSON.stringify({ total: results.length }) });
  });
});

postRoutes.get("/post-logs", authMiddleware, (c) => {
  const user = getSession(c)!;
  const logs = getPostLogs(user.id);
  const autoPostActive = hasAnyAutoPostEnabled(user.id);
  const autoGenerateActive = hasAnyAutoGenerateEnabled(user.id);
  return c.html(
    <PostLogsPage user={user} logs={logs} />
  );
});

export default postRoutes;