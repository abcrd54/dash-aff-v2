import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getAffiliateAccounts, getGroupAutoPostConfig, getGroupAutoPostConfigs, getUserPersonas, ensureGroupAutoPostConfig, updateGroupAutoPostConfig, hasAnyAutoPostEnabled, hasAnyAutoGenerateEnabled } from "../lib/db";
import { generatePersonaCaption } from "../lib/persona-caption";
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
      isPersona: cfg ? cfg.is_persona === 1 : true,
      autoGenerateEnabled: cfg?.auto_generate_enabled === 1,
      autoPostEnabled: cfg?.auto_post_enabled === 1,
      dailyPostCount: cfg?.daily_post_count || 5,
      startTime: cfg?.start_time || "12:00",
    };
  });

  const autoPostActive = hasAnyAutoPostEnabled(user.id);
  const autoGenerateActive = hasAnyAutoGenerateEnabled(user.id);
  const personas = getUserPersonas(user.id).map((persona) => ({ id: persona.persona_id, name: persona.persona_name }));

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

generateRoutes.post("/api/generate/group/persona", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.json();
  const identity = String(body.identity || "").trim();
  if (!identity) {
    return c.json({ success: false, error: "Grup harus dipilih" }, 400);
  }

  ensureGroupAutoPostConfig(user.id, identity);
  updateGroupAutoPostConfig(user.id, identity, { is_persona: body.isPersona ? 1 : 0 });

  return c.json({ success: true });
});

generateRoutes.post("/api/generate/caption", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.json();
  const groupName = String(body.groupName || "").trim();
  const personaId = String(body.personaId || "").trim();
  const topic = String(body.topic || "").trim();

  if (!groupName || !personaId || !topic) {
    return c.json({ success: false, error: "Grup, persona, dan topik harus diisi" }, 400);
  }
  const ownsPersona = getUserPersonas(user.id).some((persona) => persona.persona_id === personaId);
  const ownsGroup = getAffiliateAccounts(user.id).some((account) => (account.identity || "Uncategorized") === groupName);
  if (!ownsPersona || !ownsGroup) {
    return c.json({ success: false, error: "Grup atau persona tidak ditemukan" }, 404);
  }
  try {
    const caption = await generatePersonaCaption({
      personaId,
      groupName,
      topic,
      niche: getGroupAutoPostConfig(user.id, groupName)?.niche,
      affiliateLink: String(body.affiliateLink || "").trim(),
    });
    return c.json({ success: true, caption });
  } catch (e: any) {
    return c.json({ success: false, error: e.message || "Gagal generate caption" }, 502);
  }
});

export default generateRoutes;
