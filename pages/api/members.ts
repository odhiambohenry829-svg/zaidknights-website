import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getUserFromRequest } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (req.query.admin === 'true') {
      const user = getUserFromRequest(req);
      if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
      try {
        const members = await prisma.member.findMany({
          select: {
            id: true, userId: true, level: true, tier: true,
            status: true, rating: true, joinedAt: true, autoRenew: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { joinedAt: 'desc' },
        });
        return res.status(200).json({ members });
      } catch (err) {
        console.error('Members admin GET error:', err);
        return res.status(500).json({ error: 'Failed to fetch members' });
      }
    }

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const { search, limit } = req.query;

      const where: Record<string, unknown> = { status: 'ACTIVE' };
      if (search) {
        where.user = { name: { contains: search as string, mode: 'insensitive' } };
      }

      const members = await prisma.member.findMany({
        where,
        take: limit ? parseInt(limit as string) : undefined,
        include: {
          user:         { select: { name: true, email: true } },
          results:      { select: { wins: true, losses: true, draws: true, score: true } },
          ratingHistory: {
            where:   { createdAt: { gte: thirtyDaysAgo } },
            orderBy: { createdAt: 'asc' },
            take:    1,
            select:  { rating: true },
          },
        },
        orderBy: { rating: 'desc' },
      });

      const enriched = members.map((m, idx) => {
        const wins   = m.results.reduce((s, r) => s + r.wins,   0);
        const losses = m.results.reduce((s, r) => s + r.losses, 0);
        const draws  = m.results.reduce((s, r) => s + r.draws,  0);
        const total  = wins + losses + draws;
        const score  = total > 0 ? Math.round(((wins + draws * 0.5) / total) * 100) : 0;

        const oldRating   = m.ratingHistory[0]?.rating ?? m.rating;
        const ratingDelta = m.rating - oldRating;

        return {
          id:          m.id,
          rank:        idx + 1,
          rating:      m.rating,
          level:       m.level,
          status:      m.status,
          wins,
          losses,
          draws,
          total,
          score,
          ratingDelta,
          user:        m.user,
        };
      });

      return res.status(200).json({ members: enriched });
    } catch (err) {
      console.error('Members GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch members' });
    }
  }

  if (req.method === 'PATCH') {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { memberId, status, level, rating } = req.body;
    if (!memberId) return res.status(400).json({ error: 'memberId is required' });

    try {
      const member = await prisma.member.update({
        where: { id: memberId },
        data: {
          ...(status              && { status }),
          ...(level               && { level }),
          ...(rating !== undefined && { rating }),
        },
      });
      return res.status(200).json({ member });
    } catch (err) {
      console.error('Members PATCH error:', err);
      return res.status(500).json({ error: 'Failed to update member' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
