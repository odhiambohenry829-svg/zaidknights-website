import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorised' });

  try {
    const [member, registrations, results] = await Promise.all([
      prisma.member.findUnique({
        where: { userId: user.id },
        select: { level: true, rating: true, status: true, joinedAt: true },
      }),
      prisma.registration.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          event: { select: { title: true, startDate: true, location: true } },
        },
      }),
      prisma.result.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          event: { select: { title: true } },
        },
      }),
    ]);

    return res.status(200).json({ member, registrations, results });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}