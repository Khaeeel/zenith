# Production deploy (Vercel)

## Required environment variables (Vercel)

```
DATABASE_URL=              # Neon Postgres connection string
AUTH_SECRET=               # openssl rand -base64 32  (REQUIRED)
AUTH_TRUST_HOST=true       # REQUIRED on Vercel
# AUTH_URL — either omit, OR set to exact production origin (no path, no quotes):
# AUTH_URL=https://your-app.vercel.app
# Do NOT use http://localhost:3000 on Vercel.
```

Optional (omit the key entirely if unused — Vercel rejects empty values):

```
BLOB_READ_WRITE_TOKEN=
RESEND_API_KEY=
EMAIL_FROM=ARC Tracker <noreply@yourdomain.com>
```

Seed passwords are **not** needed at Vercel runtime.

## Steps

1. Create a Neon project (Vercel Marketplace or neon.tech) and copy `DATABASE_URL`.
2. Import this repo in Vercel; set the env vars above. Redeploy after changing env.
3. Build uses `prisma generate && next build` (see `package.json`).
4. Run migrations against Neon once:
   `DATABASE_URL=... npx prisma migrate deploy`
5. Seed once (optional):
   `DATABASE_URL=... npm run db:seed`
6. Ensure elder dashboard login exists on production DB:
   `DATABASE_URL=... npm run db:ensure-elder`
7. Sign in at `/login` (elder) or `/admin/login` (admin).

## Local Postgres (Docker)

Already used for development:

```
docker start tmzn-postgres
# DATABASE_URL=postgresql://tmzn:tmzn@localhost:5433/tmzn?schema=public
npm run db:migrate
npm run db:seed
npm run dev
```

## Admin accounts (after seed)

- admin@arc-zenith.local (super_admin)
- zenith.leader@arc-zenith.local
- dragon.admin@arc-zenith.local

Password: `ChangeMe123!` (or `SEED_ADMIN_PASSWORD`)
