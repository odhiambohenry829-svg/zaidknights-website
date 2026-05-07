import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getUserFromRequest } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const members = await prisma.member.findMany({
        where: { status: 'ACTIVE' },
        include: {
          user: { select: { name: true, email: true } },
          results: { select: { wins: true, losses: true, draws: true } },
        },
        orderBy: { rating: 'desc' },
      });

      // Aggregate results per member
      const enriched = members.map(m => {
        const wins   = m.results.reduce((s, r) => s + r.wins, 0);
        const losses = m.results.reduce((s, r) => s + r.losses, 0);
        const draws  = m.results.reduce((s, r) => s + r.draws, 0);
        return { id: m.id, rating: m.rating, level: m.level, status: m.status, wins, losses, draws, user: m.user };
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
          ...(status && { status }),
          ...(level  && { level }),
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