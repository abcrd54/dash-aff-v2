import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getPersonaOwner } from "../lib/db";
import { getServiceClient } from "../lib/proxy";
import { getServiceBySlug } from "../lib/config";
import ChatPage from "../views/personas/chat";

const chatRoutes = new Hono();

chatRoutes.get("/personas/:id/chat", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const personaId = c.req.param("id");

  const owner = getPersonaOwner(personaId);
  if (!owner || owner.user_id !== user.id) {
    return c.html(<ChatPage user={user} personaId={personaId} personaName="Unknown" persona={{}} wsUrl="" error="Persona not found or not yours." />);
  }

  try {
    const aff = getServiceClient("aff-personal");
    const service = getServiceBySlug("aff-personal")!;
    const persona = await aff.getJSON<any>(`/api/personas/${personaId}`);
    const backendUrl = new URL(service.base_url);
    const wsProtocol = backendUrl.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${backendUrl.host}/api/chat/ws?personaId=${encodeURIComponent(personaId)}&api_key=${encodeURIComponent(service.api_key)}`;

    return c.html(<ChatPage
      user={user}
      personaId={personaId}
      personaName={persona.name || personaId}
      persona={persona}
      wsUrl={wsUrl}
    />);
  } catch (e: any) {
    return c.html(<ChatPage user={user} personaId={personaId} personaName="Error" persona={{}} wsUrl="" error={e.message} />);
  }
});

export default chatRoutes;