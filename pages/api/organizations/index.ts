import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';
import { sanitizeString } from '../../../lib/validators';
import { logAudit } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // GET — list organizations (public: approved only; admin: all)
  if (req.method === 'GET') {
    const user = getUserFromRequest(req);
    try {
      const organizations = await prisma.organization.findMany({
        where:   user?.role === 'ADMIN' ? {} : { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { members: true } } },
      });
      return res.status(200).json({ organizations });
    } catch (err) {
      console.error('Organizations GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  }

  // POST — register organization
  if (req.method === 'POST') {
    const {
      name, type, registrationNumber, location, county,
      contactPerson, contactRole, email, phone,
      memberCount, chessInterest, participationType, notes,
    } = req.body;

    const required = { name, type, location, contactPerson, email, phone };
    const missing  = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

    try {
      const existing = await prisma.organization.findUnique({ where: { email: email.toLowerCase().trim() } });
      if (existing) return res.status(409).json({ error: 'An organization with this email is already registered' });

      const org = await prisma.organization.create({
        data: {
          name:               sanitizeString(name),
          type,
          registrationNumber: registrationNumber ? sanitizeString(registrationNumber) : undefined,
          location:           sanitizeString(location),
          county:             county ? sanitizeString(county) : undefined,
          contactPerson:      sanitizeString(contactPerson),
          contactRole:        contactRole ? sanitizeString(contactRole) : undefined,
          email:              email.toLowerCase().trim(),
          phone:              phone.trim(),
          memberCount:        parseInt(memberCount) || 0,
          chessInterest:      chessInterest      ?? 'ACTIVE_INTEREST',
          participationType:  participationType  ?? 'MEMBERSHIP_AFFILIATION',
          notes:              notes ? sanitizeString(notes) : undefined,
          status:             'PENDING',
        },
      });

      const user = getUserFromRequest(req);
      await logAudit({ userId: user?.id, action: 'CREATE', entity: 'Organization', entityId: org.id, newValue: { name, type }, req });

      return res.status(201).json({ organization: org });
    } catch (err) {
      console.error('Organizations POST error:', err);
      return res.status(500).json({ error: 'Failed to register organization' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
