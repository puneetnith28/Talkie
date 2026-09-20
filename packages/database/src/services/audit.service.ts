import { prisma } from '../client';

export interface CreateAuditLogInput {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Create an audit entry for security and compliance tracking
   */
  static async log(workspaceId: string, input: CreateAuditLogInput) {
    return prisma.auditLog.create({
      data: {
        workspaceId,
        userId: input.userId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
        ip: input.ip,
        userAgent: input.userAgent,
      },
    });
  }

  /**
   * List audit logs for a workspace
   */
  static async list(
    workspaceId: string,
    options?: {
      action?: string;
      userId?: string;
      resourceType?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    return prisma.auditLog.findMany({
      where: {
        workspaceId,
        ...(options?.action ? { action: options.action } : {}),
        ...(options?.userId ? { userId: options.userId } : {}),
        ...(options?.resourceType ? { resourceType: options.resourceType } : {}),
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }
}
