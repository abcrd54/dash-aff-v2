import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { authMiddleware, getSession } from "../middleware/auth";
import { getPersonaOwner } from "../lib/db";
import { getServiceClient } from "../lib/proxy";
import { getServiceBySlug } from "../lib/config";
import ChatPage from "../views/personas/chat";

const chatRoutes = new Hono();

chatRoutes.get("/personas/:id/chat", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const personaId = c.req.param("id");
  if (!personaId) return c.text("Persona not found", 404);

  const owner = getPersonaOwner(personaId);
  if (!owner || owner.user_id !== user.id) {
    return c.html(<ChatPage user={user} personaId={personaId} personaName="Unknown" persona={{}} wsUrl="" error="Persona not found or not yours." />);
  }

  try {
    const aff = getServiceClient("aff-personal");
    const persona = await aff.getJSON<any>(`/api/personas/${personaId}`);
    const wsUrl = `/api/personas/${encodeURIComponent(personaId)}/chat/ws`;
    return c.html(<ChatPage user={user} personaId={personaId} personaName={persona.name || personaId} persona={persona} wsUrl={wsUrl} />);
  } catch (e: any) {
    return c.html(<ChatPage user={user} personaId={personaId} personaName="Error" persona={{}} wsUrl="" error={e.message} />);
  }
});

chatRoutes.get("/api/personas/:id/chat/ws", authMiddleware, async (c, next) => {
  const user = getSession(c)!;
  const personaId = c.req.param("id");
  if (!personaId) return c.text("Persona not found", 404);
  const owner = getPersonaOwner(personaId);
  if (!owner || owner.user_id !== user.id) return c.text("Forbidden", 403);

  const service = getServiceBySlug(owner.service_slug);
  if (!service) return c.text("Persona service unavailable", 503);
  const backendUrl = new URL(service.base_url);
  const protocol = backendUrl.protocol === "https:" ? "wss" : "ws";
  const upstreamUrl = `${protocol}://${backendUrl.host}/api/chat/ws?personaId=${encodeURIComponent(personaId)}&api_key=${encodeURIComponent(service.api_key)}`;

  return upgradeWebSocket(() => {
    let upstream: WebSocket | null = null;
    const pending: Array<string | ArrayBuffer> = [];
    return {
      onOpen(_event, client) {
        upstream = new WebSocket(upstreamUrl);
        upstream.binaryType = "arraybuffer";
        upstream.onopen = () => {
          for (const message of pending.splice(0)) upstream?.send(message);
        };
        upstream.onmessage = (event) => client.send(event.data);
        upstream.onerror = () => client.close(1011, "Upstream connection failed");
        upstream.onclose = () => client.close(1000, "Upstream connection closed");
      },
      onMessage(event) {
        const message = event.data as string | ArrayBuffer;
        if (upstream?.readyState === WebSocket.OPEN) upstream.send(message);
        else pending.push(message);
      },
      onClose() {
        if (upstream && upstream.readyState < WebSocket.CLOSING) upstream.close();
      },
    };
  })(c, next);
});

export default chatRoutes;
