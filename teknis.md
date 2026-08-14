# Teknis — Dashboard Management Affiliate

## Yang Sudah Dibangun

### 1. Setup & Infrastruktur

| Item | Detail | Status |
|------|--------|--------|
| Server utama | Bun + Hono, port 4000 | ✅ |
| Kumux Mail | Docker `ghcr.io/mboxjem/kumux-mail:latest`, port 3010 | ✅ |
| aff-personal | Docker `ghcr.io/abcrd54/personal-aff-v2:latest`, port 3000 | ✅ |
| SQLite | `data/dam.db`, WAL mode, foreign keys ON | ✅ |

### 2. Auth & Multi-user

| Item | File | Status |
|------|------|--------|
| JWT HMAC-SHA256 (custom) | `middleware/auth.ts` | ✅ |
| Cookie session (httpOnly, 24h) | `routes/auth.tsx` | ✅ |
| Admin + user roles | `db/schema.sql` | ✅ |
| CRUD user management | `routes/admin/users.tsx` | ✅ |
| Password change / username change | `routes/account.tsx` | ✅ |

### 3. Bunsocial Onboarding

| Item | File | Status |
|------|------|--------|
| Generate 1-5 akun via SSE | `routes/affiliate.tsx` | ✅ |
| Orchestrator 9-step onboarding | `lib/orchestrator.ts` | ✅ |
| AbortSignal (cancel saat disconnect) | `lib/orchestrator.ts` | ✅ |
| Prevent double-submit (Map + 409) | `routes/affiliate.tsx` | ✅ |
| Real-time update tanpa refresh | `views/affiliate/index.tsx` | ✅ |
| GET endpoint akun (JSON) | `routes/affiliate.tsx` | ✅ |
| Integrasi Kumux Mail (email) | `lib/kumail.ts` | ✅ |
| Integrasi Bunsocial (signup) | `lib/bunsocial.ts` | ✅ |
| Tampilan email sebagai primary | `views/affiliate/index.tsx` | ✅ |

### 4. Platform Connect (Bundle Social)

| Item | File | Status |
|------|------|--------|
| Hosted flow (portal link, no Puppeteer) | `lib/platform-connect.ts` | ✅ |
| 6 platform: X, FB, Threads, IG, TikTok, Pinterest | `views/platform/connect.tsx` | ✅ |
| Per-akun per-platform, 3 card grid | `views/platform/connect.tsx` | ✅ |
| SVG icon asli per platform | `views/platform/connect.tsx` | ✅ |
| Horizontal slider (bukan accordion) | `views/platform/connect.tsx` | ✅ |
| Channel chips untuk set-channel | `views/platform/connect.tsx` | ✅ |
| Check status (↻) + disconnect (✕) | `views/platform/connect.tsx` | ✅ |
| Grouping by nama akun platform | `views/platform/connect.tsx` | ✅ |
| API routes: portal, check-status, set-channel, disconnect | `routes/platform.tsx` | ✅ |

### 5. Database

| Item | Detail | Status |
|------|--------|--------|
| Schema migration | `channel_id`, `channel_name`, `channels`, `updated_at` | ✅ |
| `SocialConnection` extended | Channel fields + `deleteConnection()` | ✅ |
| `AffiliateAccount` | Status tracking, team_id, api_key, identity | ✅ |

### 6. Environment

| Env | File | Status |
|-----|------|--------|
| `KUMAIL_URL`, `KUMAIL_API_KEY` | `.env` + `.env.example` | ✅ |
| `BUNSOCIAL_URL`, `BUNSOCIAL_API_KEY` | `.env` + `.env.example` | ✅ |
| `PERSONA_SERVICE_URL`, `PERSONA_SERVICE_API_KEY` | `.env` + `.env.example` | ✅ |
| `APP_URL` (untuk OAuth redirect) | `routes/platform.tsx` | ✅ |

### 7. UI

| Item | Detail | Status |
|------|--------|--------|
| Rename | `Barokah Aff` → `Dashboard Management Affiliate` | ✅ |
| Account card | Email sebagai primary, identitas, status | ✅ |
| Platform icons | SVG Simple Icons, warna per platform | ✅ |
| Layout | 3-card grid, horizontal slider | ✅ |

---

## Rencana (Coming Soon)

> **Catatan:** Semua scraping service akan dibuat oleh tim terpisah sebagai microservice. Dashboard hanya perlu definisi API contract (input/output) untuk memanggil service tersebut.

### 1. Scraping Shopee — Produk

```
Service:   shopee-product-scraper (dibuat tim terpisah)
Fungsi:    Baca data produk dari URL Shopee

Input:     { url: "https://shopee.co.id/..." }
Output:    { name, price, description, images, variants }

Route:     POST /api/shopee/scrape-product
           → Body: { url }
           → Response: { success, data: { name, price, ... } }
```

### 2. Scraping Shopee — Dashboard Affiliate

```
Service:   shopee-affiliate-scraper (dibuat tim terpisah)
Fungsi:    Baca data performa dari dashboard affiliate

Input:     { session: "..." }
Output:    [{ product, views, clicks, commission }]

Route:     POST /api/shopee/scrape-dashboard
           → Body: { session }
           → Response: { success, data: [...] }
           
           GET /api/shopee/trending
           → Response: { success, data: [...] }
```

### 3. Scraping Berita (Detik, dsb)

```
Service:   news-scraper (dibuat tim terpisah)
Fungsi:    Scrape artikel trending dari portal berita

Input:     { source: "detik", category: "otomotif" }
Output:    [{ title, content, image, date }]

Route:     POST /api/news/scrape
           → Body: { source, category }
           → Response: { success, data: [...] }
```

### 4. Scraping jadiapa.com

```
Service:   jadiapa-scraper (dibuat tim terpisah)
Fungsi:    Baca saldo, pemakaian, harga dari jadiapa.com

Input:     { session: "..." }
Output:    { balance, usage: { images, videos }, prices }

Route:     GET  /api/jadiapa/balance
           → Response: { success, data: { balance, ... } }
           
           GET  /api/jadiapa/usage
           → Response: { success, data: { images, videos, ... } }
           
           POST /api/jadiapa/top-up
           → Body: { amount }
           → Response: { success, data: { newBalance } }
```

### 5. AI Generate Gambar (via jadiapa.com)

```
Fungsi:    Generate gambar dari prompt via jadiapa.com
Input:     { prompt, style?, resolution? }
Output:    { imageUrl, cost, remainingBalance }

Route:     POST /api/jadiapa/generate-image
           → Body: { prompt, style, resolution }
           → Response: { success, data: { imageUrl, cost, remainingBalance } }
```

### 6. AI Generate Video (via jadiapa.com)

```
Fungsi:    Generate video pendek dari prompt via jadiapa.com
Input:     { prompt, duration?, style? }
Output:    { videoUrl, cost, remainingBalance }

Route:     POST /api/jadiapa/generate-video
           → Body: { prompt, duration, style }
           → Response: { success, data: { videoUrl, cost, remainingBalance } }
```

### 7. AI Caption dari Berita

```
Fungsi:    Generate caption dari artikel berita + link affiliate
Input:     { article: { title, content }, affiliateLink, placement: "caption|comment" }
Output:    { caption, comment? }

Route:     POST /api/news/generate-caption
           → Body: { article, affiliateLink, placement }
           → Response: { success, data: { caption, comment } }
```

### 8. Auto Post via Bundle Social

```
Fungsi:    Posting konten ke semua akun dalam grup
Input:     { groupName, content: { caption, image?, link, comment? } }
Output:    { results: [{ account, platform, status }] }

Route:     POST /api/post/send
           → Body: { groupName, content }
           → Response: { success, data: { results: [...] } }
           
           SSE: POST /api/post/send/stream
           → Body: { groupName, content }
           → Response: text/event-stream
```

### 9. Schedule Posting

```
Fungsi:    Jadwalkan posting otomatis
Input:     { groupName, content, scheduledAt }
Output:    { id, status }

Route:     POST /api/schedule/create
           → Body: { groupName, content, scheduledAt }
           → Response: { success, data: { id } }
           
           GET /api/schedule/list
           → Response: { success, data: [...] }
           
           DELETE /api/schedule/:id
           → Response: { success }

Prime time defaults:
  Facebook  : 12:00-20:00 (Sel, Rab)
  Instagram : 12:00-21:00 (Sel, Rab)
  X/Twitter : 12:00-18:00 (Sel-Kam)
  TikTok    : 13:00-20:00 (Rab, Kam)
  Threads   : 12:00-18:00 (Sel-Kam)
  Pinterest : 10:00-13:00 (Sel-Kam)
  Minggu    : Jangan posting
```

### 10. Auto Retry Produk Bagus

```
Fungsi:    Analisis performa, repost produk bagus
Input:     { groupName }
Output:    { repost: [{ product, views, interval }], stop: [...] }

Route:     POST /api/retry/analyze
           → Body: { groupName }
           → Response: { success, data: { repost, stop } }
```

### 11. Link Affiliate Management

```
Fungsi:    Kelola link affiliate (manual + otomatis)
Input:     { url? } atau auto dari scrape
Output:    { id, url, product, placement }

Route:     POST /api/affiliate-link/add
           → Body: { url }
           → Response: { success, data: { id, product } }
           
           GET /api/affiliate-link/list
           → Response: { success, data: [...] }
           
           POST /api/affiliate-link/auto
           → Body: { groupName }
           → Response: { success, data: [...] }
```

---

## Database — Rencana Schema Baru

```sql
-- Produk Shopee yang discrape
CREATE TABLE affiliate_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  price TEXT,
  description TEXT,
  images TEXT,  -- JSON array
  variants TEXT, -- JSON array
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  commission TEXT,
  last_scraped_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Jadwal posting
CREATE TABLE post_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  group_name TEXT NOT NULL,
  content TEXT NOT NULL, -- JSON (caption, image, link, placement)
  scheduled_at TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  created_at TEXT DEFAULT (datetime('now'))
);

-- Konfigurasi jadiapa
CREATE TABLE jadiapa_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  api_key TEXT,
  balance TEXT,
  last_checked_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## Arsitektur File (Final)

```
src/
├── index.tsx
├── db/
│   ├── index.ts
│   └── schema.sql
├── lib/
│   ├── config.ts
│   ├── db.ts
│   ├── proxy.ts
│   ├── kumail.ts
│   ├── bunsocial.ts
│   ├── orchestrator.ts
│   ├── platform-connect.ts
│   ├── puppeteer.ts                      # hanya dipakai jika perlu
│   ├── news-caption.ts                   # 🔜
│   ├── jadiapa-generate.ts               # 🔜
│   ├── auto-post.ts                      # 🔜
│   ├── scheduler.ts                      # 🔜
│   ├── auto-retry.ts                     # 🔜
│   └── affiliate-link.ts                 # 🔜
├── middleware/
│   └── auth.ts
├── routes/
│   ├── auth.tsx
│   ├── dashboard.tsx
│   ├── admin/users.tsx
│   ├── posts.tsx
│   ├── content.tsx
│   ├── account.tsx
│   ├── personas.tsx
│   ├── persona-chat.tsx
│   ├── affiliate.tsx
│   ├── platform.tsx
│   ├── shopee.tsx                        # 🔜 proxy ke service scraping
│   ├── news.tsx                          # 🔜 proxy ke service scraping
│   ├── jadiapa.tsx                       # 🔜
│   ├── post.tsx                          # 🔜
│   └── affiliate-link.tsx                # 🔜
├── components/
│   ├── layout.tsx
│   ├── sidebar.tsx
│   └── navbar.tsx
└── views/
    ├── login.tsx
    ├── dashboard/
    ├── personas/
    ├── services/
    ├── admin/
    ├── posts/
    ├── content/
    ├── account/
    ├── affiliate/
    │   └── index.tsx
    ├── platform/
    │   └── connect.tsx
    ├── affiliate-link/                   # 🔜
    │   └── index.tsx
    ├── post/                             # 🔜
    │   └── index.tsx
    └── jadiapa/                          # 🔜
        └── index.tsx
```

---

## User Service Sessions

Setiap user perlu session sendiri untuk mengakses service pihak ketiga (jadiapa.com, Shopee Affiliate Dashboard). Session dikelola di dashboard, bukan di setiap akun Bunsocial.

### Kenapa per User, bukan per Akun?

```
User A
  ├── Bunsocial #1 (Info Dunia)
  ├── Bunsocial #2 (Info Dunia)
  ├── Bunsocial #3 (Info Bisnis)
  └── Bunsocial #4 (Info Bisnis)
  │
  └── 1 akun jadiapa.com     → dipakai semua Bunsocial
  └── 1 akun Shopee Affiliate → dipakai semua Bunsocial
```

Jadiapa dan Shopee Affiliate adalah resource user, bukan resource akun Bunsocial.

### Session Flow

```
User pertama kali setup
  │
  ▼
User input credentials di dashboard
  │
  ▼
Dashboard kirim credentials ke scraping service
  → Scraping service login ke platform (jadiapa/Shopee)
  → Return session token/cookies
  │
  ▼
Dashboard simpan token (encrypted) di DB per user
  │
  ▼
Setiap request berikutnya:
  Dashboard → kirim token → scraping service → gunakan session
  │
  ▼
Token expired?
  ├── Ya → scraping service return 401/error
  │        → Dashboard tampilkan "Session expired, re-login"
  └── Tidak → lanjut
```

### Schema

```sql
CREATE TABLE user_service_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  service TEXT NOT NULL,        -- 'jadiapa', 'shopee_affiliate'
  session_data TEXT NOT NULL,   -- encrypted JSON (cookies, tokens)
  status TEXT DEFAULT 'active', -- active, expired
  last_used_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, service)
);
```

### Routes

```
POST /api/session/setup
  → Body: { service: "jadiapa", credentials: { email, password } }
  → Dashboard: kirim ke scraping service → simpan token
  → Response: { success, status: "active" }

POST /api/session/renew
  → Body: { service: "jadiapa", credentials: { email, password } }
  → Dashboard: re-login via scraping service → update token
  → Response: { success, status: "active" }

GET /api/session/status
  → Response: { services: { jadiapa: "active", shopee_affiliate: "expired" } }
```

### Design Decisions

| Aspek | Pilihan |
|-------|---------|
| Di mana login? | Dashboard (user input credentials) → scraping service login |
| Simpan apa? | Encrypted session token, bukan plain credentials |
| Expired? | Scraping service return error → auto-trigger re-login prompt |
| Scope | Per user (bukan per akun Bunsocial) |

---

## Auth Migration — Better Auth

### Kenapa Ganti?
- JWT manual (custom HMAC-SHA256) → rawan bug, no standard
- Tidak ada rate limiting → brute force risk
- Tidak ada OTP / 2FA
- Tidak ada audit log

### Target: Better Auth

| Fitur | Status |
|-------|:------:|
| Email OTP sign-in | 🔜 |
| Username + password (fallback) | 🔜 |
| Rate limiting (max 3 OTP attempt) | 🔜 |
| Role-based (admin / user) | 🔜 |
| Session management (auto cookies) | 🔜 |
| SQLite adapter (bun:sqlite) | 🔜 |
| Hono integration (official) | 🔜 |

### Rencana Implementasi

```
1. Install: bun add better-auth
2. Buat:  src/lib/auth.ts (konfigurasi better-auth)
3. Update: src/index.tsx (mount auth handler)
4. Update: middleware/auth.ts (ganti ke session better-auth)
5. Update: views/login.tsx (email → OTP → verify)
6. Hapus: JWT manual (createToken, verifyToken)
7. Migrasi: user DB ke schema better-auth
```

### Flow Baru

```
Login:  email → kirim OTP → input OTP → verify → session
Reset:  email → kirim OTP → input OTP + password baru
Logout: hapus session
```

### Auth Config (src/lib/auth.ts)

```ts
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { getDB } from "../db";

export const auth = betterAuth({
  database: getDB(),
  emailAndPassword: { enabled: true },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Kirim OTP via email service
        // type: "sign-in" | "email-verification" | "forget-password"
      },
    }),
  ],
});
```

### Handler (src/index.tsx)

```ts
import { auth } from "./lib/auth";

app.all("/api/auth/*", (c) => auth.handler(c.req.raw));
```

### Middleware (ganti authMiddleware)

```ts
import { auth } from "../lib/auth";

export async function sessionMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) return c.redirect("/login");
  c.set("user", session.user);
  c.set("session", session);
  await next();
}
```

---

## Service Contracts (External)

Service scraping dibuat oleh tim terpisah. Dashboard hanya define contract dan panggil via HTTP.

| Service | Method | Input | Output |
|---------|--------|-------|--------|
| `shopee-product` | POST | `{ url }` | `{ name, price, description, images, variants }` |
| `shopee-affiliate` | POST | `{ session }` | `[{ product, views, clicks, commission }]` |
| `news` | POST | `{ source, category }` | `[{ title, content, image, date }]` |
| `jadiapa` | GET | `{ session }` | `{ balance, usage, prices }` |

Dashboard hanya perlu route proxy sederhana yang meneruskan request ke service terkait.