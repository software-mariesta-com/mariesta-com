# MARIESTA

**One group. Many companies.**

MARIESTA is a community of businesses built on expression, culture, sharing, and ownership. This repository is the official website and admin app: a public marketing site plus a private console for managing businesses, facilities, departments, members, partners, careers, and users.

## Features

### Public site

- Marketing pages: Home, About, Careers
- Published businesses, members, partners, and job posts via public APIs
- SEO-ready pages (titles, descriptions, Open Graph, Twitter cards, JSON-LD where applicable)
- Locales: English (`en`), Myanmar (`my`), Japanese (`ja`) via Paraglide

### Private admin

- Auth with Better Auth (email/password, optional GitHub OAuth, OTP, password reset, 2FA)
- Roles: `owner`, `admin`, `member` (owner/admin for user management)
- CRUD for businesses, facilities, departments, members, partners, job posts, and users
- Image uploads for partner logos and member photos (Tigris / S3-compatible storage, proxied at `/api/media/...`)

## Stack

| Layer | Choice |
| --- | --- |
| Framework | SvelteKit (Svelte 5) + TypeScript |
| UI | Tailwind CSS 4 + daisyUI 5.7.9 |
| Icons | Lucide (`@lucide/svelte` 1.28.0), Simple Icons for brands |
| Animation | GSAP |
| Auth | Better Auth |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Validation | Zod |
| i18n | Paraglide JS |
| Content | mdsvex |
| Object storage | Tigris (S3-compatible via AWS SDK) |
| Email | Nodemailer (Gmail SMTP for OTP / password reset) |
| Adapter | `@sveltejs/adapter-netlify` |
| Tests | Vitest (unit) + Playwright (e2e) |
| Quality | Prettier + ESLint |

## Requirements

- Node.js 22+ (recommended)
- npm
- A PostgreSQL database (Neon or any Postgres with a connection string)
- Optional: GitHub OAuth app, Gmail App Password, Tigris bucket

## Quick start

```sh
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, ORIGIN, BETTER_AUTH_SECRET, etc.

# Push schema to the database
npm run db:push

# Promote the first user to owner (after you sign up), if needed
npm run db:ensure-owner

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```sh
# Or open the browser automatically
npm run dev -- --open
```

## Environment variables

Copy `.env.example` to `.env`. Variables are also declared in `src/env.ts`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string |
| `ORIGIN` | Yes | App base URL (e.g. `http://localhost:5173`) |
| `BETTER_AUTH_SECRET` | Yes | Auth signing secret (32+ chars, high entropy in production) |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |
| `SMTP_HOST` | No* | SMTP host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | No* | SMTP port (`587` or `465`) |
| `SMTP_USER` | No* | SMTP username |
| `SMTP_PASS` | No* | SMTP password (Gmail App Password) |
| `SMTP_FROM` | No* | From address for auth emails |
| `TIGRIS_ACCESS_KEY_ID` | No** | Tigris / S3 access key |
| `TIGRIS_SECRET_ACCESS_KEY` | No** | Tigris / S3 secret key |
| `TIGRIS_ENDPOINT_URL` | No** | S3 endpoint (e.g. `https://t3.storage.dev`) |
| `TIGRIS_REGION` | No** | Region (`auto` for Tigris) |
| `TIGRIS_BUCKET_NAME` | No** | Bucket for uploaded images |

\* Needed for OTP and password-reset emails.  
\*\* Needed for partner logos and member photo uploads. Prefer a bucket name without dots (dotted names can break Tigris public CDN SSL). Images are served through `/api/media/...`, so private buckets work. Use `TIGRIS_*` names, not `AWS_*` (Netlify reserves `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`).

### GitHub OAuth

Callback URL: `{ORIGIN}/api/auth/callback/github`

### Gmail SMTP

Use an [App Password](https://myaccount.google.com/apppasswords), not your normal Google password.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite / SvelteKit dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run check` | `svelte-check` type / Svelte diagnostics |
| `npm run lint` | Prettier check + ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Unit tests then e2e tests |
| `npm run test:unit` | Vitest |
| `npm run test:e2e` | Playwright (installs browsers if needed) |
| `npm run db:push` | Push Drizzle schema to the database |
| `npm run db:generate` | Generate SQL migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:ensure-owner` | Promote oldest `auth_user` to `owner` if none exists |
| `npm run auth:schema` | Regenerate Better Auth tables into `schema/auth.ts` |

`prepare` runs on install: SvelteKit sync + Paraglide compile.

## Project structure

```
src/
  lib/
    asset/          # fonts, styles, images
    attachments/    # Svelte attachments (e.g. click-outside)
    components/     # shared UI
    constants/
    paraglide/      # generated i18n (do not edit by hand)
    remotes/        # remote functions (validation + DB)
    schemas/        # Zod / shared schemas
    server/         # auth, db, permissions (server-only)
      db/schema/    # auth_*, master_*, info_*
    store/          # client state helpers
    tool/           # app-specific helpers
    util/           # reusable helpers
  routes/
    (public)/       # marketing + auth (login, sign-up, OTP, reset, 2FA)
    (private)/      # dashboard, CRUD pages (session required)
    api/            # HTTP handlers (pages call these, not remotes)
    demo/           # scaffold demos
messages/           # Paraglide source: en.json, my.json, ja.json
scripts/            # e.g. ensure-owner.mjs
static/             # static assets
```

### Domain model (master)

Org hierarchy and content live under `master_*` tables:

```
business → facility → department → member
partner
career (job posts)
```

Publish status is typically `draft` | `published`. Careers include employment type, workplace type, salary unit, and related fields.

### Auth roles

| Role | Notes |
| --- | --- |
| `owner` | Exactly one; full access |
| `admin` | Elevated access including user management |
| `member` | Default role |

## Architecture: CRUD workflow

When adding or changing an entity, follow this order:

```
schema → remote → API (HTTP) ← page
```

1. **Schema** — `src/lib/server/db/schema/{auth,master,info}.ts`
2. **Remote** — `src/lib/remotes/{entity}.remote.ts` (Zod validation + DB)
3. **API** — `src/routes/api/{entities}/+server.ts` and `[id]/+server.ts`
4. **Page** — `src/routes/(private)/{entities}/` (or public) using `fetch('/api/...')` only

Rules:

- Pages must not import remotes for data access; use HTTP `/api/...`
- API handlers must not run raw Drizzle queries; call remotes
- After schema changes: `npm run db:push` (or generate + migrate)
- After Better Auth config changes: `npm run auth:schema`

## Locales

Source messages: `messages/en.json`, `messages/my.json`, `messages/ja.json`.  
Paraglide compiles into `src/lib/paraglide/` on `prepare` / install.

## Building and deploying

```sh
npm run build
npm run preview
```

### Netlify

This app uses `@sveltejs/adapter-netlify` (SSR via Netlify Functions). Config lives in `netlify.toml` (`publish = "build"`).

1. Connect the GitHub repo in Netlify (build command and publish dir come from `netlify.toml`)
2. Set environment variables in Netlify (same names as `.env.example`), including:
   - `ORIGIN` = `https://mariesta.netlify.app` (or your custom domain)
   - `DATABASE_URL`, `BETTER_AUTH_SECRET`, SMTP, and `TIGRIS_*` as needed
3. Do **not** use reserved names `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, or `AWS_REGION` (use `TIGRIS_*`)
4. Leave Runtime unset / use the SvelteKit adapter output (do not treat `build` as a static-only site)
5. After first deploy: sign up, then ensure an owner exists (`npm run db:ensure-owner` against the production DB if needed)

Typical checklist:

1. Set all required env vars on the host
2. Run `npm run db:push` or migrate against production DB
3. Push to `main` (or trigger a deploy)
4. Confirm `/` redirects to `/home` and SSR pages load (not Netlify's generic 404)

## Testing

```sh
# Unit / component
npm run test:unit

# End-to-end (Playwright)
npm run test:e2e

# Both
npm run test
```

## Brand notes

- Wordmark is text only: always render **MARIESTA** (all capitals) with the `logo-wordmark` class
- Do not use title case (`Mariesta`) for the full wordmark in UI

## License

Private project (`"private": true` in `package.json`). All rights reserved unless otherwise stated.
