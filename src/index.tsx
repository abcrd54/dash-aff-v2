import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { initDB, seedAdmin } from "./db";
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
