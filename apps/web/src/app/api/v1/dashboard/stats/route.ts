import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@talkie/database';
import { getAuthenticatedSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(req);

    if (!auth.isAuthenticated || !auth.workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized access' } },
        { status: 401 }
      );
    }

    const workspaceId = auth.workspaceId;

    const [
      agentCount,
      numberCount,
      totalCalls,
      completedCalls,
      totalMessages,
      workspace,
      recentCalls,
      recentMessages,
    ] = await Promise.all([
      prisma.agent.count({ where: { workspaceId } }),
      prisma.phoneNumber.count({ where: { workspaceId, status: 'active' } }),
      prisma.call.count({ where: { workspaceId } }),
      prisma.call.count({ where: { workspaceId, status: 'completed' } }),
      prisma.message.count({ where: { conversation: { workspaceId } } }),
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, name: true, balanceCents: true, slug: true },
      }),
      prisma.call.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { agent: true, phoneNumber: true },
      }),
      prisma.message.findMany({
        where: { conversation: { workspaceId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const recentActivities = [
      ...recentCalls.map((c) => ({
        id: c.id,
        type: 'call',
        title: `${c.direction === 'inbound' ? 'Inbound call from' : 'Outbound call to'} ${c.direction === 'inbound' ? c.fromNumber : c.toNumber}`,
        subtitle: `Agent: ${c.agent?.name || 'Unassigned'} • Duration: ${c.durationSeconds}s • Status: ${c.status}`,
        timestamp: c.createdAt,
      })),
      ...recentMessages.map((m) => ({
        id: m.id,
        type: 'message',
        title: `${m.direction === 'inbound' ? 'SMS received from' : 'SMS sent to'} ${m.direction === 'inbound' ? m.senderNumber : m.recipientNumber}`,
        subtitle: m.body.slice(0, 60) + (m.body.length > 60 ? '...' : ''),
        timestamp: m.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);

    const callSuccessRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 100;

    return NextResponse.json({
      success: true,
      data: {
        workspaceId,
        workspaceName: workspace?.name || 'Talkie AI Labs',
        workspaceSlug: workspace?.slug || 'talkie-ai-labs',
        balanceCents: workspace?.balanceCents ?? 5000,
        balanceDollars: ((workspace?.balanceCents ?? 5000) / 100).toFixed(2),
        agentCount,
        numberCount,
        totalCalls,
        totalMessages,
        callSuccessRate,
        recentActivities,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to fetch dashboard stats' } },
      { status: 500 }
    );
  }
}
