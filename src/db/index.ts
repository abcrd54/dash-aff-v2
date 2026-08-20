import { Database } from "bun:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const DB_PATH = process.env.DB_PATH || "data/dam.db";

let db: Database;

function ensureVerificationSchema(database: Database): void {
  // OTP verification records used by the custom authentication flow.
  database.exec(`
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function getDB(): Database {
  if (!db) {
    if (DB_PATH !== ":memory:") {
      mkdirSync(dirname(DB_PATH), { recursive: true });
    }
    db = new Database(DB_PATH, { create: true });
    db.exec("PRAGMA journal_mode=WAL");
    db.exec("PRAGMA foreign_keys=ON");
  }
  return db;
}

export function initDB(): void {
  const database = getDB();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      two_factor_enabled INTEGER NOT NULL DEFAULT 0,
      session_version INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const schema = readFileSync(join(import.meta.dir, "schema.sql"), "utf-8");
  const restSchema = schema.replace(/CREATE TABLE IF NOT EXISTS users[^;]+;/s, "");
  database.exec(restSchema);
  ensureVerificationSchema(database);

  try {
    database.exec("ALTER TABLE affiliate_accounts ADD COLUMN team_id TEXT");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE affiliate_accounts ADD COLUMN identity TEXT NOT NULL DEFAULT ''");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE social_connections ADD COLUMN channel_id TEXT");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE social_connections ADD COLUMN channel_name TEXT");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE social_connections ADD COLUMN channels TEXT");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE social_connections ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'))");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE affiliate_products ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE affiliate_products ADD COLUMN placement TEXT NOT NULL DEFAULT 'comment'");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE social_posts ADD COLUMN persona_id TEXT");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE users ADD COLUMN email TEXT UNIQUE");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER NOT NULL DEFAULT 0");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0");
  } catch {
    // column already exists
  }
  try {
    database.exec("ALTER TABLE group_auto_post_config ADD COLUMN is_persona INTEGER NOT NULL DEFAULT 0");
  } catch {
    // column already exists
  }
}

export async function seedAdmin(): Promise<void> {
  const database = getDB();
  const existing = database
    .query("SELECT id FROM users WHERE username = ?")
    .get("admin") as { id: number } | undefined;

  if (existing) {
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
  const password = process.env.ADMIN_INITIAL_PASSWORD || "Admin123#";
  const passwordHash = await Bun.password.hash(password, "bcrypt");

  database
    .query("INSERT INTO users (username, password_hash, role, email) VALUES (?, ?, ?, ?)")
    .run("admin", passwordHash, "admin", adminEmail);

  console.log("✅ Admin user seeded");
  console.log("   Username: admin");
  console.log("   Email: " + adminEmail);
  console.log("   Password: " + password + " (change immediately!)");
}
