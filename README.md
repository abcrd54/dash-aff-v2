# Dashboard Management Affiliate — Admin Panel

Multi-user admin panel for managing affiliate accounts, personas, content, and backend services.  
Bun + Hono + TSX + Tailwind CSS + SQLite.

## Quick Start

```bash
cp .env.example .env
# Edit .env — set RESEND_API_KEY, BETTER_AUTH_SECRET, ENCRYPTION_KEY (min 32 chars)
bun install && bun run start
# → http://localhost:4000
# Login: admin / (password dari console output saat seed)
```

## Features

### Auth & Security
- **2FA Email OTP** — login 2-step: password → OTP email (Resend)
- **Role-based access** — admin/user roles, middleware-protected routes
- **Rate limiting** — 5 login attempts / 15 menit per IP
- **CSRF protection** — semua form POST/PUT/DELETE
- **Security headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Input validation** — Zod schemas di semua route
- **Encryption** — AES-256-GCM untuk kolom sensitif (access_token, api_key)

### Affiliate Management
- **Account generation** — 1-5 akun Bunsocial via SSE
- **Platform connect** — 6 platform: X, FB, Threads, IG, TikTok, Pinterest
- **Kumux Mail** — disposable email untuk signup affiliate

### Content & Posting
- **Affiliate link management** — kelola link affiliate
- **Post management** — auto-post via Bundle Social
- **Generate konten** — AI generate caption dari berita

### Account
- Password change, username change, email set, 2FA toggle
- Jadiapa balance monitoring

## Architecture

```
Dashboard Management Affiliate (:4000)
  │
  ├── /login              → Auth (2FA: password + OTP email)
  ├── /login/verify-otp   → OTP verification page
  ├── /dashboard          → Stats overview
  │
  ├── /affiliate          → Affiliate account generation (SSE)
  ├── /platform           → Platform connect (Bundle Social)
  ├── /affiliate-link     → Affiliate link management
  │
  ├── /post               → Social post management
  ├── /generate           → AI content generation
  ├── /settings           → App settings
  │
  ├── /account            → Account settings + 2FA
  ├── /manage-account     → Username change
  │
  └── /admin/users        → Admin: user CRUD (email required)

Services:
  Kumux Mail (:3010) — disposable email
  aff-personal (:3000) — persona service
  Resend — email OTP sender
```

## Configuration

| Env | Default | Description |
|---|---|---|
| `PORT` | `4000` | Server port |
| `JWT_SECRET` | — | Legacy JWT secret (required) |
| `BETTER_AUTH_SECRET` | — | Session encryption secret (32+ chars) |
| `BETTER_AUTH_URL` | `http://localhost:4000` | App URL for CSRF origin |
| `RESEND_API_KEY` | — | **Required.** Resend API key for OTP emails |
| `RESEND_FROM` | `onboarding@resend.dev` | From email address |
| `ENCRYPTION_KEY` | — | AES-256-GCM encryption key (32 chars) |
| `ADMIN_EMAIL` | `admin@localhost` | Default admin email on seed |
| `ADMIN_INITIAL_PASSWORD` | — | Default admin password on seed |
| `NODE_ENV` | — | Set to `production` for secure cookies |
| `DB_PATH` | `data/dam.db` | SQLite database path |
| `KUMAIL_URL` | `http://localhost:3010` | Kumux Mail service URL |
| `KUMAIL_API_KEY` | — | Kumux Mail API key |
| `BUNSOCIAL_URL` | — | Bunsocial service URL |
| `BUNSOCIAL_API_KEY` | — | Bunsocial API key |
| `PERSONA_SERVICE_URL` | `http://localhost:3000` | Persona service URL |
| `PERSONA_SERVICE_API_KEY` | — | Persona service API key |

## Docker

```bash
docker compose up -d
```

## Project Structure

```
src/
├── index.tsx              # Entry point, Hono app, middleware
├── db/
│   ├── index.ts           # SQLite init, seed, migration
│   └── schema.sql         # users, posts, affiliate_accounts, social_connections, etc
├── lib/
│   ├── db.ts              # All DB query functions
│   ├── auth.ts            # Better Auth configuration
│   ├── email.ts           # Resend OTP email sender
│   ├── encrypt.ts         # AES-256-GCM encryption/decryption
│   ├── validate.ts        # Zod schemas for input validation
│   ├── proxy.ts           # Service proxy
│   ├── kumail.ts          # Kumux Mail client
│   ├── bunsocial.ts       # Bunsocial client
│   ├── orchestrator.ts    # Affiliate onboarding orchestrator
│   └── platform-connect.ts # Platform connect flow
├── middleware/
│   ├── auth.ts            # Session auth + admin middleware
│   └── security.ts        # CSP, HSTS, security headers
├── routes/
│   ├── auth.tsx           # Login (2FA), logout, OTP verify
│   ├── dashboard.tsx      # Dashboard stats
│   ├── affiliate.tsx      # Affiliate account generation
│   ├── platform.tsx       # Platform connect routes
│   ├── affiliate-link.tsx # Affiliate link management
│   ├── post.tsx           # Social post management
│   ├── generate.tsx       # AI content generation
│   ├── settings.tsx       # App settings
│   ├── account.tsx        # Account, password, email, 2FA
│   ├── posts.tsx          # Content post CRUD
│   ├── persona-chat.tsx   # Chat with persona (WebSocket)
│   ├── personas.tsx       # Persona CRUD
│   └── admin/users.tsx    # Admin: user management
├── components/
│   ├── layout.tsx         # Page layout wrapper
│   ├── sidebar.tsx        # Navigation sidebar
│   └── navbar.tsx         # Top navbar
└── views/
    ├── login.tsx
    ├── login-verify.tsx   # OTP verification page
    ├── dashboard/
    ├── affiliate/
    ├── platform/
    ├── affiliate-link/
    ├── post/
    ├── generate/
    ├── settings/
    ├── account/
    ├── personas/
    ├── posts/
    └── admin/
```

## Database Schema

```sql
users              — id, username, email, password_hash, role, two_factor_enabled, timestamps
posts              — id, title, slug, body, status, author_id, timestamps
affiliate_accounts — id, user_id, name, email, password_hash, access_token, api_key, status
social_connections — id, account_id, platform, channel_id, status
affiliate_products — id, user_id, url, name, price, views, clicks
social_posts       — id, user_id, group_name, caption, link, status
jadiapa_config     — id, user_id, api_key, balance, usage counts
group_auto_post    — id, user_id, identity, niche, auto_post_enabled
```

## Security Checklist

| # | Item | Status |
|---|------|:------:|
| 1 | Security Headers (CSP, HSTS, X-Frame, etc) | ✅ |
| 2 | CSRF Protection | ✅ |
| 3 | XSS Protection (TSX auto-escape) | ✅ |
| 4 | SQL Injection Protection (parameterized) | ✅ |
| 5 | Input Validation (Zod) | ✅ |
| 6 | 2FA Email OTP | ✅ |
| 7 | Rate Limiting | ✅ |
| 8 | RBAC (admin/user) | ✅ |
| 9 | Secure Cookies (httpOnly, Strict) | ✅ |
| 10 | AES-256-GCM Encryption | ✅ |
| 11 | Secrets Management (.env, .gitignore) | ✅ |
| 12 | Body Size Limit (10MB) | ✅ |
| 13 | Self-delete Protection | ✅ |

## Tech Stack

- **Runtime:** Bun
- **Framework:** Hono + TSX
- **Database:** SQLite (bun:sqlite, WAL mode)
- **Auth:** Session cookie + 2FA Email OTP (Resend)
- **Validation:** Zod
- **Encryption:** AES-256-GCM (Web Crypto API)
- **Styling:** Tailwind CSS
- **Interactivity:** HTMX + Alpine.js + SweetAlert2