import { Hono } from "hono";

const app = new Hono();

app.post("/api/shopee/scrape-product", async (c) => {
  const body = await c.req.json();
  return c.json({
    success: true,
    data: {
      name: "Product Name (stub)",
      price: "Rp 99.000",
      description: "Product description stub — replace with real scraper",
      images: JSON.stringify(["https://via.placeholder.com/300"]),
      variants: JSON.stringify([{ name: "Default", price: "Rp 99.000" }]),
      url: body.url || "",
    },
  });
});

app.get("/health", (c) => c.json({ status: "ok" }));

export default { port: 3100, fetch: app.fetch };