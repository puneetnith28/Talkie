import { prisma } from '../client';
import type { UsageType } from '@talkie/types';

export interface RecordUsageInput {
  type: UsageType | string;
  quantity: number;
  unit: string;
  costCents?: number;
  metadata?: Record<string, any>;
}

export class UsageService {
  /**
   * Record resource consumption and optionally debit workspace balance
   */
  static async recordUsage(workspaceId: string, input: RecordUsageInput) {
    const costCents = input.costCents ?? 0;

    return prisma.$transaction(async (tx) => {
      const record = await tx.usageRecord.create({
        data: {
          workspaceId,
          type: input.type,
          quantity: input.quantity,
          unit: input.unit,
          costCents,
          metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
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
}
