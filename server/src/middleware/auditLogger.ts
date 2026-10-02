import { Request } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export async function recordAuditLog(
  req: Request,
  action: string,
  entity: string,
  entityId: string,
  details?: Record<string, unknown>
) {
  if (!req.user) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { name: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        userName: user?.name || 'Staff User',
        action,
        entity,
        entityId,
        details: (details as any) || undefined,
        ipAddress: req.ip || req.socket.remoteAddress || null,
      },
    });
  } catch (err) {
    logger.warn({ err }, 'Failed to record audit log');
  }
}
