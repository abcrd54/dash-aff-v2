import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getPosts, getPostById, createPost, updatePost, deletePost } from "../lib/db";
import PostsPage from "../views/posts/index";

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "untitled-" + Date.now();
}

const postRoutes = new Hono();

postRoutes.get("/posts", authMiddleware, (c) => {
  const user = getSession(c)!;
  const posts = getPosts(user.id);
  return c.html(<PostsPage user={user} posts={posts} />);
});

postRoutes.post("/posts", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.parseBody();
  const title = String(body.title || "").trim();
  const content = String(body.body || "");
  const status = String(body.status || "draft");
  const slug = String(body.slug || slugify(title));

  if (!title) {
    return c.redirect("/posts");
  }

  try {
    createPost(title, slug, content, status, user.id);
  } catch (e) {
    return c.redirect("/posts");
  }
  return c.redirect("/posts");
});

postRoutes.put("/posts/:id", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const id = Number(c.req.param("id"));

  const existing = getPostById(id, user.id);
  if (!existing) return c.redirect("/posts");

  const body = await c.req.parseBody();

  const data: { title?: string; slug?: string; body?: string; status?: string } = {};
  const title = String(body.title || "").trim();
  if (title) {
    data.title = title;
    data.slug = slugify(title);
  }
  if (body.body !== undefined) data.body = String(body.body);
  if (body.status) data.status = String(body.status);

  try {
    updatePost(id, data);
  } catch (e) {
    return c.redirect("/posts");
  }
  return c.redirect("/posts");
});

postRoutes.delete("/posts/:id", authMiddleware, (c) => {
  const user = getSession(c)!;
  const id = Number(c.req.param("id"));

  const existing = getPostById(id, user.id);
  if (!existing) return c.redirect("/posts");

  deletePost(id);
  return c.redirect("/posts");
});

export default postRoutes;
