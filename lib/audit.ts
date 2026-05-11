import prisma from './prisma';
import type { NextApiRequest } from 'next';

export async function logAudit(params: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  req?: NextApiRequest;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId:    params.userId,
        action:    params.action,
        entity:    params.entity,
        entityId:  params.entityId,
        oldValue:  params.oldValue != null ? JSON.stringify(params.oldValue) : undefined,
        newValue:  params.newValue != null ? JSON.stringify(params.newValue) : undefined,
        ipAddress: params.req ? getIp(params.req) : undefined,
        userAgent: params.req?.headers['user-agent'],
      },
    });
  } catch {
    // Audit log failure should never break the main flow
  }
}

function getIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress ?? 'unknown';
}
