import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

const DEFAULTS: Record<string, string> = {
  heroTitle:       'Master the Game of Kings',
  heroSubtitle:    'Join Zaid Knights Chess Club — where strategy meets community. Compete in tournaments, climb the rankings, and grow with Kenya\'s most passionate chess players.',
  clubAddress:     'Nairobi, Kenya',
  clubPhone:       '+254 700 000 000',
  clubEmail:       'info@zaidknights.org',
  clubWhatsApp:    '+254700000000',
  socialX:         'https://x.com/zaidknights',
  socialFacebook:  'https://facebook.com/zaidknights',
  socialInstagram: 'https://instagram.com/zaidknights',
  aboutIntro:      'Zaid Knights is Nairobi\'s premier chess club — a vibrant community dedicated to growing chess talent across Kenya through tournaments, coaching, and camaraderie.',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const rows = await prisma.siteSettings.findMany();
    const settings: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) settings[row.key] = row.value;
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ settings });
  } catch (err) {
    console.error('site-settings error:', err);
    return res.status(200).json({ settings: DEFAULTS });
  }
}
