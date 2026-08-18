import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { csrf } from "hono/csrf";
import { rateLimiter } from "hono-rate-limiter";
import { initDB, seedAdmin } from "./db";
import LoginPage from "./views/login";
import { securityHeaders } from "./middleware/security";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import adminUserRoutes from "./routes/admin/users";
import postRoutes from "./routes/posts";
import accountRoutes from "./routes/account";
import personasRoutes from "./routes/personas";
import chatRoutes from "./routes/persona-chat";
import affiliateRoutes from "./routes/affiliate";
import platformRoutes from "./routes/platform";
import affiliateLinkRoutes from "./routes/affiliate-link";
import socialPostRoutes from "./routes/post";
import settingsRoutes from "./routes/settings";
import generateRoutes from "./routes/generate";

initDB();
await seedAdmin();

const app = new Hono();

app.use("*", async (c, next) => {
  const maxBodySize = 10 * 1024 * 1024; // 10MB
  const contentLength = parseInt(c.req.header("content-length") || "0", 10);
  if (contentLength > maxBodySize) {
    return c.text("Request body too large", 413);
  }
  await next();
});

app.use(securityHeaders);
app.use(csrf({ origin: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 4000}` }));

app.use(
  "/login",
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: (c) => {
      const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      return `login_${ip}`;
    },
    handler: (c) => {
      return c.html(
        <LoginPage error="Terlalu banyak percobaan login. Coba lagi dalam 15 menit." />
      );
    },
  })
);

app.use("/css/*", serveStatic({ root: "./public" }));

app.route("/", authRoutes);
app.route("/", dashboardRoutes);
app.route("/", adminUserRoutes);
app.route("/", postRoutes);
app.route("/", accountRoutes);
app.route("/", personasRoutes);
app.route("/", chatRoutes);
app.route("/", affiliateRoutes);
app.route("/", platformRoutes);
app.route("/", affiliateLinkRoutes);
app.route("/", socialPostRoutes);
app.route("/", settingsRoutes);
app.route("/", generateRoutes);

app.get("/", (c) => c.redirect("/login"));

export default {
  port: Number(process.env.PORT) || 4000,
  fetch: app.fetch,
};