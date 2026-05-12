# Zaid Knights Chess Club — System Architecture

## Overview

Zaid Knights Chess Club is a full-stack web platform built with modern, production-grade technologies.

```
┌──────────────────────────────────────────────────────────┐
│                      Client Browser                       │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTPS / TLS 1.3
         ┌───────────────┴───────────────┐
         │                               │
    ┌────▼─────┐              ┌──────────▼──────┐
    │  Vercel  │              │   Cloudflare    │
    │  CDN     │              │   DNS / WAF     │
    └────┬─────┘              └──────────┬──────┘
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼──────────────┐
         │   Next.js 14 Application     │
         │   (Vercel Serverless)        │
         │   ├─ Pages (SSR/Static)      │
         │   └─ API Routes              │
         └───────────┬──────────────────┘
                     │  Prisma 5 ORM (pgbouncer)
         ┌───────────▼──────────────────┐
         │   Supabase PostgreSQL        │
         │   ├─ Users & Auth            │
         │   ├─ Members & Rankings      │
         │   ├─ Events & Registrations  │
         │   ├─ Posts & Gallery         │
         │   ├─ Donations & Payments    │
         │   └─ Organizations & Orgs    │
         └──────────────────────────────┘
                     │
         ┌───────────▼──────────────────┐
         │   External Services          │
         │   ├─ Safaricom Daraja (M-Pesa)│
         │   └─ Resend (Email)          │
         └──────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (Pages Router) | SSR, static generation, API routes |
| UI | React 18 | Component model, state management |
| Styling | Tailwind CSS 3 | Utility-first CSS, glassmorphism theme |
| Language | TypeScript (strict) | Type safety across frontend and backend |
| Auth state | React Context (`AuthContext`) | Global user session |

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js ≥ 20 | JavaScript execution |
| API | Next.js API Routes | Serverless REST endpoints |
| ORM | Prisma 5 | Type-safe database client |
| Auth | JWT + bcryptjs | Token auth, password hashing |
| Payments | Safaricom Daraja | M-Pesa STK Push |
| Email | Resend | Transactional emails |

### Database
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Engine | PostgreSQL | Relational database |
| Provider | Supabase | Managed PostgreSQL + connection pooling |
| Client | Prisma 5 | Migrations, type-safe queries |

### Deployment
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Hosting | Vercel | Serverless deployment, edge CDN |
| DNS | Cloudflare | Domain management, DDoS protection |
| SSL | Let's Encrypt (auto) | HTTPS |

---

## File Structure

```
zaidknights_website/
├── pages/
│   ├── _app.tsx                     # App wrapper — AuthContext, global layout
│   ├── _document.tsx                # HTML document shell
│   ├── [slug].tsx                   # Redirect /[slug] → /blog/[slug]
│   ├── index.tsx                    # Home — hero, stats, events, tiers
│   ├── about.tsx                    # About — history, leadership, timeline
│   ├── blog.tsx                     # Blog list — pagination, category filter
│   ├── blog/[slug].tsx              # Single post + related articles
│   ├── contact.tsx                  # Contact form, FAQ accordion
│   ├── dashboard.tsx                # Member dashboard (5 states)
│   ├── donate.tsx                   # Donation form, M-Pesa, leaderboard
│   ├── events.tsx                   # Events listing + registration
│   ├── gallery.tsx                  # Masonry gallery + lightbox + upload
│   ├── login.tsx                    # Member login
│   ├── membership.tsx               # Tier comparison, FAQ, pricing
│   ├── organizations/
│   │   ├── index.tsx                # Multi-step org registration
│   │   └── register.tsx             # Simplified org registration
│   ├── rankings.tsx                 # ELO leaderboard
│   ├── register.tsx                 # Member sign-up + onboarding flow
│   ├── renew.tsx                    # Membership renewal (protected)
│   ├── admin/
│   │   ├── index.tsx                # Admin dashboard
│   │   ├── login.tsx                # Admin login
│   │   └── setup.tsx                # Initial admin setup
│   └── api/
│       ├── auth/
│       │   ├── register.ts          # POST — create user + member
│       │   ├── login.ts             # POST — JWT cookie
│       │   ├── logout.ts            # GET — clear cookie
│       │   └── me.ts                # GET — current user
│       ├── admin/
│       │   ├── messages.ts          # GET/PATCH/DELETE contact messages
│       │   ├── settings.ts          # GET/PATCH site settings
│       │   ├── setup.ts             # POST — seed admin user
│       │   └── stats.ts             # GET — admin overview stats
│       ├── dashboard/
│       │   └── stats.ts             # GET — member dashboard data
│       ├── donations/
│       │   ├── index.ts             # GET/POST donations
│       │   └── leaderboard.ts       # GET — top donors
│       ├── member/
│       │   ├── onboarding.ts        # POST — save onboarding steps
│       │   └── profile.ts           # GET/PATCH extended profile
│       ├── organizations/
│       │   ├── index.ts             # GET/POST organizations
│       │   └── [id].ts              # GET/PATCH single org
│       ├── payments/mpesa/
│       │   ├── initiate.ts          # POST — STK push
│       │   └── callback.ts          # POST — Safaricom webhook
│       ├── announcements.ts         # GET/POST/DELETE announcements
│       ├── contact.ts               # POST — contact form
│       ├── events.ts                # GET/POST/DELETE events
│       ├── gallery.ts               # GET/POST/DELETE gallery
│       ├── members.ts               # GET/PATCH members
│       ├── memberships.ts           # GET/POST memberships
│       ├── newsletter.ts            # POST — subscribe
│       ├── posts.ts                 # GET/POST/PATCH/DELETE posts
│       ├── profile.ts               # GET/PATCH member profile
│       └── site-settings.ts         # GET — public settings
│
├── components/
│   ├── common/
│   │   ├── Layout.tsx               # Page wrapper with SEO head
│   │   ├── Navbar.tsx               # Responsive navigation
│   │   ├── Footer.tsx               # Contact info, social links
│   │   └── ProtectedRoute.tsx       # Auth guard component
│   ├── dashboard/
│   │   ├── EventCountdown.tsx       # Countdown to next event
│   │   ├── MemberStats.tsx          # Rating, wins/losses display
│   │   ├── RenewalBanner.tsx        # Membership expiry alert
│   │   └── StatusBanner.tsx         # Membership status indicator
│   ├── onboarding/
│   │   ├── OnboardingFlow.tsx       # Multi-step onboarding container
│   │   └── OnboardingStep.tsx       # Individual step component
│   ├── sections/
│   │   ├── Hero.tsx                 # Home hero with countdown card
│   │   ├── MembershipTiers.tsx      # Tier pricing cards
│   │   ├── EventHighlights.tsx      # Featured events grid
│   │   └── StatsSection.tsx         # Club stats counters
│   └── ui/
│       ├── Accordion.tsx            # FAQ accordion
│       ├── Badge.tsx                # Status/level badge
│       ├── Button.tsx               # Primary/secondary buttons
│       ├── Card.tsx                 # Glass card container
│       ├── Countdown.tsx            # Timer component
│       ├── EmptyState.tsx           # Empty list placeholder
│       ├── Modal.tsx                # Dialog overlay
│       ├── ProgressBar.tsx          # Progress indicator
│       ├── SkeletonCard.tsx         # Loading skeleton
│       └── Toast.tsx                # Notification toast
│
├── lib/
│   ├── audit.ts                     # AuditLog helper
│   ├── auth.ts                      # JWT sign/verify, getUserFromRequest
│   ├── email.ts                     # Resend email helpers
│   ├── mpesa.ts                     # Daraja API client
│   ├── prisma.ts                    # Prisma client singleton
│   └── validators.ts                # Input sanitization/validation
│
├── prisma/
│   ├── schema.prisma                # All models, enums, indexes
│   └── migrations/                  # Migration history
│
├── styles/
│   └── globals.css                  # Tailwind base + glassmorphism tokens
│
├── public/
│   ├── robots.txt
│   └── sitemap.xml
│
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
├── vercel.json
└── .env.example
```

---

## Data Flow

### Authentication
```
1. POST /api/auth/login → bcrypt.compare password
2. Sign JWT (7-day expiry) with JWT_SECRET
3. Set httpOnly cookie named `token`
4. Every protected API call: getUserFromRequest() decodes cookie
5. Role check: ADMIN / COACH / MEMBER / GUEST / ORG_ADMIN
```

### M-Pesa Payment
```
1. POST /api/payments/mpesa/initiate
   → Daraja OAuth → STK push to user's phone
2. User enters PIN on phone
3. Safaricom calls POST /api/payments/mpesa/callback
4. Callback updates Donation/Membership status → COMPLETED
5. Resend email sends receipt
```

### Content Publishing
```
Admin creates post/event via /admin → POST /api/posts or /api/events
→ stored in PostgreSQL with published=true
→ appears on public /blog or /events pages
```

---

## Database Schema (summary)

### Models (19 total)
`User` · `Member` · `Membership` · `Event` · `Registration` · `Result` · `Attendance` · `ChessRatingHistory` · `Donation` · `PaymentTransaction` · `Organization` · `OrganizationMember` · `GalleryItem` · `Post` · `Announcement` · `ContactMessage` · `NewsletterSubscription` · `SiteSettings` · `AuditLog`

### Key Enums
| Enum | Values |
|------|--------|
| `Role` | ADMIN · COACH · MEMBER · GUEST · ORG_ADMIN |
| `MemberLevel` | BEGINNER · INTERMEDIATE · ADVANCED · COMPETITIVE_SQUAD |
| `MemberStatus` | PENDING · ACTIVE · EXPIRED · SUSPENDED · PENDING_PAYMENT |
| `MembershipPlan` | MONTHLY · TERM · ANNUAL |
| `MembershipTier` | BEGINNER · INTERMEDIATE · ADVANCED · COMPETITIVE_SQUAD |
| `DonationCategory` | GENERAL_FUND · TRAINING_EQUIPMENT · TOURNAMENTS · TRAVEL_SUPPORT |
| `PaymentStatus` | PENDING · COMPLETED · FAILED · REFUNDED |
| `OrganizationType` | SCHOOL · COMPANY · ACADEMY · CLUB |
| `ContactMessageStatus` | NEW · READ · REPLIED · ARCHIVED |

### Indexes
All hot query paths are indexed: member status+rating, post published+date, event startDate, donation status+createdAt, etc. See `prisma/schema.prisma` for the full `@@index` list.

---

## Security Architecture

| Layer | Controls |
|-------|---------|
| Network | HTTPS enforced, Cloudflare DDoS, HSTS (63072000s) |
| HTTP Headers | X-Frame-Options: DENY, X-Content-Type-Options: nosniff, X-XSS-Protection, Referrer-Policy, Permissions-Policy |
| Auth | bcryptjs (10 rounds), JWT + httpOnly cookie, SameSite=Lax |
| RBAC | Role checked on every admin/coach route |
| Input | sanitizeString() + validateEmail() on all API bodies |
| ORM | Prisma parameterized queries — no raw SQL in user paths |

---

## Performance

- **Connection pooling**: Supabase pgbouncer via `?pgbouncer=true` in DATABASE_URL
- **Code splitting**: Next.js automatic per-page bundles
- **CSS**: Tailwind purges unused styles at build time
- **API timeout**: All serverless functions capped at 30s (vercel.json)

---

## Development Workflow

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# fill DATABASE_URL, DIRECT_URL, JWT_SECRET …

# 3. Generate Prisma client
npx prisma generate

# 4. Start dev server
npm run dev

# 5. Type check
npm run type-check
```

Schema changes go through Supabase MCP `apply_migration` for remote DB, or `npx prisma db push` for local.

---

## Cost (estimated monthly)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Supabase | Free / Pro | $0–25 |
| Cloudflare | Free / Pro | $0–20 |
| Resend | Free / Pro | $0–20 |
| Domain (.org) | Annual | ~$1–2 |
| **Total** | | **$21–67** |
