import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getAllContent, createContent, updateContent, deleteContent } from "../lib/db";
import ContentPage from "../views/content/index";

const contentRoutes = new Hono();

contentRoutes.get("/content", authMiddleware, (c) => {
  const user = getSession(c)!;
  const items = getAllContent();
  return c.html(<ContentPage user={user} items={items} />);
});

contentRoutes.post("/content", authMiddleware, async (c) => {
  const body = await c.req.parseBody();
  const key = String(body.key || "").trim();
  const title = String(body.title || "").trim();
  const content = String(body.body || "");

  if (!key || !title) {
    return c.redirect("/content");
  }

  createContent(key, title, content);
  return c.redirect("/content");
});

contentRoutes.put("/content/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.parseBody();

  const data: { key?: string; title?: string; body?: string } = {};
  if (body.key) data.key = String(body.key).trim();
  if (body.title) data.title = String(body.title).trim();
  if (body.body !== undefined) data.body = String(body.body);

  updateContent(id, data);
  return c.redirect("/content");
});

contentRoutes.delete("/content/:id", authMiddleware, (c) => {
  const id = Number(c.req.param("id"));
  deleteContent(id);
  return c.redirect("/content");
});

export default contentRoutes;
