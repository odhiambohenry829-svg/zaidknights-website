import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { isValidEmail, sanitizeString, validateRequired } from '../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, subject, message } = req.body;

  const missing = validateRequired({ name, email, message });
  if (missing) return res.status(400).json({ error: missing });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email address' });

  try {
    const contact = await prisma.contactMessage.create({
      data: {
        name:    sanitizeString(name),
        email:   email.trim().toLowerCase(),
        subject: subject ? sanitizeString(subject) : 'General Inquiry',
        message: sanitizeString(message),
      },
    });
    return res.status(201).json({ ok: true, id: contact.id });
  } catch (err) {
    console.error('Contact POST error:', err);
    return res.status(500).json({ error: 'Failed to save message' });
  }
}
