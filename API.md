# API Routes

Write routes require:

```txt
x-admin-key: your ADMIN_API_KEY value
```

## Public

- `POST /api/contact`
- `POST /api/donations`
- `GET /api/donations`
- `GET /api/donations/:id/receipt`
- `POST /api/renewals`
- `GET /api/renewals?memberId=...`
- `POST /api/organizations`
- `GET /api/events`
- `GET /api/posts`
- `GET /api/gallery`
- `GET /api/members`
- `POST /api/registrations`
- `GET /api/results?eventId=...&userId=...`
- `GET /api/pairings?eventId=...`
- `GET /api/ratings?memberId=...&userId=...`
- `GET /api/announcements`
- `GET /api/training-groups?organizationId=...`
- `GET /api/profile?userId=...`
- `POST /api/consents`

## Admin

- `GET /api/admin/dashboard`
- `POST /api/events`
- `POST /api/posts`
- `POST /api/gallery`
- `POST /api/members`
- `GET /api/organizations`
- `PATCH /api/organizations/:id/status`
- `POST /api/organizations/bulk-upload`
- `GET /api/registrations?eventId=...&userId=...`
- `GET /api/attendance?eventId=...&memberId=...`
- `POST /api/attendance`
- `POST /api/pairings`
- `POST /api/results`
- `POST /api/ratings`
- `POST /api/announcements`
- `GET /api/payments`
- `PATCH /api/payments`
- `GET /api/contact-messages`
- `GET /api/audit-logs`
