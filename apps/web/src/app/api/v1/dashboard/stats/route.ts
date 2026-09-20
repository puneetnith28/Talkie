import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@talkie/database';

export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';

    const [
      agentCount,
      numberCount,
      totalCalls,
      totalMessages,
      workspace,
      recentCalls,
      recentMessages,
    ] = await Promise.all([
      prisma.agent.count({ where: { workspaceId } }),
      prisma.phoneNumber.count({ where: { workspaceId, status: 'active' } }),
      prisma.call.count({ where: { workspaceId } }),
      prisma.message.count({ where: { conversation: { workspaceId } } }),
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true, balanceCents: true },
      }),
      prisma.call.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { agent: true },
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
        subtitle: `Agent: ${c.agent?.name || 'Unassigned'} • Status: ${c.status}`,
        timestamp: c.createdAt,
      })),
      ...recentMessages.map((m) => ({
        id: m.id,
        type: 'message',
        title: `${m.direction === 'inbound' ? 'SMS received from' : 'SMS sent to'} ${m.direction === 'inbound' ? m.senderNumber : m.recipientNumber}`,
        subtitle: m.body.slice(0, 50) + (m.body.length > 50 ? '...' : ''),
        timestamp: m.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

    return NextResponse.json({
      success: true,
      data: {
        workspaceName: workspace?.name || 'My Workspace',
        balanceCents: workspace?.balanceCents ?? 5000,
        agentCount,
        numberCount,
        totalCalls,
        totalMessages,
        recentActivities,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
