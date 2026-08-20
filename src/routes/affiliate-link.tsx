import { Hono } from "hono";
import { authMiddleware, getSession } from "../middleware/auth";
import { getAffiliateProducts, createAffiliateProduct, deleteAffiliateProduct, getAffiliateAccounts, getConnectionsByAccount } from "../lib/db";
import AffiliateLinkPage from "../views/affiliate-link/index";

const affiliateLinkRoutes = new Hono();

affiliateLinkRoutes.get("/affiliate-link", authMiddleware, (c) => {
  const user = getSession(c)!;
  const products = getAffiliateProducts(user.id);

  const accounts = getAffiliateAccounts(user.id);
  const doneAccounts = accounts.filter((a) => a.status === "done");
  const groups = doneAccounts.map((a) => {
    const conns = getConnectionsByAccount(a.id);
    return {
      identity: a.identity || "Uncategorized",
      accounts: conns.filter((conn) => conn.status === "connected").length,
    };
  }).filter((g) => g.accounts > 0);

  const uniqueGroups = groups.filter(
    (g, i, arr) => arr.findIndex((x) => x.identity === g.identity) === i
  );

  return c.html(<AffiliateLinkPage user={user} products={products} groups={uniqueGroups} />);
});

affiliateLinkRoutes.get("/api/affiliate-link/list", authMiddleware, (c) => {
  const user = getSession(c)!;
  const products = getAffiliateProducts(user.id);
  return c.json({ success: true, data: products });
});

affiliateLinkRoutes.post("/api/affiliate-link/scrape", authMiddleware, async (c) => {
  const body = await c.req.json();
  const url = body.url;

  if (!url) {
    return c.json({ success: false, error: "URL harus diisi" }, 400);
  }

  return c.json({
    success: false,
    error: "Scraping service belum tersedia. Input manual sementara.",
  });
});

affiliateLinkRoutes.post("/api/affiliate-link/add", authMiddleware, async (c) => {
  const user = getSession(c)!;
  const body = await c.req.json();

  const url = body.url;
  if (!url) {
    return c.json({ success: false, error: "URL harus diisi" }, 400);
  }

  try {
    const product = createAffiliateProduct({
      user_id: user.id,
      url: url,
      name: body.name || "Produk Manual",
      price: body.price || undefined,
      description: body.description || undefined,
      images: body.images ? JSON.stringify(body.images) : undefined,
      placement: body.placement || "comment",
    });

    return c.json({ success: true, data: product });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

affiliateLinkRoutes.delete("/api/affiliate-link/:id", authMiddleware, (c) => {
  const user = getSession(c)!;
  const id = Number(c.req.param("id"));
  if (!id || isNaN(id)) {
    return c.json({ success: false, error: "ID tidak valid" }, 400);
  }

  const ok = deleteAffiliateProduct(id, user.id);
  if (!ok) {
    return c.json({ success: false, error: "Produk tidak ditemukan" }, 404);
  }
  return c.json({ success: true });
});

export default affiliateLinkRoutes;
