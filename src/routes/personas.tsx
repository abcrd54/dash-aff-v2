import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getUserPersonas, getPersonaOwner, linkUserPersona, unlinkUserPersona } from "../lib/db";
import { getServiceClient } from "../lib/proxy";
import { getServices } from "../lib/config";
import PersonaListPage from "../views/personas/index";

const personasRoutes = new Hono();

personasRoutes.get("/personas", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const services = getServices();
  const serviceName = services[0]?.slug || "No Service";
  let personas: any[] = [];
  let error = "";

  for (const service of services) {
    if (service.slug !== "aff-personal") continue;
    try {
      const allPersonas = await getServiceClient(service.slug).getJSON<any[]>("/api/personas");
      const ownedIds = new Set(getUserPersonas(user.id).map((persona) => persona.persona_id));
      personas = personas.concat(allPersonas.filter((persona: any) => ownedIds.has(persona.id)));
    } catch (e: any) {
      error = e.message;
    }
  }

  return c.html(<PersonaListPage user={user} serviceName={serviceName} personas={personas} error={error || undefined} />);
});

personasRoutes.post("/personas", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.parseBody();
  const name = String(body.name || "").trim();
  const type = String(body.type || "personal");
  const traits = String(body.traits || "ramah").split(",").map((trait) => trait.trim()).filter(Boolean);
  const backstory = String(body.backstory || "").trim();
  const tone = String(body.tone || "hangat");
  const language = String(body.language || "indonesia");

  if (!name || !backstory) {
    return c.html(<PersonaListPage user={user} serviceName="aff-personal" personas={[]} error="Name and backstory are required." />);
  }

  try {
    const created = await getServiceClient("aff-personal").postJSON<any>("/api/personas", {
      type,
      name,
      traits: traits.length > 0 ? traits : ["umum"],
      backstory,
      tone,
      language,
    });
    linkUserPersona(user.id, created.id, "aff-personal", name);
  } catch (e: any) {
    return c.html(<PersonaListPage user={user} serviceName="aff-personal" personas={[]} error={e.message} />);
  }
  return c.redirect("/personas");
});

personasRoutes.post("/personas/:id/delete", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const personaId = c.req.param("id");
  if (!personaId) return c.redirect("/personas");
  const owner = getPersonaOwner(personaId);
  if (!owner || owner.user_id !== user.id) return c.redirect("/personas");

  try {
    await getServiceClient("aff-personal").deleteJSON(`/api/personas/${personaId}`);
  } catch (e: any) {
    if (!e.message?.includes("404")) return c.redirect("/personas");
  }

  unlinkUserPersona(user.id, personaId);
  return c.redirect("/personas");
});

export default personasRoutes;
