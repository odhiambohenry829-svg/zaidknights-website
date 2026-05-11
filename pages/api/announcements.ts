import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getUserFromRequest } from '../../lib/auth';
import { sanitizeString } from '../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // GET — list active announcements
  if (req.method === 'GET') {
    try {
      const now = new Date();
      const announcements = await prisma.announcement.findMany({
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: now } },
          ],
        },
        orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
        take: 20,
      });
      return res.status(200).json({ announcements });
    } catch (err) {
      console.error('Announcements GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch announcements' });
    }
  }

  // POST — create announcement (admin/coach)
  if (req.method === 'POST') {
    const user = getUserFromRequest(req);
    if (!user || !['ADMIN', 'COACH'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, body, pinned, expiresAt } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body are required' });

    try {
      const announcement = await prisma.announcement.create({
        data: {
          title:     sanitizeString(title),
          body:      sanitizeString(body),
          pinned:    pinned ?? false,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          authorId:  user.id,
        },
      });
      return res.status(201).json({ announcement });
    } catch (err) {
      console.error('Announcements POST error:', err);
      return res.status(500).json({ error: 'Failed to create announcement' });
    }
  }

  // DELETE — remove announcement (admin only)
  if (req.method === 'DELETE') {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id is required' });

    try {
      await prisma.announcement.delete({ where: { id: id as string } });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Announcements DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete announcement' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
