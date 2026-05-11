import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';
import { logAudit } from '../../../lib/audit';
import { sendOrganizationApproved } from '../../../lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  // GET — single organization
  if (req.method === 'GET') {
    try {
      const org = await prisma.organization.findUnique({
        where:   { id },
        include: { members: true, _count: { select: { members: true } } },
      });
      if (!org) return res.status(404).json({ error: 'Organization not found' });
      return res.status(200).json({ organization: org });
    } catch (err) {
      console.error('Organization GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch organization' });
    }
  }

  // PATCH — update / approve / reject (admin only)
  if (req.method === 'PATCH') {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { status, assignedCoordinator, trainingSchedule, notes } = req.body;

    try {
      const existing = await prisma.organization.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Organization not found' });

      const updated = await prisma.organization.update({
        where: { id },
        data: {
          ...(status               && { status, approvedAt: status === 'APPROVED' ? new Date() : undefined }),
          ...(assignedCoordinator  && { assignedCoordinator }),
          ...(trainingSchedule     && { trainingSchedule }),
          ...(notes                && { notes }),
        },
      });

      if (status === 'APPROVED' && existing.status !== 'APPROVED') {
        try {
          await sendOrganizationApproved(existing.email, {
            orgName:       existing.name,
            contactPerson: existing.contactPerson,
          });
        } catch (emailErr) {
          console.error('Org approval email failed:', emailErr);
        }
      }

      await logAudit({ userId: user.id, action: 'UPDATE', entity: 'Organization', entityId: id, oldValue: { status: existing.status }, newValue: { status }, req });

      return res.status(200).json({ organization: updated });
    } catch (err) {
      console.error('Organization PATCH error:', err);
      return res.status(500).json({ error: 'Failed to update organization' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
