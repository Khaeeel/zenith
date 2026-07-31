# Zenith · ARC Tracker

**APEX RESISTANCE COALITION (ARC)** — cinematic MIR4 / Zenith fan site with a public tracker dashboard and an admin hub backed by Postgres.

Repo: [github.com/dominickooya/zenith](https://github.com/dominickooya/zenith)

## What you get

- **Homepage** — branded landing, Join modal, Contact link
- **Dashboard** (`/dashboard`) — clans, events, announcements overview
- **Contact** (`/contact`) — offices, channels, inquiry form
- **Admin** (`/admin`) — clans, members, events, contacts/applicants, announcements, alliances

## Prerequisites

Install these before setup:

| Tool | Version / notes |
|------|-----------------|
| [Node.js](https://nodejs.org/) | **20+** (LTS recommended) |
| npm | Comes with Node |
| [Git](https://git-scm.com/) | To clone this repo |
| PostgreSQL | Local Docker **or** a free [Neon](https://neon.tech) project |

Optional:

| Tool | Why |
|------|-----|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Easiest local Postgres |
| [Resend](https://resend.com) API key | Join-application emails |
| [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) token | Media uploads (later) |

## Clone & install

```bash
git clone https://github.com/dominickooya/zenith.git
cd zenith
npm install
```

`postinstall` runs `prisma generate` automatically.

## Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Postgres — Neon or local Docker (see below)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# Auth.js — required for /admin
AUTH_SECRET="paste-a-long-random-string-here"
AUTH_URL="http://localhost:3000"

# Optional
BLOB_READ_WRITE_TOKEN=""
RESEND_API_KEY=""
EMAIL_FROM="ARC Tracker <onboarding@resend.dev>"

# Used only when seeding
SEED_ADMIN_PASSWORD="ChangeMe123!"
```

Generate `AUTH_SECRET`:

```bash
# macOS / Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

**Never commit `.env`.** Only `.env.example` is tracked.

### Local Postgres with Docker

```bash
docker run -d --name tmzn-postgres \
  -e POSTGRES_USER=tmzn \
  -e POSTGRES_PASSWORD=tmzn \
  -e POSTGRES_DB=tmzn \
  -p 5433:5432 \
  postgres:16
```

Then in `.env`:

```env
DATABASE_URL="postgresql://tmzn:tmzn@localhost:5433/tmzn?schema=public"
AUTH_SECRET="your-generated-secret"
AUTH_URL="http://localhost:3000"
SEED_ADMIN_PASSWORD="ChangeMe123!"
```

If the container already exists:

```bash
docker start tmzn-postgres
```

### Neon (cloud Postgres)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string into `DATABASE_URL`
3. Keep `?sslmode=require` (Neon includes this)

## Database: migrate & seed

```bash
npm run db:migrate
npm run db:seed
```

- `db:migrate` applies Prisma migrations
- `db:seed` creates servers, Zenith clan sample data, events, contacts, and admin users

### Seeded admin logins

Sign in at **http://localhost:3000/admin/login**

| Email | Role |
|-------|------|
| `admin@arc-zenith.local` | Super admin |
| `zenith.leader@arc-zenith.local` | Clan admin |
| `zenith.elder@arc-zenith.local` | Elder |
| `dragon.admin@arc-zenith.local` | Clan admin |

Default password: **`ChangeMe123!`** (or whatever you set in `SEED_ADMIN_PASSWORD`).

Change these passwords after first login in production.

## Run the app

```bash
npm run dev
```

Open:

- Site: http://localhost:3000  
- Dashboard: http://localhost:3000/dashboard  
- Events (sidebar): http://localhost:3000/dashboard/events  
- Contact: http://localhost:3000/contact  
- Admin: http://localhost:3000/admin  

## Useful scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:push` | Push schema without a migration file |
| `npm run db:seed` | Seed sample data + admins |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

## Project layout (high level)

```
app/                 # Next.js App Router (home, dashboard, contact, admin)
components/          # UI (dashboard hub, admin, site chrome, 3D)
lib/                 # DB, auth helpers, server actions, queries
prisma/              # schema, migrations, seed
public/              # static assets & 3D models
auth.ts              # Auth.js config
proxy.ts             # Protects /admin/** routes
.env.example         # Env template
DEPLOY.md            # Vercel / production notes
```

## Production deploy

See **[DEPLOY.md](./DEPLOY.md)** for Vercel + Neon checklist:

1. Set env vars on the host (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, …)
2. `npx prisma migrate deploy`
3. Optional: `npm run db:seed`
4. Deploy with `npm run build`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `PrismaClient` / schema errors | Run `npm run db:generate` then restart `npm run dev` |
| Can't connect to DB | Confirm Postgres is running and `DATABASE_URL` matches host/port |
| `/admin` redirects to login forever | Check `AUTH_SECRET` and `AUTH_URL` match how you open the site |
| Empty dashboard / no clans | Run `npm run db:seed` |
| Port 3000 in use | `npx next dev -p 3001` and set `AUTH_URL` to match |

## License / notes

Fan / community project for MIR4 · Zenith. Not affiliated with Wemade or official MIR4.
