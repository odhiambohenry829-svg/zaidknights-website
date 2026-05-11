import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const [member, registrations, results, upcomingEvents] = await Promise.all([
      prisma.member.findUnique({
        where:  { userId: user.id },
        select: {
          level:            true,
          tier:             true,
          rating:           true,
          status:           true,
          joinedAt:         true,
          profilePhoto:     true,
          trainingGroup:    true,
          emergencyContact: true,
          autoRenew:        true,
          memberships: {
            orderBy: { createdAt: 'desc' },
            select:  { id: true, plan: true, tier: true, status: true, startDate: true, endDate: true, amount: true },
          },
        },
      }),

      prisma.registration.findMany({
        where:   { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { event: { select: { title: true, startDate: true, location: true } } },
      }),

      prisma.result.findMany({
        where:   { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { event: { select: { title: true } } },
      }),

      prisma.event.findMany({
        where:   { startDate: { gt: new Date() } },
        orderBy: { startDate: 'asc' },
        take:    4,
        select:  {
          id: true, title: true, startDate: true, endDate: true,
          location: true, type: true, capacity: true,
          _count: { select: { registrations: true } },
        },
      }),
    ]);

    // Ranking position among active members
    let rankingPosition = 0;
    if (member) {
      const ahead = await prisma.member.count({
        where: { status: 'ACTIVE', rating: { gt: member.rating } },
      });
      rankingPosition = ahead + 1;
    }

    // Attendance stats
    const [attendedCount, attendanceTotal] = await Promise.all([
      prisma.attendance.count({ where: { member: { userId: user.id }, attended: true } }),
      prisma.attendance.count({ where: { member: { userId: user.id } } }),
    ]);

    return res.status(200).json({
      member,
      registrations,
      results,
      upcomingEvents,
      rankingPosition,
      attendedCount,
      attendanceTotal,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}
