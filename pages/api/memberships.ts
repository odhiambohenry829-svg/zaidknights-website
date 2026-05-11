import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getUserFromRequest } from '../../lib/auth';
import { logAudit } from '../../lib/audit';

// Membership pricing (KES)
export const MEMBERSHIP_PRICES: Record<string, Record<string, number>> = {
  BEGINNER:          { MONTHLY: 500,  TERM: 1200,  ANNUAL: 4000  },
  INTERMEDIATE:      { MONTHLY: 800,  TERM: 2000,  ANNUAL: 6500  },
  ADVANCED:          { MONTHLY: 1200, TERM: 3000,  ANNUAL: 10000 },
  COMPETITIVE_SQUAD: { MONTHLY: 2000, TERM: 5000,  ANNUAL: 16000 },
};

// Term end dates (school terms in Kenya)
function getTermEndDate(): Date {
  const now    = new Date();
  const month  = now.getMonth() + 1;
  const year   = now.getFullYear();
  if (month <= 4)  return new Date(year, 3, 30);  // Term 1 ends April
  if (month <= 8)  return new Date(year, 7, 31);  // Term 2 ends August
  return new Date(year, 11, 15);                  // Term 3 ends December
}

function getEndDate(plan: string): Date {
  const now = new Date();
  if (plan === 'MONTHLY') {
    return new Date(now.setMonth(now.getMonth() + 1));
  }
  if (plan === 'TERM') {
    return getTermEndDate();
  }
  // ANNUAL
  return new Date(now.setFullYear(now.getFullYear() + 1));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // GET — current membership status
  if (req.method === 'GET') {
    try {
      const member = await prisma.member.findUnique({
        where: { userId: user.id },
        include: {
          memberships: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { transactions: { select: { status: true, mpesaReceiptNo: true, createdAt: true } } },
          },
        },
      });
      return res.status(200).json({ member });
    } catch (err) {
      console.error('Memberships GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch membership' });
    }
  }

  // POST — create/renew membership
  if (req.method === 'POST') {
    const { plan, tier, autoRenew } = req.body;

    if (!plan || !tier) return res.status(400).json({ error: 'plan and tier are required' });

    const amount = MEMBERSHIP_PRICES[tier]?.[plan];
    if (!amount) return res.status(400).json({ error: 'Invalid plan or tier' });

    try {
      // Ensure member profile exists
      let member = await prisma.member.findUnique({ where: { userId: user.id } });
      if (!member) {
        member = await prisma.member.create({
          data: { userId: user.id, tier, status: 'PENDING_PAYMENT', autoRenew: autoRenew ?? false },
        });
      }

      const startDate = new Date();
      const endDate   = getEndDate(plan);

      const membership = await prisma.membership.create({
        data: {
          memberId:  member.id,
          plan,
          tier,
          amount,
          startDate,
          endDate,
          autoRenew: autoRenew ?? false,
          status:    'PENDING_PAYMENT',
        },
      });

      await logAudit({ userId: user.id, action: 'CREATE', entity: 'Membership', entityId: membership.id, newValue: { plan, tier, amount }, req });

      return res.status(201).json({ membership, amount, endDate });
    } catch (err) {
      console.error('Memberships POST error:', err);
      return res.status(500).json({ error: 'Failed to create membership' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
