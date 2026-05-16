import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);

  // GET: list games (recent completed, active, waiting)
  if (req.method === 'GET') {
    const { status, userId, limit = '20', format } = req.query;
    try {
      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (userId) where.OR = [{ whiteId: userId }, { blackId: userId }];
      if (format) where.format = format;

      const games = await prisma.onlineGame.findMany({
        where,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          white: { select: { id: true, name: true } },
          black: { select: { id: true, name: true } },
        },
      });
      return res.status(200).json({ games });
    } catch (err) {
      console.error('Games GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch games' });
    }
  }

  // POST: create a new game (seek)
  if (req.method === 'POST') {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { format = 'BLITZ', timeLimit = 600, increment = 0, isPublic = true } = req.body;

    try {
      // get player's online rating for this format
      let onlineRating = await prisma.onlineRating.findUnique({
        where: { userId_format: { userId: user.id, format } },
      });
      if (!onlineRating) {
        onlineRating = await prisma.onlineRating.create({
          data: { userId: user.id, format, rating: 800 },
        });
      }

      // check if there's a waiting game to join
      const waiting = await prisma.onlineGame.findFirst({
        where: {
          status: 'WAITING',
          format,
          timeLimit: parseInt(timeLimit),
          increment: parseInt(increment),
          blackId: null,
          whiteId: { not: user.id },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (waiting) {
        // join the waiting game as black
        const blackRating = await prisma.onlineRating.findUnique({
          where: { userId_format: { userId: user.id, format } },
        });
        const game = await prisma.onlineGame.update({
          where: { id: waiting.id },
          data: {
            blackId: user.id,
            blackRating: blackRating?.rating ?? 800,
            status: 'ACTIVE',
          },
        });
        return res.status(200).json({ game, joined: true });
      }

      // create a new seeking game
      const game = await prisma.onlineGame.create({
        data: {
          whiteId: user.id,
          format,
          timeLimit: parseInt(timeLimit),
          increment: parseInt(increment),
          isPublic: Boolean(isPublic),
          whiteRating: onlineRating.rating,
          status: 'WAITING',
        },
      });
      return res.status(201).json({ game, joined: false });
    } catch (err) {
      console.error('Games POST error:', err);
      return res.status(500).json({ error: 'Failed to create game' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
