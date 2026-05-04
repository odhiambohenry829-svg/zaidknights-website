# ZaidKnights Chess Club - API Reference

All endpoints follow REST conventions. Base URL: `https://zaidknights.com/api`

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Request body:
```json
{
  "name": "Amina Mwangi",
  "email": "amina@example.com",
  "password": "securePassword123"
}
```

Response (201 Created):
```json
{
  "message": "Registration complete.",
  "user": {
    "id": "clxyz123",
    "name": "Amina Mwangi",
    "email": "amina@example.com"
  }
}
```

Errors:
- `400` - Missing/invalid input
- `409` - Email already in use

---

### Login User
**POST** `/auth/login`

Request body:
```json
{
  "email": "amina@example.com",
  "password": "securePassword123"
}
```

Response (200 OK):
```json
{
  "message": "Logged in successfully.",
  "user": {
    "id": "clxyz123",
    "name": "Amina Mwangi",
    "email": "amina@example.com",
    "role": "MEMBER"
  }
}
```

Sets secure HTTP-only cookie: `zk_token`

Errors:
- `400` - Invalid input
- `401` - Invalid credentials

---

### Logout
**GET** `/auth/logout`

Response (200 OK):
```json
{
  "message": "Logged out."
}
```

Clears authentication cookie.

---

## Events Endpoints

### Get All Events
**GET** `/events`

Response (200 OK):
```json
[
  {
    "id": "event_001",
    "title": "Nairobi Rapid Open",
    "slug": "nairobi-rapid-open",
    "description": "A 3-day rapid tournament for all levels.",
    "location": "Chess Academy Nairobi",
    "startDate": "2026-05-25T09:00:00Z",
    "endDate": "2026-05-27T18:00:00Z",
    "capacity": 64,
    "createdAt": "2026-04-01T10:00:00Z",
    "updatedAt": "2026-04-01T10:00:00Z"
  }
]
```

---

### Create Event (Admin Only)
**POST** `/events`

Request body:
```json
{
  "title": "Youth Championship",
  "slug": "youth-championship",
  "description": "For players under 18.",
  "location": "Nairobi Chess Academy",
  "startDate": "2026-06-15T09:00:00Z",
  "endDate": "2026-06-17T18:00:00Z",
  "capacity": 32
}
```

Response (201 Created):
```json
{
  "id": "event_002",
  "title": "Youth Championship",
  ...
}
```

Errors:
- `400` - Missing required fields
- `401` - Unauthorized

---

## Members Endpoints

### Get All Members
**GET** `/members`

Response (200 OK):
```json
[
  {
    "id": "member_001",
    "user": {
      "id": "user_001",
      "name": "Amina Mwangi",
      "email": "amina@example.com"
    },
    "level": "MASTER",
    "rating": 1920,
    "status": "ACTIVE",
    "joinedAt": "2025-01-15T10:00:00Z"
  }
]
```

---

## Posts Endpoints

### Get All Published Posts
**GET** `/posts`

Response (200 OK):
```json
[
  {
    "id": "post_001",
    "title": "Mastering the London System",
    "slug": "london-system",
    "excerpt": "A step-by-step strategy guide...",
    "content": "Full article content...",
    "published": true,
    "createdAt": "2026-04-01T10:00:00Z"
  }
]
```

---

## Gallery Endpoints

### Get Gallery Items
**GET** `/gallery`

Response (200 OK):
```json
[
  {
    "id": "gallery_001",
    "title": "Champions Ceremony",
    "imageUrl": "https://cdn.example.com/photo1.jpg",
    "caption": "2025 awards night",
    "createdAt": "2026-04-01T10:00:00Z"
  }
]
```

---

## Contact Endpoints

### Submit Contact Form
**POST** `/contact`

Request body:
```json
{
  "name": "John Ochieng",
  "email": "john@example.com",
  "message": "I'm interested in joining the club!"
}
```

Response (201 Created):
```json
{
  "message": "Message sent. We will follow up shortly."
}
```

Errors:
- `400` - Invalid input
- `500` - Database error

---

## Dashboard Endpoints

### Get Dashboard Statistics (Admin/Authenticated)
**GET** `/dashboard/stats`

Response (200 OK):
```json
{
  "members": 280,
  "events": 24,
  "posts": 12
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid form submission."
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials."
}
```

### 405 Method Not Allowed
```json
{
  "message": "Method not allowed"
}
```

### 409 Conflict
```json
{
  "message": "Email already in use."
}
```

### 500 Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting

**Current Status:** Not implemented  
**Recommended for Production:** 100 requests per minute per IP

---

## Authentication

All protected endpoints require a valid `zk_token` in:
1. HTTP-only cookie (preferred, automatic after login)
2. Authorization header: `Authorization: Bearer <token>`

Token validity: 7 days

---

## Data Types

### User Roles
- `ADMIN` - Full system access
- `COACH` - Can manage events and members
- `MEMBER` - Member account
- `GUEST` - No account (public access)

### Membership Levels
- `BEGINNER` - New members
- `ADVANCED` - Active competitors
- `MASTER` - Elite members

### Member Status
- `PENDING` - Awaiting approval
- `ACTIVE` - Approved member
- `SUSPENDED` - Temporarily inactive

### Registration Status
- `PENDING` - Applied
- `CONFIRMED` - Accepted
- `CANCELLED` - Withdrawn

---

## Example Usage (cURL)

### Register
```bash
curl -X POST https://zaidknights.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amina Mwangi",
    "email": "amina@example.com",
    "password": "securePassword123"
  }'
```

### Login
```bash
curl -X POST https://zaidknights.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "amina@example.com",
    "password": "securePassword123"
  }' \
  -c cookies.txt
```

### Get Events
```bash
curl -X GET https://zaidknights.com/api/events
```

### Submit Contact
```bash
curl -X POST https://zaidknights.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Ochieng",
    "email": "john@example.com",
    "message": "Interested in coaching!"
  }'
```

---

## Versioning

Current API Version: `1.0`  
Last Updated: April 29, 2026

---

## Support

For API questions or issues:
- Review examples in this document
- Check test cases in `/pages/api/`
- Review Prisma ORM documentation
- Monitor server logs for detailed errors
