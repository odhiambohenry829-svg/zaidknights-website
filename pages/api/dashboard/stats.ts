import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const members = await prisma.member.count();
  const events = await prisma.event.count();
  const posts = await prisma.post.count({ where: { published: true } });
  return res.status(200).json({ members, events, posts });
}
