import { Hono } from "hono";

const app = new Hono();

app.get("/api/jadiapa/balance", (c) => {
  return c.json({
    success: true,
    data: {
      balance: "Rp 150.000",
      lastChecked: new Date().toISOString(),
    },
  });
});

app.get("/api/jadiapa/usage", (c) => {
  return c.json({
    success: true,
    data: {
      images: 45,
      videos: 3,
      lastChecked: new Date().toISOString(),
    },
  });
});

app.post("/api/jadiapa/top-up", async (c) => {
  const body = await c.req.json();
  return c.json({
    success: true,
    data: {
      newBalance: `Rp ${150000 + (body.amount || 0)}`,
      message: "Top-up stub — replace with real jadiapa scraper",
    },
  });
});

app.post("/api/jadiapa/generate-image", async (c) => {
  const body = await c.req.json();
  return c.json({
    success: true,
    data: {
      imageUrl: "https://via.placeholder.com/512",
      cost: "Rp 5.000",
      remainingBalance: "Rp 145.000",
      prompt: body.prompt || "",
    },
  });
});

app.post("/api/jadiapa/generate-video", async (c) => {
  const body = await c.req.json();
  return c.json({
    success: true,
    data: {
      videoUrl: "https://via.placeholder.com/512.mp4",
      cost: "Rp 15.000",
      remainingBalance: "Rp 135.000",
      prompt: body.prompt || "",
    },
  });
});

app.get("/health", (c) => c.json({ status: "ok" }));

export default { port: 3103, fetch: app.fetch };