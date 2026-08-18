import { Hono } from "hono";

const app = new Hono();

app.post("/api/shopee/scrape-dashboard", async (c) => {
  return c.json({
    success: true,
    data: [
      {
        product: "Product A (stub)",
        views: 1500,
        clicks: 120,
        commission: "Rp 5.000",
      },
      {
        product: "Product B (stub)",
        views: 3200,
        clicks: 280,
        commission: "Rp 12.000",
      },
    ],
  });
});

app.get("/api/shopee/trending", (c) => {
  return c.json({
    success: true,
    data: [
      { product: "Trending A (stub)", views: 5000, clicks: 400, commission: "Rp 15.000" },
      { product: "Trending B (stub)", views: 4200, clicks: 350, commission: "Rp 10.000" },
    ],
  });
});

app.get("/health", (c) => c.json({ status: "ok" }));

export default { port: 3101, fetch: app.fetch };