# ZaidKnights Chess Club - System Architecture

## Overview

ZaidKnights Chess Club is a full-stack web platform built with modern, scalable technologies designed for production deployment.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                  (Chrome, Firefox, Safari, Edge)            │
└────────────────────────┬──────────────────────────────────┘
                         │
                   HTTPS / TLS 1.3
                         │
         ┌───────────────┴───────────────┐
         │                               │
    ┌────▼─────┐              ┌──────────▼──────┐
    │  Vercel  │              │   Cloudflare    │
    │ (CDN)    │              │   (DNS/WAF)     │
    └────┬─────┘              └──────────┬──────┘
         │                               │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼──────────────┐
         │   Next.js Application       │
         │   (Vercel Serverless)        │
         │   ├─ API Routes              │
         │   ├─ Server Components       │
         │   └─ Static Generation       │
         └───────────┬──────────────────┘
                     │
         ┌───────────▼──────────────────┐
         │   PostgreSQL Database         │
         │   (Supabase / Neon)          │
         │   ├─ Users & Auth            │
         │   ├─ Members & Rankings      │
         │   ├─ Events & Tournaments    │
         │   ├─ Posts & Gallery         │
         │   └─ Contact Submissions     │
         └──────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 | React meta-framework with SSR/SSG |
| **UI Library** | React 18 | Component library and state management |
| **Styling** | Tailwind CSS 3 | Utility-first CSS framework |
| **Animations** | Framer Motion 11 | Smooth animations (hero, transitions) |
| **Language** | TypeScript | Type-safe JavaScript |
| **Form Handling** | Built-in | Native HTML + React hooks |
| **SEO** | Next.js Head | Meta tags, Open Graph, sitemap |

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js | JavaScript execution environment |
| **Framework** | Next.js API Routes | Serverless function API |
| **ORM** | Prisma 5 | Type-safe database client |
| **Authentication** | JWT + bcryptjs | Token-based auth + password hashing |
| **Validation** | Custom validators | Input sanitization and validation |
| **HTTP** | REST | RESTful API design |

### Database
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Type** | PostgreSQL | Relational database |
| **Provider** | Supabase or Neon | Managed PostgreSQL hosting |
| **Backup** | Provider-managed | Automatic daily backups |
| **Monitoring** | Provider dashboard | Real-time metrics and alerts |

### Deployment
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Hosting** | Vercel | Serverless deployment + CDN |
| **DNS** | Cloudflare | Domain management + security |
| **SSL** | Let's Encrypt | HTTPS encryption |
| **Monitoring** | Vercel + Provider | Error tracking and uptime |

---

## File Structure

```
zaidknights_website/
├── pages/                          # Next.js page routes
│   ├── _app.tsx                    # App wrapper
│   ├── _document.tsx              # HTML document wrapper
│   ├── index.tsx                  # Home page
│   ├── about.tsx                  # About page
│   ├── membership.tsx             # Membership tier page
│   ├── events.tsx                 # Events listing
│   ├── rankings.tsx               # Rankings leaderboard
│   ├── gallery.tsx                # Photo gallery
│   ├── blog.tsx                   # Blog posts
│   ├── contact.tsx                # Contact form
│   ├── login.tsx                  # Member login
│   ├── register.tsx               # Registration
│   ├── dashboard.tsx              # Member dashboard
│   ├── admin.tsx                  # Admin dashboard
│   └── api/                        # API routes
│       ├── auth/
│       │   ├── register.ts        # User registration
│       │   ├── login.ts           # User login
│       │   └── logout.ts          # User logout
│       ├── events.ts              # GET/POST events
│       ├── members.ts             # GET members
│       ├── posts.ts               # GET blog posts
│       ├── gallery.ts             # GET gallery items
│       ├── contact.ts             # POST contact form
│       └── dashboard/
│           └── stats.ts           # Dashboard statistics
│
├── components/                     # React components
│   ├── common/
│   │   ├── Layout.tsx             # Main layout wrapper
│   │   ├── Navbar.tsx             # Top navigation
│   │   └── Footer.tsx             # Footer
│   ├── ui/
│   │   ├── Button.tsx             # Button component
│   │   └── Card.tsx               # Glass card component
│   └── sections/
│       ├── Hero.tsx               # Hero section
│       ├── MembershipTiers.tsx    # Membership options
│       ├── EventHighlights.tsx    # Featured events
│       └── StatsSection.tsx       # Statistics display
│
├── lib/                            # Backend utilities
│   ├── prisma.ts                  # Prisma client singleton
│   ├── auth.ts                    # JWT and password utilities
│   └── validators.ts              # Input validation helpers
│
├── prisma/                         # Database schema
│   └── schema.prisma              # All data models
│
├── styles/                         # Global styles
│   └── globals.css                # Tailwind + custom styles
│
├── public/                         # Static assets
│   ├── robots.txt                 # SEO robots file
│   └── sitemap.xml                # XML sitemap
│
├── package.json                    # Dependencies
├── tsconfig.json                  # TypeScript config
├── next.config.mjs                # Next.js config
├── tailwind.config.js             # Tailwind config
├── postcss.config.js              # PostCSS config
├── .env.example                   # Environment template
├── README.md                       # Project overview
├── API_REFERENCE.md               # API documentation
├── DEPLOYMENT_GUIDE.md            # Deployment steps
└── PRODUCTION_CHECKLIST.md        # Pre-launch checklist
```

---

## Data Flow

### User Registration Flow
```
1. User fills registration form (/register)
2. Frontend sends POST to /api/auth/register
3. Backend validates input (email, password)
4. Backend hashes password with bcryptjs
5. Backend creates User in PostgreSQL
6. Backend creates Member record (PENDING status)
7. Response sent to frontend
8. User redirected to login
```

### User Login Flow
```
1. User enters email/password (/login)
2. Frontend sends POST to /api/auth/login
3. Backend retrieves user from database
4. Backend verifies password with bcryptjs
5. Backend generates JWT token (expires 7 days)
6. Backend sets secure HTTP-only cookie
7. Frontend redirected to member dashboard
8. Subsequent requests include JWT token
```

### Event Registration Flow
```
1. User browses events (/events)
2. User clicks "Register" button
3. Frontend sends POST to /api/events/[id]/register
4. Backend verifies user authentication
5. Backend creates Registration record (PENDING)
6. Admin approves registration in /admin
7. Registration status changes to CONFIRMED
8. User sees confirmed status in /dashboard
```

### Admin Content Publishing
```
1. Admin logs in with ADMIN role
2. Admin creates post/event in admin dashboard
3. Frontend sends POST to /api/posts or /api/events
4. Backend stores in PostgreSQL
5. Content appears on public pages
6. Posts marked as published show on /blog
```

---

## Database Schema

### Core Tables

**Users**
```sql
- id (Primary Key)
- name (String)
- email (Unique, String)
- password (Hashed, String)
- role (ADMIN | COACH | MEMBER | GUEST)
- createdAt, updatedAt (DateTime)
```

**Members**
```sql
- id (Primary Key)
- userId (Foreign Key → Users)
- level (BEGINNER | ADVANCED | MASTER)
- rating (Integer, default 1200)
- status (PENDING | ACTIVE | SUSPENDED)
- joinedAt (DateTime)
```

**Events**
```sql
- id (Primary Key)
- title, slug, description, location (String)
- startDate, endDate (DateTime)
- capacity (Integer)
- createdAt, updatedAt (DateTime)
```

**Registrations**
```sql
- id (Primary Key)
- userId (Foreign Key → Users)
- eventId (Foreign Key → Events)
- status (PENDING | CONFIRMED | CANCELLED)
- createdAt (DateTime)
- Unique constraint: [userId, eventId]
```

**Results**
```sql
- id (Primary Key)
- eventId (Foreign Key → Events)
- userId (Foreign Key → Users)
- score, wins, losses, draws (Numeric)
- createdAt (DateTime)
```

**Posts**
```sql
- id (Primary Key)
- title, slug, excerpt, content (String)
- authorId (Foreign Key → Users)
- published (Boolean)
- createdAt, updatedAt (DateTime)
```

**GalleryItems**
```sql
- id (Primary Key)
- title, imageUrl, caption (String)
- createdAt (DateTime)
```

---

## API Architecture

### Request/Response Pattern

**Request:**
```http
POST /api/auth/register HTTP/1.1
Host: zaidknights.com
Content-Type: application/json

{
  "name": "Amina Mwangi",
  "email": "amina@example.com",
  "password": "secure123"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": "Registration complete.",
  "user": {
    "id": "clxyz123",
    "name": "Amina Mwangi",
    "email": "amina@example.com"
  }
}
```

### Authentication

**Flow:**
1. User logs in → receives JWT token
2. Token stored in HTTP-only cookie
3. Cookie automatically sent with requests
4. Backend verifies token on protected routes
5. Token expires after 7 days

**Security:**
- Passwords never stored in plain text
- Tokens signed with `JWT_SECRET`
- Cookies set to HttpOnly, Secure, SameSite=Lax

---

## Performance Optimization

### Frontend
- **Code Splitting:** Next.js automatic per-page bundles
- **Image Optimization:** Next.js Image component ready
- **CSS Purging:** Tailwind removes unused styles
- **Lazy Loading:** Components load on demand
- **Caching:** Vercel edge cache headers

### Backend
- **Database Indexing:** Prisma optimized queries
- **Connection Pooling:** Supabase/Neon manages
- **Response Compression:** Gzip via Vercel
- **API Caching:** HTTP cache headers set

### Network
- **CDN:** Vercel global edge network
- **DNS:** Cloudflare DNS optimization
- **SSL:** TLS 1.3 encryption

---

## Security Architecture

### Layers

**1. Network Level**
- HTTPS enforced (TLS 1.3)
- Cloudflare DDoS protection
- WAF rules enabled

**2. Application Level**
- Input validation on all routes
- SQL injection prevention (Prisma ORM)
- XSS prevention (React escaping)
- CORS headers configured
- Rate limiting (recommended)

**3. Authentication Level**
- Password hashing with bcryptjs (10 salt rounds)
- JWT tokens with expiration
- Secure cookies (HttpOnly, Secure, SameSite)
- Role-based access control (ADMIN/COACH/MEMBER/GUEST)

**4. Database Level**
- Encrypted connections (SSL)
- Automatic backups
- Access control via provider
- No credentials in code

---

## Scaling Strategy

### Current State (1000-10,000 users)
- Vercel serverless handles traffic
- Supabase/Neon with auto-scaling
- No special configuration needed

### Future State (10,000+ users)
- **Caching:** Add Redis for sessions
- **Database:** Upgrade PostgreSQL tier
- **API:** Consider separate Node.js backend
- **Storage:** Add S3/CDN for image uploads
- **Queue:** Add Bull/RabbitMQ for email tasks
- **Analytics:** Implement real-time analytics

---

## Monitoring & Logging

### Vercel Analytics
- Page load performance
- Core Web Vitals
- Error rate monitoring
- Deployment history

### Database Monitoring (Supabase/Neon)
- Query performance
- Connection pool status
- Storage usage
- Backup status

### Recommended Additions
- Error tracking: Sentry or Bugsnag
- Uptime monitoring: UptimeRobot
- Security scanning: OWASP ZAP
- Performance testing: k6 or LoadImpact

---

## Development Workflow

1. **Local Development**
   ```bash
   npm install
   npm run dev
   # Test at http://localhost:3000
   ```

2. **Database Changes**
   ```bash
   # Modify prisma/schema.prisma
   npx prisma generate
   npx prisma db push
   ```

3. **API Testing**
   ```bash
   curl -X GET http://localhost:3000/api/events
   ```

4. **Build & Deploy**
   ```bash
   npm run build
   git push origin main
   # Vercel auto-deploys
   ```

---

## Cost Estimation

| Service | Tier | Cost/Month |
|---------|------|-----------|
| **Vercel** | Pro (recommended) | $20 |
| **Supabase** | Free/Pro | $0-25 |
| **Cloudflare** | Pro | $20 |
| **Domain** | .com (annual) | ~$1-2/month |
| **Total** | Production Ready | $41-47/month |

---

## Conclusion

This architecture provides:
- ✅ Scalable infrastructure
- ✅ Type-safe full-stack TypeScript
- ✅ Modern UI with animations
- ✅ Secure authentication
- ✅ RESTful API design
- ✅ Production-ready deployment
- ✅ SEO optimized
- ✅ Responsive mobile-first design

The system is ready for launch and can scale to serve thousands of members.
