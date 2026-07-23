import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { initDB, seedAdmin } from "./db";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import adminUserRoutes from "./routes/admin/users";
import postRoutes from "./routes/posts";
import contentRoutes from "./routes/content";
import accountRoutes from "./routes/account";
import personasRoutes from "./routes/personas";
import chatRoutes from "./routes/persona-chat";
import affiliateRoutes from "./routes/affiliate";
import platformRoutes from "./routes/platform";

initDB();
await seedAdmin();

const app = new Hono();

app.use("/css/*", serveStatic({ root: "./public" }));

app.route("/", authRoutes);
app.route("/", dashboardRoutes);
app.route("/", adminUserRoutes);
app.route("/", postRoutes);
app.route("/", contentRoutes);
app.route("/", accountRoutes);
app.route("/", personasRoutes);
app.route("/", chatRoutes);
app.route("/", affiliateRoutes);
app.route("/", platformRoutes);

app.get("/", (c) => c.redirect("/login"));

export default {
  port: Number(process.env.PORT) || 4000,
  fetch: app.fetch,
};
