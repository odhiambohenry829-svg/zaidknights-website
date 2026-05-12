# Zaid Knights Chess Club — Deployment Guide

## Overview

The platform auto-deploys to Vercel on every push to `main`. This guide covers the one-time setup: database, environment variables, domain, and DNS.

---

## Infrastructure

```
Frontend + API:  Vercel (serverless, auto-deploy)
Database:        Supabase PostgreSQL
DNS / WAF:       Cloudflare
Email:           Resend
Payments:        Safaricom Daraja (M-Pesa)
```

---

## Step 1: Supabase database

1. Create a project at [supabase.com](https://supabase.com) — pick the Africa (Johannesburg) region.
2. Go to **Settings → Database → Connection string**.
3. Copy two URLs:
   - **Transaction (pooled)** → `DATABASE_URL` (add `?pgbouncer=true`)
   - **Direct** → `DIRECT_URL`
4. The schema is managed via Prisma migrations in `prisma/migrations/`. Vercel runs `prisma generate && next build` — no manual `db push` needed after initial setup.

---

## Step 2: Vercel project

1. Push the repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Framework: **Next.js** (auto-detected).
4. Build command: `prisma generate && next build`
5. Install command: `npm install`
6. Root directory: *(leave empty)*

---

## Step 3: Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (all environments):

```
# Database
DATABASE_URL        postgresql://USER:PASS@HOST:5432/zaidknights?pgbouncer=true
DIRECT_URL          postgresql://USER:PASS@HOST:5432/zaidknights

# Auth
JWT_SECRET          <64-char random secret>
ADMIN_EMAIL         admin@zaidknights.org

# Site
NEXT_PUBLIC_SITE_URL  https://zaidknights.org

# M-Pesa
MPESA_ENV               production
MPESA_CONSUMER_KEY      <from Safaricom Daraja>
MPESA_CONSUMER_SECRET   <from Safaricom Daraja>
MPESA_PAYBILL           <your paybill number>
MPESA_PASSKEY           <from Safaricom Daraja>
MPESA_CALLBACK_URL      https://zaidknights.org/api/payments/mpesa/callback

# Email
RESEND_API_KEY      re_<your key>
EMAIL_FROM          ZaidKnights <noreply@zaidknights.org>
```

Generate `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4: Domain

1. Register `zaidknights.org` (or your chosen domain).
2. In **Vercel → Project → Domains**, add `zaidknights.org` and `www.zaidknights.org`.
3. Vercel provides CNAME/A records — add them at your registrar or in Cloudflare.

### Cloudflare (recommended)

1. Add site at [cloudflare.com](https://cloudflare.com), update registrar nameservers.
2. Add CNAME: `@` → `cname.vercel-dns.com` (proxied).
3. SSL/TLS: set to **Full (strict)**.
4. Vercel auto-provisions Let's Encrypt certificate.

---

## Step 5: Initial admin user

After first deploy, visit `https://zaidknights.org/admin/setup` to create the first ADMIN account. The setup route is disabled after first use.

---

## Step 6: Verify deployment

```bash
# SSL
curl -I https://zaidknights.org

# Auth
curl -X POST https://zaidknights.org/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"TestPass123"}'

# Events
curl https://zaidknights.org/api/events

# Admin stats (requires ADMIN cookie)
curl https://zaidknights.org/api/admin/stats
```

Check:
- `/robots.txt` is reachable
- `/sitemap.xml` is reachable
- All security headers present (X-Frame-Options, HSTS, etc.)

---

## Step 7: Submit to Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Add property `https://zaidknights.org`.
3. Verify via DNS TXT record (Cloudflare makes this easy).
4. Submit `https://zaidknights.org/sitemap.xml`.

---

## Ongoing maintenance

**After schema changes:**
```bash
# Apply migration to Supabase via MCP or CLI
npx supabase db push   # or use Supabase MCP apply_migration
```
Vercel re-runs `prisma generate` on every deploy so the client stays in sync.

**Dependency updates:**
```bash
npm outdated
npm update
npm run type-check && npm run build   # verify before push
```

**Monitor:**
- Vercel dashboard → Functions tab for API errors and durations
- Supabase dashboard → Logs for slow queries
- Resend dashboard for email delivery status

---

## Security headers (already configured)

`vercel.json` sets these on all routes:

| Header | Value |
|--------|-------|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload |
