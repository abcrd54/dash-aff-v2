import { Database } from "bun:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const DB_PATH = process.env.DB_PATH || "data/dam.db";

let db: Database;

function migrateBetterAuthSchema(database: Database): void {
  // Better Auth requires TEXT id, but existing tables use INTEGER
  // Create new auth tables mapping users.id (int) → TEXT string id
  database.exec(`
    CREATE TABLE IF NOT EXISTS auth_user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
      access_token TEXT,
      refresh_token TEXT,
      id_token TEXT,
      access_token_expires_at TEXT,
      refresh_token_expires_at TEXT,
      scope TEXT,
      password TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(provider_id, account_id)
    );

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

export function getDBPath(): string {
  return DB_PATH;
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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const schema = readFileSync(join(import.meta.dir, "schema.sql"), "utf-8");
  const restSchema = schema.replace(/CREATE TABLE IF NOT EXISTS users[^;]+;/s, "");
  database.exec(restSchema);
  migrateBetterAuthSchema(database);

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
