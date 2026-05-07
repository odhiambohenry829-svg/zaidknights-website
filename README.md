# ZaidKnights Chess Club

A production-ready web platform for ZaidKnights Chess Club built with Next.js, Tailwind CSS, Prisma, and PostgreSQL.

## Project Structure

- `pages/` - Next.js page routes for public site, auth, member dashboard, and admin dashboard.
- `pages/api/` - REST API endpoints for authentication, events, posts, gallery, members, contact, and dashboard stats.
- `components/` - Reusable UI components, layouts, and homepage sections.
- `lib/` - Backend utilities for Prisma, JWT auth, and input validation.
- `prisma/schema.prisma` - PostgreSQL schema for users, members, events, registrations, results, posts, and gallery.
- `styles/globals.css` - Tailwind global styling and glassmorphism theme.

## Database Schema

Core tables in `prisma/schema.prisma`:
- `User` (id, name, email, password, role, timestamps)
- `Member` (userId, level, rating, status, joinedAt)
- `Event` (title, slug, description, location, startDate, endDate, capacity)
- `Registration` (userId, eventId, status)
- `Result` (eventId, userId, score, wins, losses, draws)
- `Post` (blog/news articles)
- `GalleryItem` (images and captions)

Enums:
- `Role` - ADMIN, COACH, MEMBER, GUEST
- `MembershipLevel` - BEGINNER, ADVANCED, MASTER
- `MemberStatus` - PENDING, ACTIVE, SUSPENDED
- `RegistrationStatus` - PENDING, CONFIRMED, CANCELLED

## Install & Run

1. Copy `.env.example` to `.env` and configure values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
4. Run database migrations after configuring `DATABASE_URL`:
   ```bash
   npx prisma db push
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## Deployment Guide

### 1. GitHub Push
- Initialize Git and push repository to GitHub.

### 2. Frontend Deployment
- Deploy to Vercel.
- Set environment variables in Vercel: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`.
- Build command: `npm run build`
- Output directory: `.next`

### 3. Backend / Database
- Host PostgreSQL on Supabase or Neon.
- Connect `DATABASE_URL` from provider.
- Use Prisma migration/push to initialize schema.

### 4. Domain Setup
- Preferred domains:
  - `zaidknights.com`
  - `zaidknightschess.com`
  - `zaidknightsclub.com`
  - `zkchess.com`
  - `zaidknightsacademy.com`
- Alternative domain options:
  - `.org` for club identity, e.g. `zaidknights.org`
  - `.ke` for Kenya focus, e.g. `zaidknights.co.ke`
  - `.chess` for modern branding, e.g. `zkchess.chess`

### 5. DNS & SSL
- Use Cloudflare or Namecheap DNS.
- Point A / CNAME records to Vercel.
- Enable SSL via Vercel automatic HTTPS.
- For other hosts, use Let's Encrypt or provider-managed certificates.

### 6. Environment Variables
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAIL`

## Production Readiness

### Security
- Passwords hashed with bcrypt.
- JWT authentication with secure cookies.
- Admin and dashboard routes should be protected with auth middleware in production.
- Input validation for API payloads.

### SEO & Performance
- Uses meta tags and Open Graph metadata.
- `robots.txt` and `sitemap.xml` included.
- Tailwind-driven responsive design.
- Framer Motion used for animated hero transitions.

## Next Improvements

- Add real payment integration (Stripe or M-Pesa).
- Implement live bracket management.
- Add email newsletter and WhatsApp notification system.
- Add AI puzzle generator and live chess board integration.
- Harden server-side route protection and rate limiting.
