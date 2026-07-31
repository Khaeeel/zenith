# Production deploy (Vercel)

## Required environment variables

```
DATABASE_URL=              # Neon Postgres connection string
AUTH_SECRET=               # openssl rand -base64 32
AUTH_URL=https://your-domain.vercel.app
BLOB_READ_WRITE_TOKEN=     # Vercel Blob (optional until uploads needed)
RESEND_API_KEY=            # Resend (optional until join emails needed)
EMAIL_FROM=ARC Tracker <noreply@yourdomain.com>
SEED_ADMIN_PASSWORD=       # only for local/seed
```

## Steps

1. Create a Neon project (Vercel Marketplace or neon.tech) and copy `DATABASE_URL`.
2. Import this repo in Vercel; set the env vars above.
3. Build uses `prisma generate && next build` (see `package.json`).
4. Run migrations against Neon once:
   `DATABASE_URL=... npx prisma migrate deploy`
5. Seed once (optional):
   `DATABASE_URL=... npm run db:seed`
6. Sign in at `/admin/login` with seeded admins (default password `ChangeMe123!` unless overridden).

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
- zenith.elder@arc-zenith.local
- dragon.admin@arc-zenith.local

Password: `ChangeMe123!` (or `SEED_ADMIN_PASSWORD`)
