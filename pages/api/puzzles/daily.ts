import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daily = await prisma.dailyPuzzle.findFirst({
      where: { date: today },
      include: { puzzle: true },
    });

    if (!daily) {
      // auto-assign a random puzzle for today
      const count = await prisma.puzzle.count();
      const skip = Math.floor(Math.random() * count);
      const puzzle = await prisma.puzzle.findFirst({ skip, take: 1 });
      if (!puzzle) return res.status(404).json({ error: 'No puzzles available' });

      daily = await prisma.dailyPuzzle.create({
        data: { puzzleId: puzzle.id, date: today },
        include: { puzzle: true },
      });
    }

    const user = getUserFromRequest(req);
    let userAttempt = null;
    if (user) {
      userAttempt = await prisma.puzzleAttempt.findUnique({
        where: { userId_puzzleId: { userId: user.id, puzzleId: daily.puzzleId } },
      });
    }

    return res.status(200).json({ daily, userAttempt });
  } catch (err) {
    console.error('Daily puzzle error:', err);
    return res.status(500).json({ error: 'Failed to fetch daily puzzle' });
  }
}
