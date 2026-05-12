# Zaid Knights Chess Club

Production-ready web platform for Zaid Knights Chess Club — Nairobi's premier chess club.
Built with Next.js 14 (Pages Router), Tailwind CSS, Prisma 5, and Supabase PostgreSQL.

**Contact:** +254 726 027 960 · info@zaidknights.org

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, stats, events, membership tiers |
| `/about` | About us, timeline, leadership, achievements |
| `/events` | Tournament & training listings, event registration |
| `/blog` | Blog with category filter, pagination, newsletter |
| `/blog/[slug]` | Full post with share buttons and related articles |
| `/gallery` | Masonry photo gallery with lightbox and upload |
| `/rankings` | ELO leaderboard with sortable table and player profiles |
| `/membership` | Tier comparison, plan pricing, FAQ |
| `/donate` | Donation form with M-Pesa, leaderboard, impact stats |
| `/contact` | Contact form, FAQ accordion |
| `/organizations` | Multi-step org registration form |
| `/organizations/register` | Simplified single-page org form |
| `/renew` | Membership renewal (protected) |
| `/register` | Member sign-up with onboarding flow |
| `/login` | Member login |
| `/dashboard` | 5-state member dashboard |
| `/admin` | Admin dashboard (members, events, posts, gallery, messages, settings) |

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create user + member profile |
| POST | `/api/auth/login` | Login, sets `token` cookie |
| GET | `/api/auth/logout` | Clears cookie |
| GET | `/api/auth/me` | Current user from cookie |
| GET | `/api/events` | Upcoming events (`?type=`, `?past=true`, `?limit=`) |
| POST | `/api/events` | Register for event (`action: "register"`) or create (admin) |
| DELETE | `/api/events` | Delete event (admin) |
| GET | `/api/members` | Active members with ELO ranking and stats |
| PATCH | `/api/members` | Update member (admin) |
| GET | `/api/posts` | Published posts (`?page=`, `?limit=`, `?category=`, `?slug=`) |
| POST | `/api/posts` | Create post (admin/coach) |
| PATCH | `/api/posts` | Update post (admin/coach) |
| DELETE | `/api/posts` | Delete post (admin/coach) |
| GET | `/api/gallery` | Gallery items (`?category=`) |
| POST | `/api/gallery` | Upload photo (any authenticated user) |
| DELETE | `/api/gallery` | Delete photo (admin) |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/newsletter` | Subscribe to newsletter |
| GET | `/api/memberships` | Current user's membership + history |
| POST | `/api/memberships` | Create/renew membership |
| GET | `/api/donations` | Donations list (admin: all, user: own) |
| POST | `/api/donations` | Submit donation |
| GET | `/api/donations/leaderboard` | Top donors + monthly total |
| GET | `/api/organizations` | Approved orgs (public) or all (admin) |
| POST | `/api/organizations` | Register organization |
| GET | `/api/announcements` | Active announcements |
| POST | `/api/announcements` | Create announcement (admin/coach) |
| DELETE | `/api/announcements` | Delete announcement (admin) |
| GET | `/api/dashboard/stats` | Current user's full dashboard data |
| GET | `/api/admin/stats` | Admin overview stats |
| GET/PATCH | `/api/admin/settings` | Site settings (hero text, contact info) |
| GET/PATCH/DELETE | `/api/admin/messages` | Contact message management |
| GET | `/api/site-settings` | Public site settings (hero title, subtitle) |
| GET/PATCH | `/api/profile` | Member profile read/update |
| GET/PATCH | `/api/member/profile` | Extended member profile |
| POST | `/api/member/onboarding` | Save onboarding step progress |
| POST | `/api/payments/mpesa/initiate` | Start M-Pesa STK push |
| POST | `/api/payments/mpesa/callback` | Receive M-Pesa payment result |

---

## Components

### UI
`Badge` · `Countdown` · `EmptyState` · `Modal` · `ProgressBar` · `SkeletonCard` · `Toast` · `Accordion` · `Button` · `Card`

### Common
`Layout` · `Navbar` · `Footer` · `ProtectedRoute`

### Sections (Home)
`Hero` · `StatsSection` · `EventHighlights` · `MembershipTiers`

### Dashboard
`StatusBanner` · `RenewalBanner` · `EventCountdown` · `MemberStats`

### Onboarding
`OnboardingFlow` · `OnboardingStep`

---

## Database Schema

Managed with Prisma 5 + Supabase PostgreSQL.

### Models
`User` · `Member` · `Membership` · `Event` · `Registration` · `Result` · `Attendance` · `ChessRatingHistory` · `Donation` · `PaymentTransaction` · `Organization` · `OrganizationMember` · `GalleryItem` · `Post` · `Announcement` · `ContactMessage` · `NewsletterSubscription` · `SiteSettings` · `AuditLog`

### Key Enums
- `Role` — ADMIN · COACH · MEMBER · GUEST · ORG_ADMIN
- `MemberLevel` — BEGINNER · INTERMEDIATE · ADVANCED · COMPETITIVE_SQUAD
- `MemberStatus` — PENDING · ACTIVE · EXPIRED · SUSPENDED · PENDING_PAYMENT
- `MembershipPlan` — MONTHLY · TERM · ANNUAL
- `MembershipTier` — BEGINNER · INTERMEDIATE · ADVANCED · COMPETITIVE_SQUAD
- `DonationCategory` — GENERAL_FUND · TRAINING_EQUIPMENT · TOURNAMENTS · TRAVEL_SUPPORT
- `PaymentStatus` — PENDING · COMPLETED · FAILED · REFUNDED
- `OrganizationType` — SCHOOL · COMPANY · ACADEMY · CLUB
- `ContactMessageStatus` — NEW · READ · REPLIED · ARCHIVED

---

## Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, etc.

# 4. Generate Prisma client
npx prisma generate

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Auto-deploys to Vercel on push to `main`.

### Required Environment Variables (Vercel)
```
DATABASE_URL
DIRECT_URL
JWT_SECRET
ADMIN_EMAIL
NEXT_PUBLIC_SITE_URL
MPESA_ENV / MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET / MPESA_PAYBILL / MPESA_PASSKEY / MPESA_CALLBACK_URL
RESEND_API_KEY / EMAIL_FROM
```

### Build command
```bash
prisma generate && next build
```

---

## Tech Stack

| | |
|--|--|
| Framework | Next.js 14 (Pages Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 + glassmorphism design system |
| ORM | Prisma 5 |
| Database | Supabase PostgreSQL |
| Auth | JWT + bcryptjs, httpOnly cookies |
| Payments | Safaricom Daraja M-Pesa STK Push |
| Email | Resend |
| Deployment | Vercel |
