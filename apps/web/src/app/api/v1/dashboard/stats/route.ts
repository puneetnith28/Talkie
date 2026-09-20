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
      activeAgentCount,
      numberCount,
      totalCalls,
      completedCalls,
      failedCalls,
      totalMessages,
      apiKeyCount,
      workspace,
      recentCalls,
      recentMessages,
    ] = await Promise.all([
      prisma.agent.count({ where: { workspaceId } }),
      prisma.agent.count({ where: { workspaceId, status: 'active' } }),
      prisma.phoneNumber.count({ where: { workspaceId } }),
      prisma.call.count({ where: { workspaceId } }),
      prisma.call.count({ where: { workspaceId, status: 'completed' } }),
      prisma.call.count({ where: { workspaceId, status: 'failed' } }),
      prisma.message.count({ where: { conversation: { workspaceId } } }),
      prisma.apiKey.count({ where: { workspaceId } }),
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, name: true, balanceCents: true, slug: true },
      }),
      prisma.call.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { agent: true, phoneNumber: true },
      }),
      prisma.message.findMany({
        where: { conversation: { workspaceId } },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);

    const recentActivities = [
      ...recentCalls.map((c) => ({
        id: c.id,
        type: 'call' as const,
        title: `${c.direction === 'inbound' ? 'Inbound call from' : 'Outbound call to'} ${c.direction === 'inbound' ? c.fromNumber : c.toNumber}`,
        subtitle: `Agent: ${c.agent?.name || 'Unassigned'} • Duration: ${c.durationSeconds}s • Status: ${c.status}`,
        timestamp: c.createdAt,
      })),
      ...recentMessages.map((m) => ({
        id: m.id,
        type: 'message' as const,
        title: `${m.direction === 'inbound' ? 'Message from' : 'Message to'} ${m.direction === 'inbound' ? m.senderNumber : m.recipientNumber}`,
        subtitle: m.body.slice(0, 60) + (m.body.length > 60 ? '...' : ''),
        timestamp: m.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);

    const callSuccessRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : null;

    return NextResponse.json({
      success: true,
      data: {
        workspaceId,
        workspaceName: workspace?.name || 'Talkie Workspace',
        workspaceSlug: workspace?.slug || 'talkie-workspace',
        balanceCents: workspace?.balanceCents ?? 0,
        balanceDollars: ((workspace?.balanceCents ?? 0) / 100).toFixed(2),
        agentCount,
        activeAgentCount,
        numberCount,
        totalCalls,
        completedCalls,
        failedCalls,
        totalMessages,
        hasApiKeys: apiKeyCount > 0,
        callSuccessRate,
        isDemoMode: Boolean(auth.isDemoMode),
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
