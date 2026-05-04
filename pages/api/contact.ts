import type { NextApiRequest, NextApiResponse } from 'next';
import { sanitizeString, isEmail } from '../../lib/validators';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const name = sanitizeString(req.body.name);
  const email = sanitizeString(req.body.email).toLowerCase();
  const message = sanitizeString(req.body.message);
  if (!name || !email || !message || !isEmail(email)) {
    return res.status(400).json({ message: 'Invalid form submission.' });
  }
  await prisma.post.create({
    data: {
      title: `Contact from ${name}`,
      slug: `contact-${Date.now()}`,
      excerpt: message.slice(0, 120),
      content: message,
      authorId: (await prisma.user.findFirst({ where: { email: process.env.ADMIN_EMAIL || 'admin@zaidknights.com' } }))?.id || undefined,
      published: false
    }
  });
  return res.status(201).json({ message: 'Message sent. We will follow up shortly.' });
}
