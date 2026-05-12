import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [topDonors, monthlyTotal] = await Promise.all([
      prisma.donation.groupBy({
        by:      ['donorName', 'anonymous'],
        where:   { status: 'COMPLETED' },
        _sum:    { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take:    10,
      }),
      prisma.donation.aggregate({
        where:  { status: 'COMPLETED', createdAt: { gte: monthStart } },
        _sum:   { amount: true },
      }),
    ]);

    const leaderboard = topDonors.map((d, i) => ({
      rank:   i + 1,
      name:   d.anonymous ? 'Anonymous' : d.donorName,
      total:  d._sum.amount ?? 0,
    }));

    return res.status(200).json({
      leaderboard,
      monthlyTotal: monthlyTotal._sum.amount ?? 0,
    });
  } catch (err) {
    console.error('Leaderboard GET error:', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
