// pages/api/payments/pesapal/status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPesapalToken, getTransactionStatus } from '../../../../lib/pesapal';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { orderTrackingId } = req.query;
  if (!orderTrackingId) return res.status(400).json({ error: 'Missing orderTrackingId' });

  try {
    const token  = await getPesapalToken();
    const status = await getTransactionStatus(token, orderTrackingId as string);
    return res.status(200).json(status);
  } catch (err) {
    console.error('Status check error:', err);
    return res.status(500).json({ error: 'Failed to check payment status' });
  }
}
