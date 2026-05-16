import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const categories = await prisma.forumCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { threads: true } },
        threads: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
          include: {
            author: { select: { name: true } },
            _count: { select: { posts: true } },
          },
        },
      },
    });
    return res.status(200).json({ categories });
  } catch (err) {
    console.error('Forum categories error:', err);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
