# Zaid Knights Chess Club — Quick Start

Get the platform running locally in under 30 minutes.

## Prerequisites

- Node.js 20+ (`node -v` to check)
- npm 9+
- Git
- A Supabase project (for the database)

---

## Step 1: Install dependencies

```bash
npm install
```

## Step 2: Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/zaidknights?pgbouncer=true
DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/zaidknights
JWT_SECRET=<at-least-32-random-characters>
ADMIN_EMAIL=admin@zaidknights.org
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional for local dev (leave as-is to skip M-Pesa and email)
MPESA_ENV=sandbox
RESEND_API_KEY=re_...
```

Get `DATABASE_URL` and `DIRECT_URL` from **Supabase → Settings → Database → Connection string**.

## Step 3: Generate Prisma client

```bash
npx prisma generate
```

## Step 4: Push schema to database

```bash
npx prisma db push
```

## Step 5: Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Explore the pages

| URL | Description |
|-----|-------------|
| `/` | Home — hero, stats, events, tiers |
| `/about` | About us, timeline, leadership |
| `/events` | Tournament listings + registration |
| `/rankings` | ELO leaderboard |
| `/gallery` | Photo gallery with upload |
| `/blog` | Blog with category filter |
| `/blog/[slug]` | Single post |
| `/donate` | Donation form + M-Pesa + leaderboard |
| `/membership` | Tier pricing, FAQ |
| `/contact` | Contact form |
| `/organizations` | Multi-step org registration |
| `/register` | Member sign-up |
| `/login` | Member login |
| `/dashboard` | Member dashboard (requires login) |
| `/renew` | Membership renewal (requires login) |
| `/admin` | Admin dashboard (requires ADMIN role) |

---

## Test authentication

1. Go to `/register` and create an account
2. Log in at `/login`
3. Visit `/dashboard` — you should see your member profile

To give your account ADMIN access, use Prisma Studio:
```bash
npx prisma studio
```
Find your `User` record and change `role` to `ADMIN`.

---

## Test the API

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123"}'

# Get upcoming events
curl http://localhost:3000/api/events

# Get member rankings
curl http://localhost:3000/api/members
```

---

## Common commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript strict check |
| `npx prisma studio` | Visual database editor |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma db push` | Sync schema → database |

---

## Troubleshooting

**Port 3000 in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Prisma client out of sync**
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

**Database connection refused**
- Check `DATABASE_URL` in `.env`
- Confirm the Supabase project is not paused
- Make sure you're using the pooled URL for `DATABASE_URL` and the direct URL for `DIRECT_URL`

---

## Next steps

1. **Add content** — create events, posts, gallery items via `/admin`
2. **Deploy** — follow `DEPLOYMENT_GUIDE.md`
3. **Test all endpoints** — see `API_REFERENCE.md`
