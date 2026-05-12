import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getUserFromRequest } from '../../lib/auth';
import { sanitizeString } from '../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { category } = req.query;
      const items = await prisma.galleryItem.findMany({
        where: category && category !== 'all'
          ? { category: category as string }
          : undefined,
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ items });
    } catch (err) {
      console.error('Gallery GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch gallery' });
    }
  }

  if (req.method === 'POST') {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { title, imageUrl, caption, category } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'title and imageUrl are required' });
    }

    try {
      const item = await prisma.galleryItem.create({
        data: {
          title:    sanitizeString(title),
          imageUrl,
          caption:  caption  ? sanitizeString(caption)  : null,
          category: category ? sanitizeString(category) : 'general',
        },
      });
      return res.status(201).json({ item });
    } catch (err) {
      console.error('Gallery POST error:', err);
      return res.status(500).json({ error: 'Failed to create gallery item' });
    }
  }

  if (req.method === 'DELETE') {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });

    try {
      await prisma.galleryItem.delete({ where: { id } });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Gallery DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete item' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
