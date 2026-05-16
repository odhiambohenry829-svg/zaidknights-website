import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const [sent, received] = await Promise.all([
        prisma.friendship.findMany({
          where: { requesterId: user.id },
          include: { addressee: { select: { id: true, name: true, email: true, member: { select: { rating: true, level: true, profilePhoto: true } } } } },
        }),
        prisma.friendship.findMany({
          where: { addresseeId: user.id },
          include: { requester: { select: { id: true, name: true, email: true, member: { select: { rating: true, level: true, profilePhoto: true } } } } },
        }),
      ]);

      const friends = [
        ...sent.filter(f => f.status === 'ACCEPTED').map(f => ({ ...f.addressee, friendshipId: f.id, status: f.status })),
        ...received.filter(f => f.status === 'ACCEPTED').map(f => ({ ...f.requester, friendshipId: f.id, status: f.status })),
      ];
      const pending = received.filter(f => f.status === 'PENDING').map(f => ({ ...f.requester, friendshipId: f.id }));
      const sentPending = sent.filter(f => f.status === 'PENDING').map(f => ({ ...f.addressee, friendshipId: f.id }));

      return res.status(200).json({ friends, pending, sentPending });
    } catch (err) {
      console.error('Friends GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch friends' });
    }
  }

  if (req.method === 'POST') {
    const { addresseeId, action, friendshipId } = req.body;

    // Accept/reject/block
    if (action && friendshipId) {
      try {
        if (action === 'accept') {
          const f = await prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: 'ACCEPTED' },
          });
          return res.status(200).json({ friendship: f });
        }
        if (action === 'reject' || action === 'remove') {
          await prisma.friendship.delete({ where: { id: friendshipId } });
          return res.status(200).json({ success: true });
        }
        if (action === 'block') {
          const f = await prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: 'BLOCKED' },
          });
          return res.status(200).json({ friendship: f });
        }
      } catch (err) {
        console.error('Friends action error:', err);
        return res.status(500).json({ error: 'Action failed' });
      }
    }

    // Send friend request
    if (!addresseeId) return res.status(400).json({ error: 'addresseeId required' });
    if (addresseeId === user.id) return res.status(400).json({ error: 'Cannot friend yourself' });

    try {
      const existing = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: user.id, addresseeId },
            { requesterId: addresseeId, addresseeId: user.id },
          ],
        },
      });
      if (existing) return res.status(409).json({ error: 'Friendship already exists', status: existing.status });

      const friendship = await prisma.friendship.create({
        data: { requesterId: user.id, addresseeId },
      });
      return res.status(201).json({ friendship });
    } catch (err) {
      console.error('Friends POST error:', err);
      return res.status(500).json({ error: 'Failed to send request' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
