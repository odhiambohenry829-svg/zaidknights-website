import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';
import { isValidEmail } from '../../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const count = await prisma.user.count({ where: { role: 'ADMIN' } });
    return res.status(200).json({ adminExists: count > 0 });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount > 0) return res.status(403).json({ error: 'Admin already exists. Use the login page.' });

  const { name, email, password, setupKey } = req.body;

  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email address.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const SETUP_KEY = process.env.ADMIN_SETUP_KEY;
  if (SETUP_KEY && setupKey !== SETUP_KEY) {
    return res.status(403).json({ error: 'Invalid setup key.' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });

    const hashed = await hashPassword(password);
    await prisma.user.create({
      data: {
        name:     name.trim(),
        email:    email.trim().toLowerCase(),
        password: hashed,
        role:     'ADMIN',
      },
    });

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Admin setup error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
