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

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
  author_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_personas (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  persona_id TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  session_id TEXT,
  persona_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(persona_id)
);

CREATE INDEX IF NOT EXISTS idx_user_personas_user ON user_personas(user_id);

CREATE TABLE IF NOT EXISTS affiliate_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  org_name TEXT NOT NULL,
  org_id TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  access_token TEXT,
  api_key TEXT,
  api_key_id TEXT,
  team_id TEXT,
  identity TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS social_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER REFERENCES affiliate_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  social_account_id TEXT,
  username TEXT,
  channel_id TEXT,
  channel_name TEXT,
  channels TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS affiliate_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  price TEXT,
  description TEXT,
  images TEXT,
  variants TEXT,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  commission TEXT,
  placement TEXT NOT NULL DEFAULT 'comment',
  last_scraped_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS social_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  comment TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  image TEXT,
  placement TEXT NOT NULL DEFAULT 'comment',
  persona_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jadiapa_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  api_key TEXT,
  balance TEXT NOT NULL DEFAULT '0',
  usage_images INTEGER DEFAULT 0,
  usage_videos INTEGER DEFAULT 0,
  last_checked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_auto_post_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  identity TEXT NOT NULL,
  niche TEXT NOT NULL DEFAULT '',
  is_persona INTEGER NOT NULL DEFAULT 0,
  auto_post_enabled INTEGER NOT NULL DEFAULT 0,
  auto_generate_enabled INTEGER NOT NULL DEFAULT 0,
  daily_post_count INTEGER NOT NULL DEFAULT 5,
  start_time TEXT NOT NULL DEFAULT '12:00',
  use_default_schedule INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, identity)
);

CREATE TABLE IF NOT EXISTS post_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  account_email TEXT NOT NULL,
  platforms TEXT NOT NULL,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  bundle_post_id TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_post_logs_user ON post_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_post_logs_group ON post_logs(group_name);

CREATE TABLE IF NOT EXISTS security_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_security_audit_user ON security_audit_logs(user_id, created_at);
