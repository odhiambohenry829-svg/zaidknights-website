import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { format = 'BLITZ', limit = '50' } = req.query;

  try {
    const ratings = await prisma.onlineRating.findMany({
      where: { format: format as 'BULLET' | 'BLITZ' | 'DAILY', games: { gte: 1 } },
      orderBy: { rating: 'desc' },
      take: parseInt(limit as string),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            member: { select: { level: true, profilePhoto: true } },
          },
        },
      },
    });

    return res.status(200).json({ ratings });
  } catch (err) {
    console.error('Online ratings error:', err);
    return res.status(500).json({ error: 'Failed to fetch ratings' });
  }
}
