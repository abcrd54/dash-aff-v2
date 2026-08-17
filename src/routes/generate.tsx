import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getAffiliateAccounts, getGroupAutoPostConfigs, hasAnyAutoPostEnabled, hasAnyAutoGenerateEnabled, getUserPersonas } from "../lib/db";
import GeneratePage from "../views/generate/index";

const generateRoutes = new Hono();

generateRoutes.get("/generate", authMiddleware, (c) => {
  const user = getSession(c)!;
  const accounts = getAffiliateAccounts(user.id);
  const doneAccounts = accounts.filter((a) => a.status === "done");

  const uniqueIdentities = [...new Set(doneAccounts.map((a) => a.identity || "Uncategorized"))];

  const configs = getGroupAutoPostConfigs(user.id);
  const groups = uniqueIdentities.map((identity) => {
    const cfg = configs.find((c) => c.identity === identity);
    return {
      identity,
      niche: cfg?.niche || "",
      autoGenerateEnabled: cfg?.auto_generate_enabled === 1,
      autoPostEnabled: cfg?.auto_post_enabled === 1,
      dailyPostCount: cfg?.daily_post_count || 5,
      startTime: cfg?.start_time || "12:00",
    };
  });

  const personas = getUserPersonas(user.id).map((p) => ({
    id: p.persona_id,
    name: p.persona_name,
  }));

  const autoPostActive = hasAnyAutoPostEnabled(user.id);
  const autoGenerateActive = hasAnyAutoGenerateEnabled(user.id);

  const url = new URL(c.req.url);
  const error = url.searchParams.get("error") || undefined;
  const success = url.searchParams.get("success") || undefined;

  return c.html(
    <GeneratePage
      user={user}
      groups={groups}
      personas={personas}
      autoPostActive={autoPostActive}
      autoGenerateActive={autoGenerateActive}
      error={error}
      success={success}
    />
  );
});

generateRoutes.post("/api/generate/caption", authMiddleware, async (c) => {
  const body = await c.req.json();
  const personaId = body.personaId;
  const topic = body.topic;

  if (!personaId || !topic) {
    return c.json({ success: false, error: "Persona dan topik harus diisi" }, 400);
  }

  return c.json({
    success: false,
    error: "AI caption generation belum tersedia. Hubungkan persona service terlebih dahulu.",
  });
});

export default generateRoutes;