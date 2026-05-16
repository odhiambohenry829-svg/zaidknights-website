import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { gameId } = req.query;
  const user = getUserFromRequest(req);

  if (req.method === 'GET') {
    try {
      const game = await prisma.onlineGame.findUnique({
        where: { id: gameId as string },
        include: {
          white: { select: { id: true, name: true } },
          black: { select: { id: true, name: true } },
        },
      });
      if (!game) return res.status(404).json({ error: 'Game not found' });
      return res.status(200).json({ game });
    } catch (err) {
      console.error('Game GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch game' });
    }
  }

  if (req.method === 'PATCH') {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { moves, fen, status, result, termination, pgn } = req.body;

    try {
      const game = await prisma.onlineGame.findUnique({ where: { id: gameId as string } });
      if (!game) return res.status(404).json({ error: 'Game not found' });

      const isPlayer = game.whiteId === user.id || game.blackId === user.id;
      if (!isPlayer) return res.status(403).json({ error: 'Not a player in this game' });

      const updateData: Record<string, unknown> = {};
      if (moves !== undefined) updateData.moves = moves;
      if (fen !== undefined) updateData.fen = fen;
      if (pgn !== undefined) updateData.pgn = pgn;

      if (status && ['COMPLETED', 'ABORTED'].includes(status)) {
        updateData.status = status;
        if (result) updateData.result = result;
        if (termination) updateData.termination = termination;

        // Update online ratings on game completion
        if (status === 'COMPLETED' && result && game.whiteId && game.blackId) {
          const K = 32;
          const whiteRating = game.whiteRating ?? 800;
          const blackRating = game.blackRating ?? 800;
          const expectedWhite = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));

          let whiteScore = 0.5;
          if (result === '1-0') whiteScore = 1;
          if (result === '0-1') whiteScore = 0;

          const whiteDelta = Math.round(K * (whiteScore - expectedWhite));
          const blackDelta = Math.round(K * ((1 - whiteScore) - (1 - expectedWhite)));

          updateData.whiteRatingDelta = whiteDelta;
          updateData.blackRatingDelta = blackDelta;

          await Promise.all([
            prisma.onlineRating.upsert({
              where: { userId_format: { userId: game.whiteId, format: game.format } },
              update: {
                rating: { increment: whiteDelta },
                games: { increment: 1 },
                wins: result === '1-0' ? { increment: 1 } : undefined,
                losses: result === '0-1' ? { increment: 1 } : undefined,
                draws: result === '1/2-1/2' ? { increment: 1 } : undefined,
              },
              create: {
                userId: game.whiteId,
                format: game.format,
                rating: Math.max(100, 800 + whiteDelta),
                games: 1,
                wins: result === '1-0' ? 1 : 0,
                losses: result === '0-1' ? 1 : 0,
                draws: result === '1/2-1/2' ? 1 : 0,
              },
            }),
            prisma.onlineRating.upsert({
              where: { userId_format: { userId: game.blackId, format: game.format } },
              update: {
                rating: { increment: blackDelta },
                games: { increment: 1 },
                wins: result === '0-1' ? { increment: 1 } : undefined,
                losses: result === '1-0' ? { increment: 1 } : undefined,
                draws: result === '1/2-1/2' ? { increment: 1 } : undefined,
              },
              create: {
                userId: game.blackId,
                format: game.format,
                rating: Math.max(100, 800 + blackDelta),
                games: 1,
                wins: result === '0-1' ? 1 : 0,
                losses: result === '1-0' ? 1 : 0,
                draws: result === '1/2-1/2' ? 1 : 0,
              },
            }),
          ]);
        }
      }

      const updated = await prisma.onlineGame.update({
        where: { id: gameId as string },
        data: updateData,
        include: {
          white: { select: { id: true, name: true } },
          black: { select: { id: true, name: true } },
        },
      });
      return res.status(200).json({ game: updated });
    } catch (err) {
      console.error('Game PATCH error:', err);
      return res.status(500).json({ error: 'Failed to update game' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
