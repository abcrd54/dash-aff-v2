import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { ensureJadiapaConfig, hasAnyAutoPostEnabled, hasAnyAutoGenerateEnabled } from "../lib/db";
import SettingsPage from "../views/settings/index";

const settingsRoutes = new Hono();

settingsRoutes.get("/settings", authMiddleware, (c) => {
  const user = getSession(c)!;
  const jadiapa = ensureJadiapaConfig(user.id);

  const url = new URL(c.req.url);
  const error = url.searchParams.get("error") || undefined;
  const success = url.searchParams.get("success") || undefined;

  const autoPostActive = hasAnyAutoPostEnabled(user.id);
  const autoGenerateActive = hasAnyAutoGenerateEnabled(user.id);

  return c.html(
    <SettingsPage
      user={user}
      jadiapaConnected={!!jadiapa.api_key}
      jadiapaEmail=""
      jadiapa={{
        email: "",
        balance: jadiapa.balance || "0",
        usageImages: jadiapa.usage_images || 0,
        usageVideos: jadiapa.usage_videos || 0,
        lastChecked: jadiapa.last_checked_at || "Belum pernah",
      }}
      autoPostActive={autoPostActive}
      autoGenerateActive={autoGenerateActive}
      error={error}
      success={success}
    />
  );
});

settingsRoutes.post("/settings/jadiapa-auth", authMiddleware, async (c) => {
  const body = await c.req.parseBody();
  const email = String(body.email || "").trim();
  const password = String(body.password || "");

  if (!email || !password) {
    return c.redirect("/settings?error=" + encodeURIComponent("Email dan password jadiapa harus diisi"));
  }

  return c.redirect("/settings?success=" + encodeURIComponent("Auth jadiapa tersimpan (integrasi scraping coming soon)"));
});

export default settingsRoutes;