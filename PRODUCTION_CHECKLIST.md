# Zaid Knights Chess Club — Production Readiness Checklist

---

## 1. Infrastructure

- [x] Next.js 14 (Pages Router) configured
- [x] TypeScript strict mode enabled
- [x] Tailwind CSS 3 configured with custom tokens
- [x] PostCSS / Autoprefixer configured
- [x] Vercel deployment config (`vercel.json`) with security headers and 30s function timeout
- [x] `.gitignore` excludes `.env`, `.env.local`, logs, build artifacts

---

## 2. Database

- [x] Prisma 5 schema with 19 models
- [x] All enums defined (Role, MemberLevel, MemberStatus, etc.)
- [x] Foreign key relations correct (including Announcement → User)
- [x] `@@index` directives on all hot query columns
- [x] `ContactMessageStatus` enum (NEW / READ / REPLIED / ARCHIVED)
- [x] Connection pooling via Supabase pgbouncer (`DATABASE_URL?pgbouncer=true`)
- [x] `DIRECT_URL` set for Prisma migrations

---

## 3. Pages (18 routes)

- [x] `/` Home
- [x] `/about` About
- [x] `/events` Events + registration
- [x] `/rankings` ELO leaderboard
- [x] `/gallery` Photo gallery + upload
- [x] `/blog` Blog list
- [x] `/blog/[slug]` Single post
- [x] `/donate` Donation + M-Pesa + leaderboard
- [x] `/membership` Tier comparison + FAQ
- [x] `/contact` Contact form + FAQ accordion
- [x] `/organizations` Multi-step org registration
- [x] `/organizations/register` Simplified org form
- [x] `/login` Member login
- [x] `/register` Member sign-up + onboarding
- [x] `/renew` Membership renewal (protected)
- [x] `/dashboard` Member dashboard (5 states)
- [x] `/admin` Admin dashboard
- [x] `/admin/setup` First-run admin creation

---

## 4. API Routes (35 endpoints)

- [x] Auth: register, login, logout, me
- [x] Events: list/filter, register for event, create (admin), delete (admin)
- [x] Members: ranked list, update (admin)
- [x] Posts: list/paginate, slug, create, update, delete
- [x] Gallery: list, upload (auth), delete (admin)
- [x] Contact: submit form
- [x] Newsletter: subscribe (upsert)
- [x] Donations: submit, list (own/admin), leaderboard
- [x] Memberships: create/renew, history
- [x] Organizations: register, list, single (with PATCH)
- [x] Announcements: list active, create (admin/coach), delete (admin)
- [x] Dashboard: full member stats
- [x] Admin: stats, settings, messages (CRUD)
- [x] Profile: read/update
- [x] Member profile (extended) + onboarding steps
- [x] Payments: M-Pesa initiate + Safaricom callback webhook
- [x] Site settings: public hero text

---

## 5. Security

- [x] Passwords hashed with bcryptjs (10 rounds)
- [x] JWT tokens signed, 7-day expiry, httpOnly cookie
- [x] Cookie: HttpOnly, Secure, SameSite=Lax
- [x] All admin routes require ADMIN role (403 if not)
- [x] Input sanitized via `sanitizeString()` + `validateEmail()`
- [x] Prisma ORM — no raw SQL in user data paths
- [x] HTTP security headers set in `vercel.json` (HSTS, X-Frame-Options, CSP basics, etc.)
- [x] Environment variables — no secrets in code
- [ ] Rate limiting on `/api/auth/*` (recommended for production)
- [ ] Sentry / error tracking service

---

## 6. Features implemented

- [x] JWT authentication + RBAC
- [x] Member registration + onboarding flow
- [x] Membership plans (Monthly / Term / Annual × 4 tiers)
- [x] M-Pesa STK push payments for memberships and donations
- [x] Transactional email via Resend (receipts, confirmations)
- [x] Event management + capacity-checked registration
- [x] ELO leaderboard with 30-day delta
- [x] Blog with pagination, categories, slugs
- [x] Masonry photo gallery + upload
- [x] Donation tracking with anonymous option + leaderboard
- [x] Organization registration (multi-step + approval flow)
- [x] Announcements with pinning + expiry
- [x] Contact form with status tracking (admin inbox)
- [x] Newsletter subscription (upsert, reactivation)
- [x] Member dashboard (5 status states + renewal banner)
- [x] Full admin dashboard (members, events, posts, gallery, messages, settings)
- [x] Site settings (hero text, contact info, social links) — editable from admin

---

## 7. Performance

- [x] Next.js automatic code splitting
- [x] Tailwind CSS purge (unused styles removed at build)
- [x] Supabase pgbouncer connection pooling
- [x] Database indexes on all hot query paths
- [x] Vercel Edge CDN for static assets
- [ ] Next.js `<Image>` component on user-uploaded photo URLs
- [ ] Lighthouse audit — target 90+ on all categories

---

## 8. SEO

- [x] `<title>` and `<meta description>` on every page (via Layout)
- [x] Open Graph tags
- [x] `public/robots.txt`
- [x] `public/sitemap.xml`
- [ ] Submit sitemap to Google Search Console
- [ ] Verify structured data with Rich Results Test

---

## 9. Pre-launch tasks

- [ ] Set all production environment variables in Vercel
- [ ] Seed first ADMIN user via `/admin/setup`
- [ ] Verify M-Pesa callback URL is publicly reachable
- [ ] Verify Resend domain/sender is verified
- [ ] Set up uptime monitoring (UptimeRobot or Better Uptime)
- [ ] Connect Vercel project to custom domain
- [ ] Configure Cloudflare Full (strict) SSL
- [ ] Test full registration → payment → dashboard flow in production

---

## 10. Legal / compliance

- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie consent banner (for EU visitors)
- [ ] GDPR/PDPA data handling review
