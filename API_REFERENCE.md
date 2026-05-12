# Zaid Knights Chess Club — API Reference

All endpoints are under `/api`. Auth uses an httpOnly cookie named `token` (7-day JWT).

---

## Authentication

### POST `/api/auth/register`
Create a new user and member profile.

**Body**
```json
{ "name": "Amina Mwangi", "email": "amina@example.com", "password": "Secure123" }
```
**Response 201**
```json
{ "user": { "id": "...", "name": "Amina Mwangi", "email": "amina@example.com", "role": "MEMBER" } }
```
Errors: `400` missing fields / weak password · `409` email already used

---

### POST `/api/auth/login`
Authenticate and set `token` cookie.

**Body**
```json
{ "email": "amina@example.com", "password": "Secure123" }
```
**Response 200**
```json
{ "user": { "id": "...", "name": "Amina Mwangi", "email": "amina@example.com", "role": "MEMBER" } }
```

---

### GET `/api/auth/logout`
Clears the `token` cookie.
```json
{ "message": "Logged out." }
```

---

### GET `/api/auth/me`
Returns the user decoded from the current cookie.
```json
{ "user": { "id": "...", "name": "...", "email": "...", "role": "MEMBER" } }
```

---

## Events

### GET `/api/events`
| Query param | Type | Description |
|-------------|------|-------------|
| `past` | `true` | Return past events instead of upcoming |
| `type` | string | Filter by event type (tournament, training, blitz, rapid, classical) |
| `limit` | number | Max results |
| `admin` | `true` | Return all events, sorted by startDate desc (ADMIN only) |

**Response 200**
```json
{
  "events": [
    {
      "id": "...", "title": "Nairobi Rapid Open", "slug": "nairobi-rapid-open",
      "description": "...", "location": "Chess Academy Nairobi",
      "startDate": "2026-06-01T09:00:00Z", "endDate": "2026-06-03T18:00:00Z",
      "capacity": 64, "type": "tournament",
      "_count": { "registrations": 32 }
    }
  ]
}
```

### POST `/api/events` — Register for an event
**Body**
```json
{ "action": "register", "eventId": "evt_123" }
```
Errors: `400` event full · `401` not logged in · `409` already registered

### POST `/api/events` — Create event (ADMIN)
**Body**
```json
{
  "title": "Youth Championship", "description": "...", "location": "Nairobi",
  "startDate": "2026-07-15T09:00:00Z", "endDate": "2026-07-17T18:00:00Z",
  "capacity": 32, "type": "tournament"
}
```

### DELETE `/api/events`
**Body** `{ "id": "evt_123" }` — ADMIN only

---

## Members / Rankings

### GET `/api/members`
Returns active members ranked by ELO with 30-day rating delta.

**Response 200**
```json
{
  "members": [
    {
      "id": "...", "rank": 1, "rating": 1920, "level": "ADVANCED",
      "status": "ACTIVE", "wins": 12, "losses": 3, "draws": 5,
      "total": 20, "score": 72, "ratingDelta": 45,
      "user": { "name": "Amina Mwangi", "email": "amina@example.com" }
    }
  ]
}
```

Add `?admin=true` (ADMIN only) to return all members (any status) with joinedAt/tier.

### PATCH `/api/members` — Update member (ADMIN)
**Body** `{ "memberId": "...", "status": "ACTIVE", "level": "ADVANCED", "rating": 1850 }`

---

## Posts (Blog)

### GET `/api/posts`
| Query param | Default | Description |
|-------------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 6 | Posts per page |
| `category` | all | Filter category |
| `slug` | — | Return single post + related |

**Response 200 (list)**
```json
{
  "posts": [...],
  "total": 24, "page": 1, "pages": 4, "hasNext": true, "hasPrev": false
}
```

**Response 200 (slug)**
```json
{ "post": { ...fullPost }, "related": [...3posts] }
```

### POST `/api/posts` — Create (ADMIN / COACH)
**Body** `{ "title", "excerpt", "content", "category", "imageUrl", "tags", "published" }`

### PATCH `/api/posts` — Update (ADMIN / COACH)
**Body** `{ "id", ...fields to update }`

### DELETE `/api/posts` — Delete (ADMIN / COACH)
**Body** `{ "id" }`

---

## Gallery

### GET `/api/gallery`
| Query param | Description |
|-------------|-------------|
| `category` | Filter: all · tournaments · training · events · team · general |

**Response 200** `{ "items": [{ "id", "title", "imageUrl", "caption", "category", "uploadedBy", "createdAt" }] }`

### POST `/api/gallery` — Upload photo (any authenticated user)
**Body** `{ "title": "Champions Ceremony", "imageUrl": "https://...", "caption": "...", "category": "tournaments" }`

### DELETE `/api/gallery` — Delete (ADMIN)
**Body** `{ "id" }`

---

## Contact & Newsletter

### POST `/api/contact`
**Body**
```json
{
  "name": "John Ochieng", "email": "john@example.com",
  "subject": "Membership", "message": "I'd like to join the club."
}
```
`subject` values: General Inquiry · Membership · Tournament · Partnership · Donation · Junior Programme

**Response 201** `{ "ok": true, "id": "..." }`

---

### POST `/api/newsletter`
**Body** `{ "email": "fan@example.com" }`

**Response 200** `{ "ok": true, "message": "Subscribed successfully!" }`

Upserts — re-subscribing a deactivated email reactivates it.

---

## Donations

### GET `/api/donations`
- ADMIN: all donations with M-Pesa receipt numbers
- Authenticated user: own donations only

### POST `/api/donations`
**Body**
```json
{
  "donorName": "Wanjiku Njoroge", "donorEmail": "wanjiku@example.com",
  "amount": 1000, "category": "GENERAL_FUND",
  "donorType": "INDIVIDUAL", "anonymous": false,
  "message": "Keep up the great work!", "dedication": "In memory of...",
  "taxReceipt": false, "campaign": null
}
```
`category`: GENERAL_FUND · TRAINING_EQUIPMENT · TOURNAMENTS · TRAVEL_SUPPORT

### GET `/api/donations/leaderboard`
**Response 200**
```json
{
  "leaderboard": [{ "rank": 1, "name": "Wanjiku Njoroge", "total": 15000 }],
  "monthlyTotal": 42500
}
```

---

## Memberships

### GET `/api/memberships`
Returns current user's member profile with last 5 memberships and payment transactions.

### POST `/api/memberships` — Create / Renew
**Body** `{ "plan": "ANNUAL", "tier": "ADVANCED", "autoRenew": false }`

| Plan | Beginner | Intermediate | Advanced | Squad |
|------|----------|-------------|---------|-------|
| Monthly | KES 500 | KES 800 | KES 1,200 | KES 2,000 |
| Term | KES 1,200 | KES 2,000 | KES 3,000 | KES 5,000 |
| Annual | KES 4,000 | KES 6,500 | KES 10,000 | KES 16,000 |

---

## Organizations

### GET `/api/organizations`
- Public: approved organizations only
- ADMIN: all organizations

### POST `/api/organizations`
**Body**
```json
{
  "name": "Nairobi Academy", "type": "SCHOOL",
  "registrationNumber": "ORG/2024/001",
  "location": "Westlands, Nairobi", "county": "Nairobi",
  "contactPerson": "Jane Doe", "contactRole": "Head of Sports",
  "email": "sport@nairobiacademy.ac.ke", "phone": "+254712345678",
  "memberCount": 120, "chessInterest": "ACTIVE_INTEREST",
  "participationType": "MEMBERSHIP_AFFILIATION",
  "trainingSchedule": "Saturdays 10am–12pm", "notes": "..."
}
```
`type`: SCHOOL · COMPANY · ACADEMY · CLUB  
`chessInterest`: BEGINNER_INTEREST · ACTIVE_INTEREST · COMPETITIVE_INTEREST  
`participationType`: TRAINING_PARTNERSHIP · TOURNAMENT_ENTRY · MEMBERSHIP_AFFILIATION

Errors: `409` email already registered

---

## Announcements

### GET `/api/announcements`
Returns active (non-expired) announcements, pinned first.

### POST `/api/announcements` — Create (ADMIN / COACH)
**Body** `{ "title": "...", "body": "...", "pinned": false, "expiresAt": "2026-12-31T00:00:00Z" }`

### DELETE `/api/announcements?id=...` — Delete (ADMIN)

---

## Dashboard

### GET `/api/dashboard/stats`
Requires authentication. Returns:
```json
{
  "member": { "level", "tier", "rating", "status", "joinedAt", "profilePhoto",
              "trainingGroup", "emergencyContact", "autoRenew", "memberships": [...] },
  "registrations": [...],
  "results": [...],
  "upcomingEvents": [...],
  "rankingPosition": 12,
  "attendedCount": 8,
  "attendanceTotal": 10
}
```

---

## Admin

### GET `/api/admin/stats` — ADMIN only
```json
{
  "totalMembers": 280, "pendingMembers": 14, "activeMembers": 220,
  "totalEvents": 24, "totalPosts": 36,
  "totalDonations": 150, "pendingDonations": 8, "completedDonations": 128,
  "totalOrgs": 12, "pendingOrgs": 3,
  "revenueTotal": 485000
}
```

### GET `/api/admin/settings` — ADMIN only
Returns key-value map: `heroTitle`, `heroSubtitle`, `aboutIntro`, `clubAddress`, `clubPhone`, `clubEmail`, `clubWhatsApp`, `socialX`, `socialFacebook`, `socialInstagram`

### PATCH `/api/admin/settings` — ADMIN only
**Body** `{ "heroTitle": "Master the Game of Kings" }`

### GET `/api/admin/messages` — ADMIN only
Returns all contact messages.

### PATCH `/api/admin/messages` — ADMIN only
**Body** `{ "id": "...", "status": "READ" }`  
`status`: NEW · READ · REPLIED · ARCHIVED

### DELETE `/api/admin/messages` — ADMIN only
**Body** `{ "id": "..." }`

---

## Payments (M-Pesa)

### POST `/api/payments/mpesa/initiate`
Requires authentication. Triggers an STK push to the user's phone.
**Body** `{ "phoneNumber": "+254712345678", "amount": 1000, "type": "donation"|"membership", "referenceId": "..." }`

### POST `/api/payments/mpesa/callback`
Safaricom webhook — do not call directly.

---

## Profile

### GET `/api/profile` — Authenticated
Full member profile with rating history, memberships, attendance, results.

### PATCH `/api/profile` — Authenticated
**Body** `{ "profilePhoto": "https://...", "trainingGroup": "Alpha", "emergencyContact": "+254...", "medicalNotes": "...", "autoRenew": true }`

---

## Site Settings

### GET `/api/site-settings` — Public
Returns public-facing settings (heroTitle, heroSubtitle).

---

## Error Format

All errors return `{ "error": "Human-readable message" }` with the appropriate HTTP status code.

| Status | Meaning |
|--------|---------|
| 400 | Bad request / missing fields |
| 401 | Not authenticated |
| 403 | Authenticated but insufficient role |
| 404 | Resource not found |
| 405 | Method not allowed |
| 409 | Conflict (duplicate) |
| 500 | Server / database error |

---

*API Version: 2.0 · Last Updated: May 2026*
