import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { transactionId } = req.query;
  if (!transactionId || typeof transactionId !== 'string') {
    return res.status(400).json({ error: 'transactionId is required' });
  }

  try {
    const tx = await prisma.paymentTransaction.findUnique({
      where:  { id: transactionId },
      select: { status: true, mpesaReceiptNo: true, amount: true, failureReason: true },
    });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    return res.status(200).json({
      status:        tx.status,
      mpesaReceiptNo: tx.mpesaReceiptNo,
      amount:        tx.amount,
      failureReason: tx.failureReason,
    });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch status' });
  }
}
