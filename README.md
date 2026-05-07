# Zaid Knights Website

Next.js and Prisma website for a chess club with events, news, gallery, contact
messages, member profiles, registrations, and results.

The project now also includes donations, membership renewals, organization
registration, payments, attendance, pairings, rating history, announcements,
audit logs, and admin analytics.

## Run Locally

```bash
npm install
npm run prisma:check
npm run prisma:deploy
npm run prisma:seed
npm run prisma:smoke
npm run dev
```

Open `http://localhost:3000`.

Useful pages:

- `/donate`
- `/renew`
- `/organizations`
- `/organizations/dashboard`
- `/profile`
- `/admin`

## Database

Copy `.env.example` to `.env`, then replace `PROJECT_REF` and `DB_PASSWORD`
with the values from Supabase Dashboard > Connect.

Set `ADMIN_API_KEY` to a long random value. API write routes expect it in the
`x-admin-key` request header.

The checked-in initial migration is in `prisma/migrations/20260507000000_init`.
The expanded club-management migration is in
`prisma/migrations/20260507001000_club_management_features`.
Use `npm run prisma:deploy` to apply both.

See `FEATURE_CHECKLIST.md` for the full feature map.
