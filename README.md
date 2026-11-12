# Mohamed Amine Gharbi · Portfolio

Personal portfolio of an AI & Data Engineering student at EMSI Casablanca. All content (profile, projects, journey, skills, FAQ, CV) is stored in PostgreSQL and edited from a private `/admin` space, so the site can be updated without touching code.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 7 + PostgreSQL · Auth.js · Vercel Blob · Vitest

## Features

- **Public site:** hero with an "ask-amine" FAQ terminal, project grid and case-study pages, Data → Model → API → Interface skills pipeline, timeline, contact, EN/FR interface, JSON-LD, sitemap, Open Graph image.
- **Fast pages:** statically rendered (ISR). Every save in the admin rebuilds the public pages immediately.
- **Admin (`/admin`):**
  - Profile: name, headline, intro, availability, email, social links, accent color, photo, CV (PDF).
  - Projects (cover, gallery, stack, collaborators, links, featured), experience, timeline, skill groups and skills, FAQ.
  - Drag-and-drop ordering (mouse, touch and keyboard), draft/published status, confirmation before deleting, toasts.
- **Security:** single admin account from environment variables (bcrypt hash), login rate-limited to 5 failures per 15 min per IP, `/admin` guarded by `proxy.ts` and every server action re-checks the session, uploads validated by their real file signature and size.

## Run locally

Requirements: Node.js 20+, a PostgreSQL database (local or [Neon](https://neon.tech)).

```bash
npm install
cp .env.example .env        # then fill it in, see below
npm run db:deploy           # create the tables
npm run db:seed             # initial content (skipped if content already exists)
npm run dev                 # http://localhost:3000
```

> **Windows / PowerShell:** if `npm` is blocked ("running scripts is disabled"), run once:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, or use `npm.cmd`.

### Environment variables

| Variable                | Purpose                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection. On Neon, the **pooled** URL (host contains `-pooler`).           |
| `DIRECT_URL`            | Direct (non-pooled) URL, used by migrations. Optional locally.                          |
| `NEXT_PUBLIC_SITE_URL`  | Public URL of the site (canonical links, sitemap, Open Graph).                          |
| `AUTH_SECRET`           | Signs the session cookie. Generate with `npx auth secret` or `openssl rand -base64 32`. |
| `ADMIN_EMAIL`           | Email used to log in to `/admin`.                                                       |
| `ADMIN_PASSWORD_HASH`   | bcrypt hash of the admin password (see below).                                          |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token. Leave empty locally: uploads are then saved in `public/uploads`.     |

### Admin password

```bash
npm run hash-password -- "a-long-password-of-12-characters-or-more"
```

The script prints two values:

1. a line to paste into `.env` (the `$` signs are escaped as `\$`, because Next.js expands variables in `.env` files);
2. the raw hash to paste into Vercel's environment variables (no escaping there).

Restart `npm run dev`, then sign in at `/admin/login`.

## Scripts

| Command                                           | What it does                                            |
| ------------------------------------------------- | ------------------------------------------------------- |
| `npm run dev`                                     | Development server                                      |
| `npm run build` / `npm start`                     | Production build / server                               |
| `npm run typecheck` · `npm run lint` · `npm test` | Checks                                                  |
| `npm run db:migrate`                              | Create a migration after editing `prisma/schema.prisma` |
| `npm run db:deploy`                               | Apply migrations                                        |
| `npm run db:seed`                                 | Seed initial content (`SEED_FORCE=1` wipes and reseeds) |
| `npm run db:studio`                               | Browse the database                                     |
| `npm run hash-password`                           | Hash the admin password                                 |

## Deploy (Vercel + Neon)

1. **Database:** create a Neon project. Copy the pooled connection string (`DATABASE_URL`) and the direct one (`DIRECT_URL`).
2. **Tables and content:** from your machine, with those two URLs in `.env`, run `npm run db:deploy` then `npm run db:seed`.
3. **Vercel project:** import the GitHub repository. Framework preset: Next.js (build command `npm run build`).
4. **Environment variables:** add `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (raw hash).
5. **Uploads:** Storage → create a Blob store and connect it to the project; `BLOB_READ_WRITE_TOKEN` is added automatically. Redeploy.
6. **Check:** open `/admin/login`, sign in, upload the profile photo and CV again (files uploaded locally stay on your machine).

## Project structure

```
app/(site)/          public pages (home, /projects/[slug])
app/admin/           login page and admin space (route group (panel) = signed-in pages)
app/api/             Auth.js handler and the admin upload endpoint
components/site/     public UI          components/admin/   admin UI
lib/                 database, queries, auth, admin helpers (forms, storage, rate limit)
prisma/              schema, migrations, seed
proxy.ts             guards /admin and /api/admin
tests/               unit tests (upload validation, form rules)
```
