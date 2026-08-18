import { Hono } from "hono";

const app = new Hono();

app.post("/api/news/scrape", async (c) => {
  const body = await c.req.json();
  return c.json({
    success: true,
    data: [
      {
        title: "Berita Trending (stub)",
        content: "Isi berita stub — replace with real news scraper",
        image: "https://via.placeholder.com/600x400",
        date: new Date().toISOString(),
        source: body.source || "detik",
        category: body.category || "umum",
      },
    ],
  });
});

app.post("/api/news/generate-caption", async (c) => {
  const body = await c.req.json();
  return c.json({
    success: true,
    data: {
      caption: `Caption AI dari berita "${body.article?.title || "..."}" — stub`,
      comment: body.placement === "comment" ? "Link affiliate di komentar — stub" : undefined,
    },
  });
});

app.get("/health", (c) => c.json({ status: "ok" }));

export default { port: 3102, fetch: app.fetch };