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
  channel_id: string | null;
  channel_name: string | null;
  channels: string | null;
  status: string;
  error: string | null;
  created_at: string;
  updated_at: string;
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
  data: {
    status?: string;
    social_account_id?: string;
    username?: string;
    channel_id?: string;
    channel_name?: string;
    channels?: string;
    error?: string;
  }
): void {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (data.status !== undefined) { sets.push("status = ?"); values.push(data.status); }
  if (data.social_account_id !== undefined) { sets.push("social_account_id = ?"); values.push(data.social_account_id); }
  if (data.username !== undefined) { sets.push("username = ?"); values.push(data.username); }
  if (data.channel_id !== undefined) { sets.push("channel_id = ?"); values.push(data.channel_id); }
  if (data.channel_name !== undefined) { sets.push("channel_name = ?"); values.push(data.channel_name); }
  if (data.channels !== undefined) { sets.push("channels = ?"); values.push(data.channels); }
  if (data.error !== undefined) { sets.push("error = ?"); values.push(data.error); }

  if (sets.length === 0) return;
  sets.push("updated_at = datetime('now')");
  values.push(accountId, platform);

  getDB()
    .query(`UPDATE social_connections SET ${sets.join(", ")} WHERE account_id = ? AND platform = ?`)
    .run(...values);
}

export function deleteConnection(accountId: number, platform: string): boolean {
  const result = getDB()
    .query("DELETE FROM social_connections WHERE account_id = ? AND platform = ?")
    .run(accountId, platform);
  return result.changes > 0;
}

// ==================== AFFILIATE PRODUCTS ====================

export interface AffiliateProduct {
  id: number;
  user_id: number;
  url: string;
  name: string;
  price: string | null;
  description: string | null;
  images: string | null;
  variants: string | null;
  views: number;
  clicks: number;
  commission: string | null;
  placement: string;
  last_scraped_at: string | null;
  created_at: string;
}

export function getAffiliateProducts(userId: number): AffiliateProduct[] {
  return getDB()
    .query("SELECT * FROM affiliate_products WHERE user_id = ? ORDER BY id DESC")
    .all(userId) as AffiliateProduct[];
}

export function getAffiliateProductById(id: number): AffiliateProduct | undefined {
  return getDB()
    .query("SELECT * FROM affiliate_products WHERE id = ?")
    .get(id) as AffiliateProduct | undefined;
}

export function createAffiliateProduct(data: {
  user_id: number;
  url: string;
  name: string;
  price?: string;
  description?: string;
  images?: string;
  placement?: string;
}): AffiliateProduct {
  const result = getDB()
    .query(
      "INSERT INTO affiliate_products (user_id, url, name, price, description, images, placement) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(data.user_id, data.url, data.name, data.price || null, data.description || null, data.images || null, data.placement || "comment");
  return getAffiliateProductById(Number(result.lastInsertRowid))!;
}

export function deleteAffiliateProduct(id: number): boolean {
  const result = getDB()
    .query("DELETE FROM affiliate_products WHERE id = ?")
    .run(id);
  return result.changes > 0;
}

// ==================== SOCIAL POSTS ====================

export interface SocialPost {
  id: number;
  user_id: number;
  group_name: string;
  caption: string;
  comment: string;
  link: string;
  image: string | null;
  placement: string;
  persona_id: string | null;
  status: string;
  sent_at: string | null;
  created_at: string;
}

export function getSocialPosts(userId: number): SocialPost[] {
  return getDB()
    .query("SELECT * FROM social_posts WHERE user_id = ? ORDER BY id DESC")
    .all(userId) as SocialPost[];
}

export function getSocialPostById(id: number): SocialPost | undefined {
  return getDB()
    .query("SELECT * FROM social_posts WHERE id = ?")
    .get(id) as SocialPost | undefined;
}

export function createSocialPost(data: {
  user_id: number;
  group_name: string;
  caption: string;
  comment?: string;
  link?: string;
  placement?: string;
  persona_id?: string;
}): SocialPost {
  const result = getDB()
    .query(
      "INSERT INTO social_posts (user_id, group_name, caption, comment, link, placement, persona_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')"
    )
    .run(data.user_id, data.group_name, data.caption, data.comment || "", data.link || "", data.placement || "comment", data.persona_id || null);
  return getSocialPostById(Number(result.lastInsertRowid))!;
}

export function deleteSocialPost(id: number): boolean {
  const result = getDB()
    .query("DELETE FROM social_posts WHERE id = ?")
    .run(id);
  return result.changes > 0;
}

// ==================== JADIAPA ====================

export interface JadiapaConfig {
  id: number;
  user_id: number;
  api_key: string | null;
  balance: string;
  usage_images: number;
  usage_videos: number;
  last_checked_at: string | null;
  created_at: string;
}

export function getJadiapaConfig(userId: number): JadiapaConfig | undefined {
  return (
    getDB()
      .query("SELECT * FROM jadiapa_config WHERE user_id = ?")
      .get(userId) as JadiapaConfig | undefined
  );
}

export function ensureJadiapaConfig(userId: number): JadiapaConfig {
  let config = getJadiapaConfig(userId);
  if (!config) {
    getDB()
      .query("INSERT INTO jadiapa_config (user_id, balance) VALUES (?, '0')")
      .run(userId);
    config = getJadiapaConfig(userId)!;
  }
  return config;
}

// ==================== GROUP AUTO POST CONFIG ====================

export interface GroupAutoPostConfig {
  id: number;
  user_id: number;
  identity: string;
  niche: string;
  auto_post_enabled: number;
  auto_generate_enabled: number;
  daily_post_count: number;
  start_time: string;
  use_default_schedule: number;
  created_at: string;
  updated_at: string;
}

export function getGroupAutoPostConfigs(userId: number): GroupAutoPostConfig[] {
  return getDB()
    .query("SELECT * FROM group_auto_post_config WHERE user_id = ? ORDER BY identity")
    .all(userId) as GroupAutoPostConfig[];
}

export function getGroupAutoPostConfig(userId: number, identity: string): GroupAutoPostConfig | undefined {
  return getDB()
    .query("SELECT * FROM group_auto_post_config WHERE user_id = ? AND identity = ?")
    .get(userId, identity) as GroupAutoPostConfig | undefined;
}

export function ensureGroupAutoPostConfig(userId: number, identity: string): GroupAutoPostConfig {
  let config = getGroupAutoPostConfig(userId, identity);
  if (!config) {
    getDB()
      .query("INSERT INTO group_auto_post_config (user_id, identity) VALUES (?, ?)")
      .run(userId, identity);
    config = getGroupAutoPostConfig(userId, identity)!;
  }
  return config;
}

export function updateGroupAutoPostConfig(
  userId: number,
  identity: string,
  data: {
    niche?: string;
    auto_post_enabled?: number;
    auto_generate_enabled?: number;
    daily_post_count?: number;
    start_time?: string;
    use_default_schedule?: number;
  }
): void {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (data.niche !== undefined) { sets.push("niche = ?"); values.push(data.niche); }
  if (data.auto_post_enabled !== undefined) { sets.push("auto_post_enabled = ?"); values.push(data.auto_post_enabled); }
  if (data.auto_generate_enabled !== undefined) { sets.push("auto_generate_enabled = ?"); values.push(data.auto_generate_enabled); }
  if (data.daily_post_count !== undefined) { sets.push("daily_post_count = ?"); values.push(data.daily_post_count); }
  if (data.start_time !== undefined) { sets.push("start_time = ?"); values.push(data.start_time); }
  if (data.use_default_schedule !== undefined) { sets.push("use_default_schedule = ?"); values.push(data.use_default_schedule); }

  if (sets.length === 0) return;

  sets.push("updated_at = datetime('now')");
  values.push(userId, identity);

  getDB()
    .query(`UPDATE group_auto_post_config SET ${sets.join(", ")} WHERE user_id = ? AND identity = ?`)
    .run(...values);
}

export function hasAnyAutoPostEnabled(userId: number): boolean {
  const row = getDB()
    .query("SELECT COUNT(*) as cnt FROM group_auto_post_config WHERE user_id = ? AND auto_post_enabled = 1")
    .get(userId) as { cnt: number } | undefined;
  return (row?.cnt || 0) > 0;
}

export function hasAnyAutoGenerateEnabled(userId: number): boolean {
  const row = getDB()
    .query("SELECT COUNT(*) as cnt FROM group_auto_post_config WHERE user_id = ? AND auto_generate_enabled = 1")
    .get(userId) as { cnt: number } | undefined;
  return (row?.cnt || 0) > 0;
}
