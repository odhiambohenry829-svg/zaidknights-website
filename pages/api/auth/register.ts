import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ message: 'Email already in use.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: 'MEMBER'
      }
    });

    await prisma.member.create({
      data: { userId: user.id, level: 'BEGINNER', status: 'PENDING' }
    });

    return res.status(201).json({ 
      message: 'Registration complete.', 
      user: { id: user.id, name: user.name, email: user.email } 
    });

  } catch (error: any) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({ 
      message: 'Server error.', 
      error: error.message 
    });
  }
}