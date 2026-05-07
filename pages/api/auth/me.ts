import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const payload = getUserFromRequest(req);
  if (!payload) return res.status(401).json({ user: null });

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return res.status(401).json({ user: null });
    return res.status(200).json({ user });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ user: null });
  }
}