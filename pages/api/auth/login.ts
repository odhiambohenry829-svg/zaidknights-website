import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { verifyPassword, signToken } from '../../../lib/auth';
import { sanitizeString, isEmail } from '../../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const email = sanitizeString(req.body.email).toLowerCase();
  const password = sanitizeString(req.body.password);

  if (!email || !password || !isEmail(email)) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

  const valid = await verifyPassword(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.setHeader('Set-Cookie', `zk_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
  return res.status(200).json({ message: 'Logged in successfully.', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
