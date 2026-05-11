import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getUserFromRequest } from '../../lib/auth';
import { sanitizeString, slugify } from '../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (req.query.admin === 'true') {
      const user = getUserFromRequest(req);
      if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
      try {
        const events = await prisma.event.findMany({
          orderBy: { startDate: 'desc' },
          include: { _count: { select: { registrations: true } } },
        });
        return res.status(200).json({ events });
      } catch (err) {
        console.error('Events admin GET error:', err);
        return res.status(500).json({ error: 'Failed to fetch events' });
      }
    }

    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const events = await prisma.event.findMany({
        take: limit,
        orderBy: { startDate: 'asc' },
        where: { startDate: { gte: new Date() } },
        include: { _count: { select: { registrations: true } } },
      });
      return res.status(200).json({ events });
    } catch (err) {
      console.error('Events GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

  if (req.method === 'POST') {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { action, eventId, title, description, location, startDate, endDate, capacity, type } = req.body;

    // Event registration
    if (action === 'register') {
      if (!eventId) return res.status(400).json({ error: 'eventId is required' });
      try {
        const event = await prisma.event.findUnique({
          where: { id: eventId },
          include: { _count: { select: { registrations: true } } },
        });
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event._count.registrations >= event.capacity) return res.status(400).json({ error: 'Event is full' });

        const registration = await prisma.registration.create({
          data: { userId: user.id, eventId, status: 'CONFIRMED' },
        });
        return res.status(201).json({ registration });
      } catch (err: unknown) {
        if ((err as { code?: string })?.code === 'P2002') return res.status(409).json({ error: 'Already registered for this event' });
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Failed to register' });
      }
    }

    // Create event (admin only)
    if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    if (!title || !description || !location || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const event = await prisma.event.create({
        data: {
          title: sanitizeString(title),
          slug: slugify(title),
          description: sanitizeString(description),
          location: sanitizeString(location),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          capacity: capacity || 32,
          type: type || 'tournament',
        },
      });
      return res.status(201).json({ event });
    } catch (err) {
      console.error('Create event error:', err);
      return res.status(500).json({ error: 'Failed to create event' });
    }
  }

  if (req.method === 'DELETE') {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });

    try {
      await prisma.event.delete({ where: { id } });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Delete event error:', err);
      return res.status(500).json({ error: 'Failed to delete event' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}