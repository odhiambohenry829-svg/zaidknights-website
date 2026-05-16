import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const leaderboard = await prisma.puzzleRush.findMany({
        orderBy: { score: 'desc' },
        take: 20,
        distinct: ['userId'],
        include: { user: { select: { name: true } } },
      });
      return res.status(200).json({ leaderboard });
    } catch (err) {
      console.error('Rush GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }

  if (req.method === 'POST') {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { score, solved, attempted, duration } = req.body;
    try {
      const session = await prisma.puzzleRush.create({
        data: { userId: user.id, score: score ?? solved ?? 0, solved: solved ?? 0, attempted: attempted ?? 0, duration: duration ?? 180 },
      });
      return res.status(201).json({ session });
    } catch (err) {
      console.error('Rush POST error:', err);
      return res.status(500).json({ error: 'Failed to save session' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
