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
| Session cookie (httpOnly, Strict, 24h) | `middleware/auth.ts` | ✅ |
| 2FA Email OTP (Resend) | `routes/auth.tsx`, `lib/email.ts` | ✅ |
| Rate limiting login (5/15m) | `index.tsx` | ✅ |
| CSRF protection | `index.tsx` | ✅ |
| Security headers (CSP, HSTS, etc) | `middleware/security.ts` | ✅ |
| Zod input validation | `lib/validate.ts` | ✅ |
| AES-256-GCM encryption | `lib/encrypt.ts` | ✅ |
| Admin + user roles | `db/schema.sql` | ✅ |
| CRUD user management (email wajib) | `routes/admin/users.tsx` | ✅ |
| Password change / username change / email set / 2FA toggle | `routes/account.tsx` | ✅ |

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
| `RESEND_API_KEY`, `RESEND_FROM` | `.env` + `.env.example` | ✅ |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | `.env` + `.env.example` | ✅ |
| `ENCRYPTION_KEY` | `.env` + `.env.example` | ✅ |
| `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD` | `.env` + `.env.example` | ✅ |
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
│   ├── encrypt.ts                        # AES-256-GCM encryption
│   ├── validate.ts                       # Zod schemas
│   ├── email.ts                          # Resend OTP sender
│   ├── news-caption.ts                   # 🔜
│   ├── jadiapa-generate.ts               # 🔜
│   ├── auto-post.ts                      # 🔜
│   ├── scheduler.ts                      # 🔜
│   ├── auto-retry.ts                     # 🔜
│   └── affiliate-link.ts                 # 🔜
├── middleware/
│   ├── auth.ts
│   └── security.ts
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

## Auth Migration — Custom 2FA with Zod + Resend

### Yang Sudah Dibangun
- JWT manual (custom HMAC-SHA256) diganti dengan **session cookie JSON** (lebih sederhana, tanpa dependency JWT library)
- CSRF protection via `hono/csrf` middleware
- Rate limiting via `hono-rate-limiter`

### Fitur Baru

| Fitur | Status |
|-------|:------:|
| Username + password (step 1) | ✅ |
| Email OTP (2FA, step 2) | ✅ |
| Resend email service | ✅ |
| Rate limiting (5 attempt / 15 menit) | ✅ |
| Role-based (admin / user) | ✅ |
| Session management (httpOnly, Strict, 24h) | ✅ |
| SQLite (bun:sqlite) | ✅ |
| Input validation (Zod) | ✅ |
| CSRF protection | ✅ |
| Security headers (CSP, HSTS, etc) | ✅ |
| AES-256-GCM encryption (sensitive columns) | ✅ |

### Flow Login

```
Login:  email + password → kirim OTP email → input OTP → verify → session
Admin:  wajib set email saat create user → 2FA otomatis aktif
User:   set email di halaman account → aktifkan 2FA
```
Logout: hapus session
```

Better Auth sudah menyediakan semua fitur di atas built-in — tinggal install, konfigurasi, dan ganti middleware auth.

---

## Security Hardening

### 1. WAF (Web Application Firewall)

```
Layer:    Reverse proxy / edge (Nginx, Cloudflare, Bun)
Fungsi:   Filter malicious traffic sebelum masuk ke aplikasi

Setup:
  - Cloudflare (free) → auto WAF rules, DDoS protection
  - Nginx reverse proxy → mod_security, rate limiting
  - Bun built-in → trustedProxy, request size limit
```

### 2. DDoS Protection

```
Layer:    Edge + Application
Fungsi:   Cegah traffic flood

Setup:
  - Cloudflare DDoS protection (free, auto)
  - Rate limiting per IP (Bun/Hono middleware)
  - Request size limit: max 10MB body
  - Connection timeout: 30s
  - Max concurrent connections per IP
```

### 3. SSL/TLS & HTTPS

```
Layer:    Transport
Fungsi:   Enkripsi traffic client ↔ server

Setup:
  - Cloudflare SSL (free, auto-renew)
  - Let's Encrypt + Certbot (self-managed)
  - Hono: redirect HTTP → HTTPS
  - Minimum TLS 1.2, prefer TLS 1.3
  - HSTS header: max-age=31536000; includeSubDomains; preload
```

### 4. Security Headers

```
Layer:    HTTP Response
Fungsi:   Perintah ke browser untuk membatasi perilaku

di Hono middleware:
  Content-Security-Policy:   default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
  X-Content-Type-Options:    nosniff
  X-Frame-Options:           DENY
  X-XSS-Protection:          1; mode=block
  Referrer-Policy:           strict-origin-when-cross-origin
  Permissions-Policy:        camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 5. CSP (Content Security Policy)

```
Layer:    Browser
Fungsi:   Batasi sumber daya yang bisa dimuat halaman

Setup (Hono middleware):
  - default-src 'self' — hanya load dari origin sendiri
  - script-src 'self' — block inline script kecuali explicit
  - style-src 'self' 'unsafe-inline' — izinkan Tailwind inline
  - img-src 'self' data: https: — izinkan gambar external
  - connect-src 'self' ws: wss: — izinkan WebSocket
  - frame-ancestors 'none' — cegah iframe embed
  - Report-Only mode dulu untuk testing, lalu enforce
```

### 6. CSRF Protection

```
Layer:    Application
Fungsi:   Cegah cross-site request forgery

Setup:
  - Hono: CSRF middleware (built-in atau hono/csrf)
  - Token di setiap form POST/PUT/DELETE
  - SameSite=Strict pada cookies
  - Origin/Referer header check
  - Custom header requirement untuk AJAX (X-Requested-With)
```

### 7. XSS Protection

```
Layer:    Application + Browser
Fungsi:   Cegah cross-site scripting

Setup:
  - TSX auto-escape semua output (Hono JSX aman)
  - Jangan pakai dangerouslySetInnerHTML / raw() kecuali trusted
  - CSP header (no inline script)
  - Input validation: strip HTML tags dari user input
  - Sanitasi URL parameter sebelum render
```

### 8. SQL Injection Protection

```
Layer:    Database
Fungsi:   Cegah SQL injection

Setup:
  - bun:sqlite pakai parameterized queries (aman by default)
  - JANGAN string concatenation untuk query
  - Semua query pakai ? placeholder
  - Validate input type sebelum query (number, string, etc)
  - Gunakan ORM / query builder jika memungkinkan
```

### 9. Input Validation & Sanitization

```
Layer:    Application
Fungsi:   Validasi semua input user

Setup:
  - Hono: Zod / Valibot integration untuk route validation
  - Sanitasi: strip HTML, trim whitespace, enforce max length
  - Type coercion: pastikan number adalah number
  - White-list approach: tolak kecuali explicitly allowed
  - Regex validation untuk email, URL, slug
```

### 10. Authentication & MFA

```
Layer:    Application
Fungsi:   Verifikasi identitas user

Setup:
  - Better Auth: email OTP (MFA via email)
  - Password policy: min 8 char, 1 uppercase, 1 number, 1 special
  - Rate limit login: max 5 attempt / 15 menit per IP
  - Account lockout: setelah 5x gagal → kunci 15 menit
  - Audit log: catat semua login attempt
```

### 11. Secure Session Management

```
Layer:    Application
Fungsi:   Kelola session user dengan aman

Setup:
  - Better Auth: auto-handle session cookies
  - Cookie: httpOnly, Secure, SameSite=Strict
  - Session expiry: 24 jam (configurable)
  - Session ID: random, min 128-bit entropy
  - Rotate session ID after login
  - Invalidate session on logout / password change
  - No session in URL / localStorage
```

### 12. Access Control & RBAC

```
Layer:    Application
Fungsi:   Batasi akses berdasarkan role

Setup:
  - adminMiddleware: hanya admin bisa akses /admin/*
  - authMiddleware: semua user harus login
  - Resource ownership: user hanya lihat/edit data sendiri
  - Better Auth: role field di user table
  - Principle of least privilege: user hanya bisa apa yang dibutuhkan
```

### 13. Rate Limiting

```
Layer:    Application + Edge
Fungsi:   Batasi request per waktu

Setup:
  - Cloudflare: rate limiting rules (free tier)
  - Hono: rate limiter middleware
  - Login: 5 req / 15 menit per IP
  - API: 60 req / menit per user
  - SSE: 1 concurrent stream per user
  - General: 100 req / menit per IP
```

### 14. Bot Protection

```
Layer:    Edge + Application
Fungsi:   Cegah bot / scraper

Setup:
  - Cloudflare Bot Management (free)
  - Honeypot fields di form (hidden input, bot akan isi)
  - reCAPTCHA / hCaptcha di login page
  - User-agent check
  - Request timing analysis (terlalu cepat = bot)
```

### 15. API Security

```
Layer:    Application
Fungsi:   Amankan API endpoints

Setup:
  - Semua API route wajib auth (authMiddleware)
  - API key rotation untuk external service
  - Request body size limit
  - Timeout: 30s untuk semua API call
  - CORS: whitelist origin, bukan wildcard
  - Response: jangan expose stack trace di error
  - Log semua API call (method, path, status, duration)
```

### 16. Secure Cookies

```
Layer:    HTTP
Fungsi:   Amankan cookie session

Setup:
  - httpOnly: true (tidak bisa diakses JS)
  - secure: true (hanya via HTTPS)
  - sameSite: "Strict" (cegah CSRF)
  - path: "/" (tersedia di semua route)
  - maxAge: 86400 (24 jam)
  - domain: explicit, jangan wildcard
  - Prefix: __Host- untuk binding ke domain
```

### 17. Database Security

```
Layer:    Data
Fungsi:   Amankan data di SQLite

Setup:
  - WAL mode (sudah enabled)
  - Foreign keys ON (sudah enabled)
  - File permission: 600 (hanya owner read/write)
  - Backup: daily cron job ke external storage
  - No raw SQL in logs
  - Encrypt sensitive columns (password_hash sudah bcrypt)
  - Vacuum secara berkala
```

### 18. Encryption

```
Layer:    Data
Fungsi:   Enkripsi data sensitif

Setup:
  - Password: bcrypt (sudah diterapkan)
  - API keys / tokens: AES-256-GCM encryption at rest
  - Session data: encrypted di DB
  - JWT: HS256 (Better Auth handle)
  - Environment variables: .env tidak di-commit ke git
  - TLS 1.3 untuk data in transit
```

### 19. Secrets Management

```
Layer:    Infrastructure
Fungsi:   Kelola secrets dengan aman

Setup:
  - .env file: local development only
  - Production: environment variables via Docker / systemd
  - JANGAN hardcode secrets di source code
  - JANGAN commit .env ke git (sudah di .gitignore)
  - Rotate secrets secara berkala
  - Gunakan vault/secret manager untuk production
```

### 20. Secure Backups

```
Layer:    Data
Fungsi:   Backup data dengan aman

Setup:
  - Daily backup SQLite (cron job)
  - Backup dienkripsi sebelum disimpan
  - Simpan di lokasi berbeda (external storage / cloud)
  - Retensi: 7 hari terakhir
  - Test restore secara berkala
  - Backup automation: script / Docker volume backup
```

### 21. Logging & Monitoring

```
Layer:    Observability
Fungsi:   Lacak aktivitas dan deteksi anomali

Setup:
  - Login attempts: success + failure + IP + timestamp
  - API calls: method, path, status, duration, user
  - Error logs: stack trace (jangan expose ke client)
  - Rate limit events: catat saat user di-rate-limit
  - Security events: failed auth, invalid token, CSRF block
  - Log format: structured JSON
  - Log retention: 30 hari
  - Monitoring: health check endpoint, uptime alert
```

---

## Security Checklist

| # | Item | Status |
|---|------|:------:|
| 1 | WAF (Cloudflare / Nginx) | 🔜 |
| 2 | DDoS Protection | 🔜 |
| 3 | SSL/TLS + HTTPS | 🔜 |
| 4 | Security Headers | ✅ |
| 5 | Content Security Policy | ✅ |
| 6 | CSRF Protection | ✅ |
| 7 | XSS Protection | ✅ (TSX auto-escape) |
| 8 | SQL Injection Protection | ✅ (parameterized queries) |
| 9 | Input Validation | ✅ (Zod) |
| 10 | Authentication + MFA (2FA Email OTP) | ✅ |
| 11 | Secure Session Management | ✅ |
| 12 | Access Control (RBAC) | ✅ (adminMiddleware) |
| 13 | Rate Limiting | ✅ |
| 14 | Bot Protection | 🔜 |
| 15 | API Security (auth + CORS) | 🔜 |
| 16 | Secure Cookies | ✅ |
| 17 | Database Security | ✅ (WAL, FK, bcrypt, no plaintext) |
| 18 | Encryption | ✅ (bcrypt + AES-256-GCM) |
| 19 | Secrets Management | ✅ (.env, .gitignore) |
| 20 | Secure Backups | 🔜 |
| 21 | Logging & Monitoring | 🔜 |

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
