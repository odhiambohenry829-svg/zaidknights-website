# Feature Checklist

## Donations

- One-time donations: `Donation.frequency = ONE_TIME`
- Monthly supporter donations: `Donation.frequency = MONTHLY`, `nextBillingAt`
- Categories: training equipment, tournaments, travel support, general fund
- Anonymous option: `Donation.anonymous`
- Receipt data: `receiptNumber`, `receiptUrl`, printable receipt route
- Leaderboard: `GET /api/donations`
- Donor type: individual, company, alumni
- Payment method: MPESA, card, bank transfer, cash, other
- Dedication note: `Donation.message`
- Tax receipt flag: `taxReceiptRequested`
- Campaign tracking: `DonationCampaign`

## Membership Renewals

- Renewal page: `/renew`
- Plans: monthly, term, annual
- Auto-expiry: `Subscription.endDate`, `Membership.expiresAt`
- Reminders: `RenewalReminder`, `NotificationLog`
- Payment history: `PaymentTransaction`
- Tiers: beginner, intermediate, advanced, competitive squad, family
- Family accounts: `FamilyAccount`
- Auto-renew: `autoRenew`
- Grace period: `gracePeriodDays`, `gracePeriodEndsAt`
- Statuses: active, expired, suspended, pending payment
- Ratings, training groups, attendance, medical notes, emergency contacts

## Organizations

- Registration page: `/organizations`
- Types: school, company, academy, club
- Approval flow: `Organization.status`, `PATCH /api/organizations/:id/status`
- Dashboard surface: `/organizations/dashboard`
- Required fields: name, type, location, contact, email, phone, member count, interest level, participation type
- Teams/groups: `TrainingGroup`
- Bulk uploads: `BulkUpload`
- Billing: `PaymentTransaction.organizationId`
- Coordinator and preferred schedule fields included
- Competition history included

## Club Management

- Events and tournaments: `Event`, `Registration`, `Pairing`, `Result`
- Attendance tracking: `Attendance`
- Member profiles: `/profile`, `Member`, `ChessRatingHistory`, `MemberAchievement`
- Admin dashboard: `/admin`, `GET /api/admin/dashboard`
- Communication: `Announcement`, `NotificationLog`
- Role-based structure: `Role`, `lib/rbac.ts`
- Audit logs: `AuditLog`
- Data consent: `DataConsent`
