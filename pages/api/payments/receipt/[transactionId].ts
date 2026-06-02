import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { renderEtimsHtml, type EtimsReceiptData } from '../../../../lib/etims';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { transactionId, format } = req.query;
  if (!transactionId || typeof transactionId !== 'string') {
    return res.status(400).json({ error: 'transactionId required' });
  }

  try {
    const tx = await prisma.paymentTransaction.findUnique({
      where:  { id: transactionId },
      select: { status: true, etimsData: true, etimsReceiptNo: true, amount: true },
    });

    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (tx.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Receipt only available for completed payments' });
    }
    if (!tx.etimsData) {
      return res.status(404).json({ error: 'Receipt not yet generated' });
    }

    const receiptData = JSON.parse(tx.etimsData) as EtimsReceiptData;

    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(renderEtimsHtml(receiptData));
    }

    return res.status(200).json(receiptData);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch receipt' });
  }
}
