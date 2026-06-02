// Resend email client + HTML email templates
// Install: npm install resend

import { Resend } from 'resend';
import { inlineEtimsBlock, type EtimsReceiptData } from './etims';

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM   = process.env.EMAIL_FROM ?? 'ZaidKnights <noreply@zaidknights.com>';
const SITE   = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zaidknights.com';

// ─── Shared layout ────────────────────────────────────────────

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ZaidKnights Chess Club</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:system-ui,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a28,#0d0d1a);padding:32px 40px;border-bottom:1px solid rgba(212,175,55,0.3);">
              <h1 style="margin:0;color:#D4AF37;font-size:24px;font-weight:700;letter-spacing:0.05em;">♞ ZaidKnights</h1>
              <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Nairobi Chess Club</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);background:#0d0d1a;">
              <p style="margin:0;color:#64748b;font-size:12px;text-align:center;">
                ZaidKnights Chess Club · Nairobi, Kenya<br/>
                <a href="${SITE}" style="color:#D4AF37;text-decoration:none;">${SITE}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Templates ────────────────────────────────────────────────

export function donationReceiptHtml(params: {
  donorName: string;
  amount: number;
  category: string;
  mpesaCode: string;
  date: string;
  message?: string;
  etims?: EtimsReceiptData;
}): string {
  return layout(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px;">Thank you for your donation!</h2>
    <p style="color:#94a3b8;margin:0 0 32px;">Your contribution helps grow chess in Nairobi.</p>

    <div style="background:#1a1a28;border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;color:#D4AF37;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Donation Receipt</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">Donor</td><td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;">${params.donorName}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">Amount</td><td style="padding:8px 0;color:#4ade80;font-size:18px;font-weight:700;text-align:right;">KES ${params.amount.toLocaleString()}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">Category</td><td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;">${params.category.replace(/_/g, ' ')}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">M-PESA Code</td><td style="padding:8px 0;color:#D4AF37;font-size:14px;font-weight:600;text-align:right;">${params.mpesaCode}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">Date</td><td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;">${params.date}</td></tr>
      </table>
    </div>

    ${params.message ? `<p style="color:#94a3b8;font-style:italic;margin:0 0 24px;">"${params.message}"</p>` : ''}

    ${params.etims ? inlineEtimsBlock(params.etims) : ''}

    ${params.etims ? `<p style="margin:12px 0 24px;"><a href="${SITE}/payments/receipt/${params.etims.transactionId}" style="color:#D4AF37;font-size:13px;">View / Print Full eTIMS Receipt →</a></p>` : ''}

    <a href="${SITE}/donate" style="display:inline-block;background:#D4AF37;color:#000;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:9999px;font-size:14px;">View Donation Page</a>
  `);
}

export function membershipReceiptHtml(params: {
  memberName: string;
  plan: string;
  tier: string;
  amount: number;
  startDate: string;
  endDate: string;
  mpesaCode: string;
  etims?: EtimsReceiptData;
}): string {
  return layout(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px;">Membership Confirmed!</h2>
    <p style="color:#94a3b8;margin:0 0 32px;">Welcome to ZaidKnights Chess Club. Your membership is now active.</p>

    <div style="background:#1a1a28;border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;color:#D4AF37;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Membership Details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">Member</td><td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;">${params.memberName}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">Tier</td><td style="padding:8px 0;color:#D4AF37;font-size:14px;font-weight:600;text-align:right;">${params.tier}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">Plan</td><td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;">${params.plan}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">Amount</td><td style="padding:8px 0;color:#4ade80;font-size:18px;font-weight:700;text-align:right;">KES ${params.amount.toLocaleString()}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">Valid From</td><td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;">${params.startDate}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">Valid Until</td><td style="padding:8px 0;color:#fff;font-size:14px;text-align:right;">${params.endDate}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:14px;">M-PESA Code</td><td style="padding:8px 0;color:#D4AF37;font-size:14px;font-weight:600;text-align:right;">${params.mpesaCode}</td></tr>
      </table>
    </div>

    ${params.etims ? inlineEtimsBlock(params.etims) : ''}

    ${params.etims ? `<p style="margin:12px 0 24px;"><a href="${SITE}/payments/receipt/${params.etims.transactionId}" style="color:#D4AF37;font-size:13px;">View / Print Full eTIMS Receipt →</a></p>` : ''}

    <a href="${SITE}/dashboard" style="display:inline-block;background:#D4AF37;color:#000;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:9999px;font-size:14px;">Go to Dashboard</a>
  `);
}

export function renewalReminderHtml(params: {
  memberName: string;
  expiryDate: string;
  daysLeft: number;
}): string {
  const urgent = params.daysLeft <= 3;
  return layout(`
    <h2 style="margin:0 0 8px;color:${urgent ? '#f87171' : '#fbbf24'};font-size:22px;">
      ${urgent ? '⚠️ Membership Expiring Soon!' : '📅 Membership Renewal Reminder'}
    </h2>
    <p style="color:#94a3b8;margin:0 0 24px;">Hi ${params.memberName},</p>
    <p style="color:#cbd5e1;margin:0 0 24px;">
      Your ZaidKnights Chess Club membership expires on <strong style="color:#fff;">${params.expiryDate}</strong>
      — that's <strong style="color:${urgent ? '#f87171' : '#fbbf24'};">${params.daysLeft} day${params.daysLeft !== 1 ? 's' : ''}</strong> away.
    </p>
    <p style="color:#94a3b8;margin:0 0 32px;">Renew now to keep enjoying training sessions, tournaments, and club benefits without interruption.</p>

    <a href="${SITE}/renew" style="display:inline-block;background:#D4AF37;color:#000;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:9999px;font-size:14px;">Renew Membership Now</a>
  `);
}

export function organizationApprovedHtml(params: {
  orgName: string;
  contactPerson: string;
}): string {
  return layout(`
    <h2 style="margin:0 0 8px;color:#4ade80;font-size:22px;">Organization Approved!</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">Hi ${params.contactPerson},</p>
    <p style="color:#cbd5e1;margin:0 0 24px;">
      We're excited to welcome <strong style="color:#D4AF37;">${params.orgName}</strong> to the ZaidKnights Chess Club network.
      Your registration has been approved and your organization dashboard is now active.
    </p>
    <a href="${SITE}/organizations/dashboard" style="display:inline-block;background:#D4AF37;color:#000;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:9999px;font-size:14px;">Access Organization Dashboard</a>
  `);
}

// ─── Send helpers ─────────────────────────────────────────────

export async function sendDonationReceipt(to: string, params: Parameters<typeof donationReceiptHtml>[0]) {
  const receiptTag = params.etims ? ` · ${params.etims.receiptNo}` : '';
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Donation Receipt — KES ${params.amount.toLocaleString()} · ${params.mpesaCode}${receiptTag}`,
    html:    donationReceiptHtml(params),
  });
}

export async function sendMembershipReceipt(to: string, params: Parameters<typeof membershipReceiptHtml>[0]) {
  const receiptTag = params.etims ? ` · ${params.etims.receiptNo}` : '';
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Membership Confirmed — ${params.plan} ${params.tier}${receiptTag}`,
    html:    membershipReceiptHtml(params),
  });
}

export async function sendRenewalReminder(to: string, params: Parameters<typeof renewalReminderHtml>[0]) {
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Your membership expires in ${params.daysLeft} day${params.daysLeft !== 1 ? 's' : ''}`,
    html:    renewalReminderHtml(params),
  });
}

export async function sendOrganizationApproved(to: string, params: Parameters<typeof organizationApprovedHtml>[0]) {
  return resend.emails.send({
    from:    FROM,
    to,
    subject: `${params.orgName} — Registration Approved`,
    html:    organizationApprovedHtml(params),
  });
}
