import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

const ALLOWED_PATCH_FIELDS = ['emergencyContact', 'trainingGroup', 'profilePhoto'] as const;
type PatchField = typeof ALLOWED_PATCH_FIELDS[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const member = await prisma.member.findUnique({
        where:  { userId: user.id },
        select: {
          id:               true,
          level:            true,
          tier:             true,
          rating:           true,
          status:           true,
          joinedAt:         true,
          profilePhoto:     true,
          trainingGroup:    true,
          emergencyContact: true,
          medicalNotes:     true,
          autoRenew:        true,
          memberships: {
            orderBy: { createdAt: 'desc' },
            take:    1,
            select:  { id: true, plan: true, tier: true, status: true, startDate: true, endDate: true },
          },
        },
      });

      if (!member) return res.status(404).json({ error: 'Member profile not found' });
      return res.status(200).json({ member });
    } catch (err) {
      console.error('Profile GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  if (req.method === 'PATCH') {
    const updates: Partial<Record<PatchField, string>> = {};

    for (const field of ALLOWED_PATCH_FIELDS) {
      if (req.body[field] !== undefined) {
        const val = String(req.body[field]).trim();
        if (val.length > 0) updates[field] = val;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    try {
      const member = await prisma.member.update({
        where:  { userId: user.id },
        data:   updates,
        select: {
          id: true, level: true, tier: true, rating: true, status: true,
          profilePhoto: true, trainingGroup: true, emergencyContact: true,
        },
      });
      return res.status(200).json({ member });
    } catch (err) {
      console.error('Profile PATCH error:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
