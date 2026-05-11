import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { hashPassword, signToken } from '../../../lib/auth';
import { isValidEmail, sanitizeString, validateRequired, validatePasswordStrength } from '../../../lib/validators';

const VALID_TIERS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'COMPETITIVE_SQUAD'] as const;
type Tier = typeof VALID_TIERS[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, password, tier } = req.body;

  const missing = validateRequired({ name, email, password });
  if (missing) return res.status(400).json({ error: missing });

  if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email address' });

  const passwordError = validatePasswordStrength(password);
  if (passwordError) return res.status(400).json({ error: passwordError });

  const cleanName  = sanitizeString(name);
  const cleanEmail = email.trim().toLowerCase();
  const safeTier: Tier = VALID_TIERS.includes(tier) ? tier : 'BEGINNER';

  try {
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name:     cleanName,
        email:    cleanEmail,
        password: hashed,
        role:     'MEMBER',
        member: {
          create: {
            level:  safeTier,
            tier:   safeTier,
            status: 'PENDING',
          },
        },
      },
      select: { id: true, name: true, email: true, role: true },
    });

    // Fire-and-forget audit log — never fail registration because of this
    prisma.auditLog.create({
      data: {
        userId:   user.id,
        action:   'REGISTER',
        entity:   'User',
        entityId: user.id,
        newValue: JSON.stringify({ name: cleanName, email: cleanEmail, tier: safeTier }),
      },
    }).catch(() => {});

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    );

    return res.status(201).json({ user, isNewMember: true });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
