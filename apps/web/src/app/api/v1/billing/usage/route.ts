import { NextRequest, NextResponse } from 'next/server';
import { UsageMeter } from '@talkie/billing';
import { prisma } from '@talkie/database';
import { getAuthenticatedSession } from '@/lib/auth/session';

const meter = new UsageMeter();

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;

    const summary = await meter.getWorkspaceUsageSummary(workspaceId);

    const recentRecords = await prisma.usageRecord.findMany({
      where: { workspaceId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: {
        summary,
        recentRecords,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
