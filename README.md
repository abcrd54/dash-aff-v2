# Digital Affiliate Manager — Admin Panel

Multi-user admin panel for managing personas, content, and backend services. Bun + Hono + TSX + Tailwind CSS + SQLite.

## Quick Start

```bash
cp .env.example .env
# Edit .env → set JWT_SECRET (random 32+ chars)
bun install && bun run start
# → http://localhost:4000
# Login: admin / admin123 (change on first login)
```

## Features

- **Multi-user** — admin/user roles, JWT auth, bcrypt passwords
- **Multi-service** — connect to aff-personal, bundle, or any backend service
- **Persona Management** — create, list, delete personas via proxy to aff-personal
- **Chat** — WebSocket streaming chat with personas
- **Posts** — content management with draft/published status
- **Content** — key-value content blocks
- **Account** — password change, username change
- **Docker** — ready to deploy

## Architecture

```
Digital Affiliate Manager (:4000)
  │
  ├── /login              → Auth (JWT + bcrypt)
  ├── /dashboard          → Stats overview
  │
  ├── /personas           → Persona CRUD (proxy → aff-personal :3000)
  ├── /personas/:id/chat  → Chat UI (WebSocket → aff-personal :3000)
  │
  ├── /posts              → Post management
  ├── /content            → Content management
  ├── /account            → Account settings
  ├── /manage-account     → Username change
  │
  ├── /services           → Admin: service config (aff-personal, bundle, ...)
  └── /admin/users        → Admin: user management + service assignment

Proxy Layer:
  Admin ↔ aff-personal (via service API key, 30s timeout)
  Admin ↔ bundle         (via service API key, future)
```

## Setup Flow

1. Login as admin
2. Go to **Services** → Add aff-personal (name, slug, base_url, api_key)
3. Go to **Users** → Create user → Click service name to assign access
4. User login → **Akun Personal** → Create persona → Chat

## Configuration

| Env | Default | Description |
|---|---|---|
| `PORT` | `4000` | Server port |
| `JWT_SECRET` | — | **Required.** JWT signing secret |
| `NODE_ENV` | — | Set to `production` for secure cookies |
| `DB_PATH` | `data/dam.db` | SQLite database path |

## Docker

```bash
docker compose up -d
```

## Project Structure

```
src/
├── index.tsx              # Entry point, Hono app
├── db/
│   ├── index.ts           # SQLite init + seed
│   └── schema.sql         # users, posts, content, services, user_personas
├── lib/
│   ├── db.ts              # All DB query functions
│   └── proxy.ts           # Service proxy (timeout, error handling)
├── middleware/
│   └── auth.ts            # JWT create/verify, auth middleware
├── routes/
│   ├── auth.tsx           # Login/logout
│   ├── dashboard.tsx      # Dashboard stats
│   ├── personas.tsx       # Persona CRUD (proxy to aff-personal)
│   ├── persona-chat.tsx   # Chat with persona (WebSocket)
│   ├── services.tsx       # Admin: backend service config
│   ├── admin/users.tsx    # Admin: user management
│   ├── posts.tsx          # Post CRUD
│   ├── content.tsx        # Content CRUD
│   └── account.tsx        # Account settings
├── components/
│   ├── layout.tsx         # Page layout wrapper
│   ├── sidebar.tsx        # Navigation sidebar
│   └── navbar.tsx         # Top navbar
└── views/
    ├── login.tsx
    ├── dashboard/
    ├── personas/           # index.tsx, chat.tsx
    ├── services/
    ├── admin/
    ├── posts/
    ├── content/
    └── account/
```

## Database Schema

```sql
users           — id, username, password_hash, role, timestamps
posts           — id, title, slug, body, status, author_id, timestamps
content         — id, key, title, body, updated_at
services        — id, name, slug, base_url, api_key, is_active
user_services   — user_id, service_id (which services a user can access)
user_personas   — user_id, persona_id, service_id, session_id, persona_name
```

## Tech Stack

- **Runtime:** Bun
- **Framework:** Hono + TSX
- **Database:** SQLite (bun:sqlite, WAL mode)
- **Styling:** Tailwind CSS
- **Auth:** JWT (HMAC-SHA256) + bcrypt
- **Interactivity:** HTMX + Alpine.js