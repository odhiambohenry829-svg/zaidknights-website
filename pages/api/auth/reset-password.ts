import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'token and password are required' });
  if (password.length < 8)  return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      return res.status(400).json({ error: 'Reset link is invalid or has expired' });
    }

    const hashed = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data:  { password: hashed, passwordResetToken: null, passwordResetExpiry: null },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}
