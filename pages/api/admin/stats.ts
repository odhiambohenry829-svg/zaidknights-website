import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const [totalMembers, pendingMembers, totalEvents, totalPosts, recentMembers] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'PENDING' } }),
      prisma.event.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.member.findMany({
        orderBy: { joinedAt: 'desc' },
        take: 20,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    return res.status(200).json({
      totalMembers,
      pendingMembers,
      totalEvents,
      totalPosts,
      recentMembers,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
}