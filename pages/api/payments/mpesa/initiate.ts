import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';
import { initiateStkPush } from '../../../../lib/mpesa';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phoneNumber, amount, type, referenceId } = req.body;

  if (!phoneNumber || !amount || !type || !referenceId) {
    return res.status(400).json({ error: 'phoneNumber, amount, type, and referenceId are required' });
  }

  if (!['donation', 'membership'].includes(type)) {
    return res.status(400).json({ error: 'type must be donation or membership' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount < 1) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const user = getUserFromRequest(req);

  try {
    const result = await initiateStkPush({
      phoneNumber,
      amount:           parsedAmount,
      accountReference: type === 'donation' ? 'DONATION' : 'MEMBERSHIP',
      transactionDesc:  type === 'donation' ? 'ZaidKnights Donation' : 'ZaidKnights Membership',
    });

    if (result.ResponseCode !== '0') {
      return res.status(400).json({ error: result.ResponseDescription });
    }

    // Create pending transaction
    const transaction = await prisma.paymentTransaction.create({
      data: {
        amount:           parsedAmount,
        method:           'MPESA',
        status:           'PENDING',
        phoneNumber,
        checkoutRequestId: result.CheckoutRequestID,
        merchantRequestId: result.MerchantRequestID,
        ...(type === 'donation'   && { donationId:   referenceId }),
        ...(type === 'membership' && { membershipId: referenceId }),
        metadata: JSON.stringify({ userId: user?.id }),
      },
    });

    return res.status(200).json({
      transactionId:     transaction.id,
      checkoutRequestId: result.CheckoutRequestID,
      customerMessage:   result.CustomerMessage,
    });
  } catch (err) {
    console.error('MPESA initiate error:', err);
    return res.status(500).json({ error: 'Failed to initiate payment' });
  }
}
