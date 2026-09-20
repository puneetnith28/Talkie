import { prisma } from '../client';
import type { UsageType } from '@talkie/types';

export interface RecordUsageInput {
  type: UsageType | string;
  quantity: number;
  unit?: string;
  costCents?: number;
  description?: string;
  metadata?: Record<string, any>;
}

export class UsageService {
  /**
   * Record resource consumption and optionally debit workspace balance
   */
  static async recordUsage(workspaceId: string, input: RecordUsageInput) {
    const costCents = input.costCents ?? 0;
    const metadata = {
      ...(input.metadata || {}),
      ...(input.description ? { description: input.description } : {}),
    };

    return prisma.$transaction(async (tx) => {
      const record = await tx.usageRecord.create({
        data: {
          workspaceId,
          type: input.type,
          quantity: input.quantity,
          unit: input.unit ?? 'units',
          costCents,
          metadataJson: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
        },
      });

      if (costCents > 0) {
        await tx.workspace.update({
          where: { id: workspaceId },
          data: {
            balanceCents: {
              decrement: costCents,
            },
          },
        });
      }

      return record;
    });
  }

  /**
   * Get current account balance for workspace in cents
   */
  static async getBalance(workspaceId: string): Promise<number> {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { balanceCents: true },
    });
    return workspace?.balanceCents ?? 0;
  }

  /**
   * Get usage record history
   */
  static async getUsageHistory(
    workspaceId: string,
    options?: { limit?: number; offset?: number }
  ) {
    return prisma.usageRecord.findMany({
      where: { workspaceId },
      orderBy: { timestamp: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  /**
   * Get aggregated usage statistics for a workspace
   */
  static async getUsageSummary(
    workspaceId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const where: any = { workspaceId };
    if (options?.startDate || options?.endDate) {
      where.timestamp = {};
      if (options.startDate) where.timestamp.gte = options.startDate;
      if (options.endDate) where.timestamp.lte = options.endDate;
    }

    const records = await prisma.usageRecord.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    const totalSpendCents = records.reduce((sum, r) => sum + r.costCents, 0);

    const byType = records.reduce((acc, r) => {
      if (!acc[r.type]) {
        acc[r.type] = { quantity: 0, costCents: 0, unit: r.unit };
      }
      acc[r.type].quantity += r.quantity;
      acc[r.type].costCents += r.costCents;
      return acc;
    }, {} as Record<string, { quantity: number; costCents: number; unit: string }>);

    return {
      totalSpendCents,
      recordsCount: records.length,
      byType,
      recentRecords: records.slice(0, 50),
    };
  }

  /**
   * Add funds / credits to workspace balance and create topup audit record
   */
  static async topUpBalance(workspaceId: string, amountCents: number, description?: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.workspace.update({
        where: { id: workspaceId },
        data: {
          balanceCents: {
            increment: amountCents,
          },
        },
      });

      await tx.usageRecord.create({
        data: {
          workspaceId,
          type: 'topup',
          quantity: 1,
          unit: 'credit',
          costCents: -amountCents,
          metadataJson: JSON.stringify({
            description: description || `Account Balance Top-up (+$${(amountCents / 100).toFixed(2)})`,
            amountCents,
          }),
        },
      });

      return updated;
    });
  }
}
