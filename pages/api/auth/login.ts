import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { verifyPassword, signToken } from '../../../lib/auth';
import { isValidEmail } from '../../../lib/validators';

function getRedirectTo(role: string): string {
  switch (role) {
    case 'ADMIN':     return '/admin';
    case 'COACH':     return '/dashboard';
    case 'ORG_ADMIN': return '/organizations/dashboard';
    case 'GUEST':     return '/membership';
    default:          return '/dashboard';
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email address' });

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, name: true, email: true, password: true, role: true },
    });

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await verifyPassword(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    let memberStatus: string | null = null;
    if (user.role === 'MEMBER' || user.role === 'COACH') {
      const member = await prisma.member.findUnique({
        where:  { userId: user.id },
        select: { status: true },
      });
      memberStatus = member?.status ?? null;
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    );

    return res.status(200).json({
      user:         { id: user.id, name: user.name, email: user.email, role: user.role },
      redirectTo:   getRedirectTo(user.role),
      memberStatus,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
