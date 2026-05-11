import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getUserFromRequest } from '../../lib/auth';
import { sanitizeString } from '../../lib/validators';
import { logAudit } from '../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // GET — full member profile
  if (req.method === 'GET') {
    try {
      const member = await prisma.member.findUnique({
        where:   { userId: user.id },
        include: {
          ratingHistory:  { orderBy: { createdAt: 'desc' }, take: 20 },
          memberships:    { orderBy: { createdAt: 'desc' }, take: 5 },
          attendance:     {
            include: { event: { select: { title: true, startDate: true } } },
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
          results: {
            include: { event: { select: { title: true, startDate: true } } },
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });
      return res.status(200).json({ member });
    } catch (err) {
      console.error('Profile GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  // PATCH — update profile
  if (req.method === 'PATCH') {
    const { profilePhoto, trainingGroup, emergencyContact, medicalNotes, autoRenew } = req.body;

    try {
      const existing = await prisma.member.findUnique({ where: { userId: user.id } });
      if (!existing) return res.status(404).json({ error: 'Member profile not found' });

      const updated = await prisma.member.update({
        where: { userId: user.id },
        data: {
          ...(profilePhoto     !== undefined && { profilePhoto:     profilePhoto ? sanitizeString(profilePhoto) : null }),
          ...(trainingGroup    !== undefined && { trainingGroup:    trainingGroup ? sanitizeString(trainingGroup) : null }),
          ...(emergencyContact !== undefined && { emergencyContact: emergencyContact ? sanitizeString(emergencyContact) : null }),
          ...(medicalNotes     !== undefined && { medicalNotes:     medicalNotes ? sanitizeString(medicalNotes) : null }),
          ...(autoRenew        !== undefined && { autoRenew }),
        },
      });

      await logAudit({ userId: user.id, action: 'UPDATE', entity: 'Member', entityId: existing.id, req });

      return res.status(200).json({ member: updated });
    } catch (err) {
      console.error('Profile PATCH error:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
