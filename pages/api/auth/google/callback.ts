import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { signToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, error } = req.query;

  if (error || !code || typeof code !== 'string') {
    return res.redirect(302, '/login?error=google_cancelled');
  }

  try {
    const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;
    const callback = `${baseUrl}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  callback,
        grant_type:    'authorization_code',
      }),
    });
    if (!tokenRes.ok) throw new Error('Token exchange failed');
    const { access_token } = await tokenRes.json();

    // Fetch Google profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!profileRes.ok) throw new Error('Failed to fetch Google profile');
    const profile = await profileRes.json() as { id: string; email: string; name: string };

    const email = profile.email.trim().toLowerCase();

    // Find existing user by email or googleId
    let user = await prisma.user.findFirst({
      where: { OR: [{ email }, { googleId: profile.id }] },
    });

    let isNew = false;
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: profile.name, password: '', googleId: profile.id, role: 'MEMBER' },
      });
      await prisma.member.create({
        data: { userId: user.id, tier: 'BEGINNER', status: 'ACTIVE' },
      });
      isNew = true;
    } else if (!user.googleId) {
      // Link Google account to existing user
      await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id } });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    );

    return res.redirect(302, isNew ? '/dashboard?onboarding=true' : '/dashboard');
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return res.redirect(302, '/login?error=google_failed');
  }
}
