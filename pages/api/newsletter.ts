import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { isValidEmail } from '../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleaned = email.trim().toLowerCase();
  if (!isValidEmail(cleaned)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    await prisma.newsletterSubscription.upsert({
      where:  { email: cleaned },
      update: { active: true },
      create: { email: cleaned },
    });
    return res.status(200).json({ ok: true, message: 'Subscribed successfully!' });
  } catch (err) {
    console.error('Newsletter POST error:', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}
