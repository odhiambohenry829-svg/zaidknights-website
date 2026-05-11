import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const rows = await prisma.siteSettings.findMany();
      const settings: Record<string, string> = {};
      for (const row of rows) settings[row.key] = row.value;
      return res.status(200).json({ settings });
    } catch (err) {
      console.error('Settings GET error:', err);
      return res.status(500).json({ error: 'Failed to load settings.' });
    }
  }

  if (req.method === 'PATCH') {
    const updates: Record<string, string> = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Body must be a key-value object.' });
    }
    try {
      await Promise.all(
        Object.entries(updates).map(([key, value]) =>
          prisma.siteSettings.upsert({
            where:  { key },
            create: { key, value },
            update: { value },
          })
        )
      );
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Settings PATCH error:', err);
      return res.status(500).json({ error: 'Failed to save settings.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
