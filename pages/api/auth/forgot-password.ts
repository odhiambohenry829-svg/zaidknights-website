import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';
import { Resend } from 'resend';
import { isValidEmail } from '../../../lib/validators';

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM   = process.env.EMAIL_FROM ?? 'ZaidKnights <noreply@zaidknights.com>';
const SITE   = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zaidknights.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  // Always return 200 — don't reveal if email is registered
  res.status(200).json({ ok: true });

  try {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !user.password) return; // Google-only accounts or unknown email — silent

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data:  { passwordResetToken: token, passwordResetExpiry: expiry },
    });

    await resend.emails.send({
      from:    FROM,
      to:      user.email,
      subject: 'Reset your Zaid Knights password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f0f18;color:#e2e8f0;border-radius:12px;">
          <h2 style="color:#D4AF37;margin:0 0 16px;">Reset Your Password</h2>
          <p style="color:#94a3b8;margin:0 0 24px;">Hi ${user.name ?? 'there'},<br>Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${SITE}/reset-password?token=${token}" style="display:inline-block;background:#D4AF37;color:#000;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:8px;font-size:14px;">Reset Password →</a>
          <p style="color:#64748b;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
        </div>`,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
  }
}
