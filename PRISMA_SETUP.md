# Prisma Setup

Use Supabase Dashboard > Connect > ORMs > Prisma to copy the project-specific values.

`.env` should keep runtime traffic on the transaction pooler and Prisma CLI traffic on the session/direct connection:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:DB_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.PROJECT_REF:DB_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?connect_timeout=30"
```

If port `5432` is blocked on the current network, try Supabase's direct host for `DIRECT_URL`:

```env
DIRECT_URL="postgresql://postgres:DB_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?connect_timeout=30"
```

Install dependencies, then run these in order:

```bash
npm install
npm run prisma:fix-env
node scripts/check-supabase-connection.mjs
npx prisma validate
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed
node scripts/prisma-smoke.mjs
npm run build
npm run dev
```

The migration chain now applies the original club schema and the expanded
club-management schema:

- `20260507000000_init`
- `20260507001000_club_management_features`

If `check-supabase-connection` reports that `5432` is not reachable, switch network, use a VPN, or use a mobile hotspot before applying migrations.

As a last network fallback, run:

```bash
npm run prisma:fix-env:pooler
npm run prisma:check
npm run prisma:deploy
```

The pooler fallback uses port `6543` for both Prisma URLs. Prefer the standard
setup when port `5432` is reachable.
