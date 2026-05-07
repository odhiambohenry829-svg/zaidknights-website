import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const events = await prisma.event.findMany({ orderBy: { startDate: 'asc' } });
    return res.status(200).json(events);
  }

  if (req.method === 'POST') {
    const { title, slug, description, location, startDate, endDate, capacity } = req.body;
    if (!title || !slug || !description || !location || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing event data.' });
    }
    const event = await prisma.event.create({ data: { title, slug, description, location, startDate: new Date(startDate), endDate: new Date(endDate), capacity: Number(capacity || 32) } });
    return res.status(201).json(event);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
