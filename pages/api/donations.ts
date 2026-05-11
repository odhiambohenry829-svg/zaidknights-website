import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getUserFromRequest } from '../../lib/auth';
import { sanitizeString } from '../../lib/validators';
import { logAudit } from '../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // GET — list donations (admin) or user's own
  if (req.method === 'GET') {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
      if (user.role === 'ADMIN') {
        const donations = await prisma.donation.findMany({
          orderBy: { createdAt: 'desc' },
          include: { transactions: { select: { mpesaReceiptNo: true, status: true } } },
        });
        return res.status(200).json({ donations });
      }

      // Non-admin: only own donations
      const donations = await prisma.donation.findMany({
        where:   { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ donations });
    } catch (err) {
      console.error('Donations GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch donations' });
    }
  }

  // POST — create donation
  if (req.method === 'POST') {
    const {
      donorName, donorEmail, amount, category,
      donorType, anonymous, message, dedication,
      taxReceipt, campaign,
    } = req.body;

    if (!donorName || !donorEmail || !amount || !category) {
      return res.status(400).json({ error: 'donorName, donorEmail, amount, and category are required' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 10) {
      return res.status(400).json({ error: 'Minimum donation amount is KES 10' });
    }

    const user = getUserFromRequest(req);

    try {
      const donation = await prisma.donation.create({
        data: {
          userId:     user?.id,
          donorType:  donorType  ?? 'INDIVIDUAL',
          donorName:  sanitizeString(donorName),
          donorEmail: donorEmail.toLowerCase().trim(),
          anonymous:  anonymous  ?? false,
          amount:     parsedAmount,
          category,
          message:    message    ? sanitizeString(message)    : undefined,
          dedication: dedication ? sanitizeString(dedication) : undefined,
          taxReceipt: taxReceipt ?? false,
          campaign:   campaign   ? sanitizeString(campaign)   : undefined,
          status:     'PENDING',
        },
      });

      await logAudit({
        userId:   user?.id,
        action:   'CREATE',
        entity:   'Donation',
        entityId: donation.id,
        newValue: { amount: parsedAmount, category },
        req,
      });

      return res.status(201).json({ donation });
    } catch (err) {
      console.error('Donations POST error:', err);
      return res.status(500).json({ error: 'Failed to create donation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
