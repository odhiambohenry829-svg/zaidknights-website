// pages/api/payments/pesapal/initiate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPesapalToken, registerIPN, submitOrder } from '../../../../lib/pesapal';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, currency = 'KES', firstName, lastName, email, phone, description } = req.body;

  if (!amount || !firstName || !lastName || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (amount < 10) {
    return res.status(400).json({ error: 'Minimum donation is KES 10' });
  }

  try {
    // 1. Get auth token
    const token = await getPesapalToken();

    // 2. Register IPN
    const ipnId = await registerIPN(token);

    // 3. Create unique reference
    const reference = `ZK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // 4. Submit order
    const order = await submitOrder({
      token,
      ipnId,
      amount: parseFloat(amount),
      currency,
      reference,
      description: description || 'Donation to Zaid Knights Chess Club',
      firstName,
      lastName,
      email,
      phone,
    });

    return res.status(200).json({
      ok: true,
      redirectUrl: order.redirect_url,
      orderTrackingId: order.order_tracking_id,
      reference,
    });
  } catch (err: unknown) {
    console.error('Pesapal initiate error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Payment initiation failed',
    });
  }
}
