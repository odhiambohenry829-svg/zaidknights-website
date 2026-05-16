import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const user = getUserFromRequest(req);
    const { theme, minRating, maxRating, limit = '1', exclude } = req.query;

    try {
      const where: Record<string, unknown> = {};
      if (theme) where.themes = { has: theme as string };
      if (minRating || maxRating) {
        where.rating = {};
        if (minRating) (where.rating as Record<string, number>).gte = parseInt(minRating as string);
        if (maxRating) (where.rating as Record<string, number>).lte = parseInt(maxRating as string);
      }
      if (exclude) where.id = { not: exclude as string };

      // exclude already-solved puzzles for logged-in users
      if (user && limit === '1') {
        const solved = await prisma.puzzleAttempt.findMany({
          where: { userId: user.id, solved: true },
          select: { puzzleId: true },
          take: 500,
        });
        const solvedIds = solved.map(a => a.puzzleId);
        if (solvedIds.length > 0) {
          where.id = { ...(where.id as object || {}), notIn: solvedIds };
        }
      }

      const count = await prisma.puzzle.count({ where });
      const skip = count > 0 ? Math.floor(Math.random() * Math.min(count, 50)) : 0;

      const puzzles = await prisma.puzzle.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { rating: 'asc' },
      });

      return res.status(200).json({ puzzles });
    } catch (err) {
      console.error('Puzzles GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch puzzles' });
    }
  }

  // POST: record attempt
  if (req.method === 'POST') {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { puzzleId, solved, timeTaken, moves } = req.body;
    if (!puzzleId) return res.status(400).json({ error: 'puzzleId required' });

    try {
      const attempt = await prisma.puzzleAttempt.upsert({
        where: { userId_puzzleId: { userId: user.id, puzzleId } },
        update: solved ? { solved, timeTaken, moves } : {},
        create: { userId: user.id, puzzleId, solved: Boolean(solved), timeTaken, moves },
      });
      return res.status(200).json({ attempt });
    } catch (err) {
      console.error('Puzzles POST error:', err);
      return res.status(500).json({ error: 'Failed to record attempt' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
