import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';
import { sanitizeString, isEmail } from '../../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const name = sanitizeString(req.body.name);
  const email = sanitizeString(req.body.email).toLowerCase();
  const password = sanitizeString(req.body.password);

  if (!name || !email || !password || !isEmail(email)) {
    return res.status(400).json({ message: 'Invalid input.' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: 'Email already in use.' });

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: 'MEMBER'
    }
  });

  await prisma.member.create({ data: { userId: user.id, level: 'BEGINNER', status: 'PENDING' } });
  return res.status(201).json({ message: 'Registration complete.', user: { id: user.id, name: user.name, email: user.email } });
}
