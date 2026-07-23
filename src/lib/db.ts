import { getDB } from "../db";

export interface User {
  id: number;
  username: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  body: string;
  status: "draft" | "published";
  author_id: number;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: number;
  key: string;
  title: string;
  body: string;
  updated_at: string;
}

export function getUserByUsername(
  username: string
): (User & { password_hash: string }) | undefined {
  return getDB()
    .query("SELECT * FROM users WHERE username = ?")
    .get(username) as (User & { password_hash: string }) | undefined;
}

export function getUserById(id: number): User | undefined {
  return getDB()
    .query("SELECT id, username, role, created_at, updated_at FROM users WHERE id = ?")
    .get(id) as User | undefined;
}

export function getAllUsers(): User[] {
  return getDB()
    .query("SELECT id, username, role, created_at, updated_at FROM users ORDER BY id DESC")
    .all() as User[];
}

export function createUser(username: string, passwordHash: string, role: "admin" | "user"): User {
  const result = getDB()
    .query("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
    .run(username, passwordHash, role);
  return getUserById(Number(result.lastInsertRowid))!;
}

export function updateUser(
  id: number,
  data: { username?: string; password_hash?: string; role?: string }
): User | undefined {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (data.username !== undefined) {
    sets.push("username = ?");
    values.push(data.username);
  }
  if (data.password_hash !== undefined) {
    sets.push("password_hash = ?");
    values.push(data.password_hash);
  }
  if (data.role !== undefined) {
    sets.push("role = ?");
    values.push(data.role);
  }

  if (sets.length === 0) return getUserById(id);

  sets.push("updated_at = datetime('now')");
  values.push(id);

  getDB()
    .query(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`)
    .run(...values);

  return getUserById(id);
}

export function deleteUser(id: number): boolean {
  const result = getDB().query("DELETE FROM users WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getPosts(authorId?: number): Post[] {
  if (authorId) {
    return getDB()
      .query("SELECT * FROM posts WHERE author_id = ? ORDER BY id DESC")
      .all(authorId) as Post[];
  }
  return getDB().query("SELECT * FROM posts ORDER BY id DESC").all() as Post[];
}

export function getPostById(id: number, authorId?: number): Post | undefined {
  if (authorId) {
    return getDB()
      .query("SELECT * FROM posts WHERE id = ? AND author_id = ?")
      .get(id, authorId) as Post | undefined;
  }
  return getDB()
    .query("SELECT * FROM posts WHERE id = ?")
    .get(id) as Post | undefined;
}

export function createPost(
  title: string,
  slug: string,
  body: string,
  status: "draft" | "published",
  authorId: number
): Post {
  const result = getDB()
    .query(
      "INSERT INTO posts (title, slug, body, status, author_id) VALUES (?, ?, ?, ?, ?)"
    )
    .run(title, slug, body, status, authorId);
  return getPostById(Number(result.lastInsertRowid))!;
}

export function updatePost(
  id: number,
  data: { title?: string; slug?: string; body?: string; status?: string }
): Post | undefined {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.slug !== undefined) {
    sets.push("slug = ?");
    values.push(data.slug);
  }
  if (data.body !== undefined) {
    sets.push("body = ?");
    values.push(data.body);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }

  if (sets.length === 0) return getPostById(id);

  sets.push("updated_at = datetime('now')");
  values.push(id);

  getDB()
    .query(`UPDATE posts SET ${sets.join(", ")} WHERE id = ?`)
    .run(...values);

  return getPostById(id);
}

export function deletePost(id: number): boolean {
  const result = getDB().query("DELETE FROM posts WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getAllContent(): Content[] {
  return getDB()
    .query("SELECT * FROM content ORDER BY id DESC")
    .all() as Content[];
}

export function getContentByKey(key: string): Content | undefined {
  return getDB()
    .query("SELECT * FROM content WHERE key = ?")
    .get(key) as Content | undefined;
}

export function getContentById(id: number): Content | undefined {
  return getDB()
    .query("SELECT * FROM content WHERE id = ?")
    .get(id) as Content | undefined;
}

export function createContent(key: string, title: string, body: string): Content {
  const result = getDB()
    .query("INSERT INTO content (key, title, body) VALUES (?, ?, ?)")
    .run(key, title, body);
  return getContentById(Number(result.lastInsertRowid))!;
}

export function updateContent(
  id: number,
  data: { key?: string; title?: string; body?: string }
): Content | undefined {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.body !== undefined) {
    sets.push("body = ?");
    values.push(data.body);
  }

  if (sets.length === 0) return getContentById(id);

  sets.push("updated_at = datetime('now')");
  values.push(id);

  getDB()
    .query(`UPDATE content SET ${sets.join(", ")} WHERE id = ?`)
    .run(...values);

  return getContentById(id);
}

export function deleteContent(id: number): boolean {
  const result = getDB().query("DELETE FROM content WHERE id = ?").run(id);
  return result.changes > 0;
}

// ==================== USER PERSONAS ====================

export interface UserPersona {
  user_id: number;
  persona_id: string;
  service_slug: string;
  session_id: string | null;
  persona_name: string;
  created_at: string;
}

export function getUserPersonas(userId: number): UserPersona[] {
  return getDB()
    .query("SELECT * FROM user_personas WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as UserPersona[];
}

export function getPersonaOwner(personaId: string): UserPersona | undefined {
  return getDB()
    .query("SELECT * FROM user_personas WHERE persona_id = ?")
    .get(personaId) as UserPersona | undefined;
}

export function linkUserPersona(userId: number, personaId: string, serviceSlug: string, personaName: string): void {
  getDB()
    .query("INSERT INTO user_personas (user_id, persona_id, service_slug, persona_name) VALUES (?, ?, ?, ?)")
    .run(userId, personaId, serviceSlug, personaName);
}

export function updatePersonaSession(personaId: string, sessionId: string): void {
  getDB()
    .query("UPDATE user_personas SET session_id = ? WHERE persona_id = ?")
    .run(sessionId, personaId);
}

export function unlinkUserPersona(personaId: string): void {
  getDB()
    .query("DELETE FROM user_personas WHERE persona_id = ?")
    .run(personaId);
}

// ==================== AFFILIATE ACCOUNTS ====================

export interface AffiliateAccount {
  id: number;
  user_id: number;
  name: string;
  email: string;
  password: string | null;
  password_hash: string;
  first_name: string;
  last_name: string;
  org_name: string;
  org_id: string | null;
  team_id: string | null;
  identity: string;
  timezone: string;
  access_token: string | null;
  api_key: string | null;
  api_key_id: string | null;
  status: string;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export function getAffiliateAccounts(userId: number): AffiliateAccount[] {
  return getDB()
    .query("SELECT * FROM affiliate_accounts WHERE user_id = ? ORDER BY id DESC")
    .all(userId) as AffiliateAccount[];
}

export function getAffiliateAccountById(id: number): AffiliateAccount | undefined {
  return getDB()
    .query("SELECT * FROM affiliate_accounts WHERE id = ?")
    .get(id) as AffiliateAccount | undefined;
}

export function createAffiliateAccount(data: {
  user_id: number;
  name: string;
  email: string;
  password: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  org_name: string;
  timezone: string;
  identity?: string;
}): AffiliateAccount {
  const result = getDB()
    .query(
      "INSERT INTO affiliate_accounts (user_id, name, email, password, password_hash, first_name, last_name, org_name, identity, timezone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(data.user_id, data.name, data.email, data.password, data.password_hash, data.first_name, data.last_name, data.org_name, data.identity || "", data.timezone, "pending");
  return getAffiliateAccountById(Number(result.lastInsertRowid))!;
}

export function updateAffiliateAccount(id: number, data: {
  status?: string;
  error?: string;
  org_id?: string;
  team_id?: string;
  identity?: string;
  access_token?: string;
  api_key?: string;
  api_key_id?: string;
}): AffiliateAccount | undefined {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (data.status !== undefined) { sets.push("status = ?"); values.push(data.status); }
  if (data.error !== undefined) { sets.push("error = ?"); values.push(data.error); }
  if (data.org_id !== undefined) { sets.push("org_id = ?"); values.push(data.org_id); }
  if (data.team_id !== undefined) { sets.push("team_id = ?"); values.push(data.team_id); }
  if (data.identity !== undefined) { sets.push("identity = ?"); values.push(data.identity); }
  if (data.access_token !== undefined) { sets.push("access_token = ?"); values.push(data.access_token); }
  if (data.api_key !== undefined) { sets.push("api_key = ?"); values.push(data.api_key); }
  if (data.api_key_id !== undefined) { sets.push("api_key_id = ?"); values.push(data.api_key_id); }

  if (sets.length === 0) return getAffiliateAccountById(id);

  sets.push("updated_at = datetime('now')");
  values.push(id);

  getDB()
    .query(`UPDATE affiliate_accounts SET ${sets.join(", ")} WHERE id = ?`)
    .run(...values);

  return getAffiliateAccountById(id);
}

export function deleteAffiliateAccount(id: number): boolean {
  const result = getDB().query("DELETE FROM affiliate_accounts WHERE id = ?").run(id);
  return result.changes > 0;
}

// ==================== SOCIAL CONNECTIONS ====================

export interface SocialConnection {
  id: number;
  account_id: number;
  platform: string;
  social_account_id: string | null;
  username: string | null;
  status: string;
  error: string | null;
  created_at: string;
}

export function getConnection(accountId: number, platform: string): SocialConnection | undefined {
  return getDB()
    .query("SELECT * FROM social_connections WHERE account_id = ? AND platform = ?")
    .get(accountId, platform) as SocialConnection | undefined;
}

export function getConnectionsByAccount(accountId: number): SocialConnection[] {
  return getDB()
    .query("SELECT * FROM social_connections WHERE account_id = ? ORDER BY platform")
    .all(accountId) as SocialConnection[];
}

export function createConnection(accountId: number, platform: string): SocialConnection {
  const result = getDB()
    .query("INSERT INTO social_connections (account_id, platform) VALUES (?, ?)")
    .run(accountId, platform);
  return getConnection(accountId, platform)!;
}

export function updateConnection(
  accountId: number,
  platform: string,
  data: { status?: string; social_account_id?: string; username?: string; error?: string }
): void {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (data.status !== undefined) { sets.push("status = ?"); values.push(data.status); }
  if (data.social_account_id !== undefined) { sets.push("social_account_id = ?"); values.push(data.social_account_id); }
  if (data.username !== undefined) { sets.push("username = ?"); values.push(data.username); }
  if (data.error !== undefined) { sets.push("error = ?"); values.push(data.error); }

  if (sets.length === 0) return;
  values.push(accountId, platform);

  getDB()
    .query(`UPDATE social_connections SET ${sets.join(", ")} WHERE account_id = ? AND platform = ?`)
    .run(...values);
}
