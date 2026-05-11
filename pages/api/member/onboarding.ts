import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const [member, registrationCount] = await Promise.all([
        prisma.member.findUnique({
          where:  { userId: user.id },
          select: { emergencyContact: true, trainingGroup: true, profilePhoto: true, tier: true },
        }),
        prisma.registration.count({ where: { userId: user.id } }),
      ]);

      // Derive completion from actual data — step 1 is always done
      const steps = {
        1: true,
        2: !!(member?.emergencyContact || member?.trainingGroup || member?.profilePhoto),
        3: registrationCount > 0,
        4: !['ADVANCED', 'COMPETITIVE_SQUAD'].includes(member?.tier ?? '') ? true : false,
      };

      return res.status(200).json({ steps, tier: member?.tier ?? 'BEGINNER' });
    } catch (err) {
      console.error('Onboarding GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch onboarding status' });
    }
  }

  // POST — client marks a step complete; we just acknowledge (localStorage is the source of truth)
  if (req.method === 'POST') {
    const { step } = req.body;
    if (!step || typeof step !== 'number') {
      return res.status(400).json({ error: 'step (number) is required' });
    }

    // Audit the completion
    prisma.auditLog.create({
      data: {
        userId:   user.id,
        action:   'ONBOARDING_STEP',
        entity:   'Member',
        entityId: user.id,
        newValue: JSON.stringify({ step }),
      },
    }).catch(() => {});

    return res.status(200).json({ ok: true, step });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
