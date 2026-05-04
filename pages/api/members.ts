import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const members = await prisma.member.findMany({ include: { user: true } });
    return res.status(200).json(members);
  }
  return res.status(405).json({ message: 'Method not allowed' });
}
