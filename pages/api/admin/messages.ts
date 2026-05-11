import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ messages });
    } catch (err) {
      console.error('Messages GET error:', err);
      return res.status(500).json({ error: 'Failed to load messages.' });
    }
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: 'id and status are required.' });
    try {
      const message = await prisma.contactMessage.update({
        where: { id },
        data:  { status },
      });
      return res.status(200).json({ message });
    } catch (err) {
      console.error('Messages PATCH error:', err);
      return res.status(500).json({ error: 'Failed to update message.' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required.' });
    try {
      await prisma.contactMessage.delete({ where: { id } });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Messages DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete message.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
