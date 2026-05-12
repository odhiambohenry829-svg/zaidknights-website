# Zaid Knights Chess Club — Testing Guide

Manual QA checklist and curl test commands. Run these before deploying a new version.

---

## 1. Authentication

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123"}'
# Expected: 201 { user: { id, name, email, role } }
```

- [ ] Valid registration → 201
- [ ] Duplicate email → 409
- [ ] Missing name/email/password → 400
- [ ] Weak password (< 8 chars) → 400
- [ ] Password stored hashed in DB (not plain text)

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}' \
  -c cookies.txt -v
# Expected: 200, Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax
```

- [ ] Valid credentials → 200 + `token` cookie
- [ ] Wrong password → 401
- [ ] Unknown email → 401
- [ ] Cookie is HttpOnly (not readable by JS)

### Logout
```bash
curl http://localhost:3000/api/auth/logout -b cookies.txt -v
# Expected: 200, Set-Cookie clears the token
```

### Me
```bash
curl http://localhost:3000/api/auth/me -b cookies.txt
# Expected: 200 { user: { id, name, email, role } }
# Without cookie: 401
```

---

## 2. Events

```bash
# Upcoming events
curl "http://localhost:3000/api/events"

# Past events
curl "http://localhost:3000/api/events?past=true"

# Filter by type
curl "http://localhost:3000/api/events?type=tournament&limit=5"

# Register for event (requires login)
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"action":"register","eventId":"<event-id>"}'
```

- [ ] GET returns events array with `_count.registrations`
- [ ] Past filter works
- [ ] Type filter works
- [ ] Register → 200 (or 409 if already registered, 400 if full)
- [ ] Register without cookie → 401

---

## 3. Members

```bash
# Public rankings
curl "http://localhost:3000/api/members"
# Expected: sorted by rating desc, includes ratingDelta

# Admin view (all members)
curl "http://localhost:3000/api/members?admin=true" -b admin_cookies.txt
```

- [ ] Returns `rank`, `rating`, `wins`, `losses`, `draws`, `ratingDelta`
- [ ] `?admin=true` without ADMIN role → 403

---

## 4. Posts

```bash
# List posts
curl "http://localhost:3000/api/posts?page=1&limit=6"

# By category
curl "http://localhost:3000/api/posts?category=tournament"

# Single post
curl "http://localhost:3000/api/posts?slug=<post-slug>"
# Expected: { post: {...}, related: [...] }
```

- [ ] Only `published: true` posts returned (public)
- [ ] Pagination: `total`, `pages`, `hasNext`, `hasPrev`
- [ ] Slug query returns `related` array

---

## 5. Gallery

```bash
# List
curl "http://localhost:3000/api/gallery"

# Filter by category
curl "http://localhost:3000/api/gallery?category=tournaments"

# Upload (any authenticated user)
curl -X POST http://localhost:3000/api/gallery \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Trophy Ceremony","imageUrl":"https://example.com/photo.jpg","caption":"...","category":"tournaments"}'
```

- [ ] Upload without cookie → 401
- [ ] Upload with cookie → 201 with `uploadedBy` set to user ID
- [ ] Delete without ADMIN → 403

---

## 6. Contact form

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Ochieng",
    "email":"john@example.com",
    "subject":"Membership",
    "message":"I would like to join."
  }'
# Expected: 201 { ok: true, id: "..." }
```

- [ ] Missing `subject` → 400
- [ ] Invalid email → 400
- [ ] Message stored with `status: NEW`

---

## 7. Newsletter

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"fan@example.com"}'
# Expected: 200 { ok: true, message: "Subscribed successfully!" }

# Re-subscribe (should reactivate)
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"fan@example.com"}'
# Expected: 200 (upsert — no error)
```

---

## 8. Donations

```bash
# Submit donation
curl -X POST http://localhost:3000/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorName":"Wanjiku Njoroge",
    "donorEmail":"wanjiku@example.com",
    "amount":1000,
    "category":"GENERAL_FUND",
    "donorType":"INDIVIDUAL",
    "anonymous":false
  }'

# Leaderboard (public)
curl "http://localhost:3000/api/donations/leaderboard"

# Own donations (requires login)
curl "http://localhost:3000/api/donations" -b cookies.txt

# All donations (ADMIN only)
curl "http://localhost:3000/api/donations?admin=true" -b admin_cookies.txt
```

---

## 9. Memberships

```bash
# Current user's membership
curl http://localhost:3000/api/memberships -b cookies.txt

# Create/renew
curl -X POST http://localhost:3000/api/memberships \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"plan":"ANNUAL","tier":"ADVANCED","autoRenew":false}'
```

---

## 10. Announcements

```bash
# Active announcements (public)
curl http://localhost:3000/api/announcements
# Expected: pinned first, expired excluded
```

---

## 11. Admin stats

```bash
curl http://localhost:3000/api/admin/stats -b admin_cookies.txt
# Expected: totalMembers, pendingMembers, activeMembers, totalEvents, etc.

# Without ADMIN role → 403
curl http://localhost:3000/api/admin/stats -b cookies.txt
```

---

## 12. Admin messages

```bash
# List
curl http://localhost:3000/api/admin/messages -b admin_cookies.txt

# Mark as read
curl -X PATCH http://localhost:3000/api/admin/messages \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{"id":"<msg-id>","status":"READ"}'

# Invalid status → 400
curl -X PATCH http://localhost:3000/api/admin/messages \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{"id":"<msg-id>","status":"INVALID"}'
```

---

## 13. Site settings

```bash
# Public
curl http://localhost:3000/api/site-settings

# Admin read/update
curl http://localhost:3000/api/admin/settings -b admin_cookies.txt
curl -X PATCH http://localhost:3000/api/admin/settings \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{"heroTitle":"Master the Game of Kings"}'
```

---

## 14. Page load tests

| Page | Check |
|------|-------|
| `/` | Loads < 2s, events show, announcements show |
| `/events` | Event cards render, register button works |
| `/rankings` | Table sorted by rating, ratingDelta shown |
| `/gallery` | Images load, filter works, upload requires login |
| `/blog` | Pagination works, category filter works |
| `/blog/[slug]` | Full post renders, related posts shown |
| `/donate` | Form works, leaderboard loads |
| `/dashboard` | Redirects to `/login` if no cookie |
| `/admin` | Redirects to `/admin/login` if no ADMIN cookie |
| `/renew` | Redirects to `/login` if no cookie |

---

## 15. User flows

### Registration → Dashboard
1. `/register` → fill form → submit → redirected to `/login`
2. `/login` → fill credentials → redirected to `/dashboard`
3. Dashboard shows member status (PENDING until approved)

### Admin message workflow
1. Submit contact form at `/contact`
2. Log in as ADMIN → `/admin`
3. Find message in inbox → mark as READ → mark as REPLIED

### Membership renewal
1. Log in as member with EXPIRED status
2. `/dashboard` shows renewal banner
3. Click renew → `/renew` → select plan → M-Pesa payment

---

## 16. Security tests

- [ ] `email: admin@example.com'; DROP TABLE "User"--` → 400 (sanitized)
- [ ] `name: <script>alert(1)</script>` → stored/displayed escaped
- [ ] Access `/api/admin/stats` without cookie → 401
- [ ] Access `/api/admin/stats` with MEMBER cookie → 403
- [ ] Expired JWT cookie → 401 on protected routes

---

## 17. Responsive design

| Breakpoint | Check |
|------------|-------|
| 375px (mobile) | Single-column, hamburger nav works |
| 768px (tablet) | 2-column layouts |
| 1280px (desktop) | 3-column grids, full-width nav |

Browsers: Chrome, Firefox, Safari, Edge.

---

## 18. Error handling

- [ ] `404` — invalid route shows Next.js 404 page
- [ ] `405` — wrong HTTP method returns `{ error: "Method not allowed" }`
- [ ] `500` — database errors return `{ error: "..." }` without stack traces
- [ ] All errors return `{ error: "<human-readable message>" }` format
