import { NextRequest, NextResponse } from 'next/server';
import { UsageMeter } from '@talkie/billing';
import { prisma } from '@talkie/database';

const meter = new UsageMeter();

export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';

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
