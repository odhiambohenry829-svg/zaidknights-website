import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { category, level } = req.query;
    try {
      const where: Record<string, unknown> = { published: true };
      if (category) where.category = category;
      if (level) where.level = level;

      const lessons = await prisma.videoLesson.findMany({
        where,
        orderBy: [{ category: 'asc' }, { order: 'asc' }],
      });
      return res.status(200).json({ lessons });
    } catch (err) {
      console.error('Lessons GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch lessons' });
    }
  }

  if (req.method === 'POST') {
    const user = getUserFromRequest(req);
    if (!user || !['ADMIN', 'COACH'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { title, description, youtubeId, category, level, durationSec, premium, order } = req.body;
    try {
      const lesson = await prisma.videoLesson.create({
        data: { title, description, youtubeId, category: category || 'general', level: level || 'BEGINNER', durationSec, premium: Boolean(premium), order: order || 0 },
      });
      return res.status(201).json({ lesson });
    } catch (err) {
      console.error('Lessons POST error:', err);
      return res.status(500).json({ error: 'Failed to create lesson' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
