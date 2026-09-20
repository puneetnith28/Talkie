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
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50);
    const type = searchParams.get('type') || 'all'; // 'all' | 'call' | 'message' | 'agent'

    const fetchCalls = type === 'all' || type === 'call';
    const fetchMessages = type === 'all' || type === 'message';
    const fetchAgents = type === 'all' || type === 'agent';

    const [calls, messages, agents] = await Promise.all([
      fetchCalls
        ? prisma.call.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
              agent: { select: { id: true, name: true } },
              phoneNumber: { select: { id: true, phoneNumber: true } },
            },
          })
        : Promise.resolve([]),
      fetchMessages
        ? prisma.message.findMany({
            where: { conversation: { workspaceId } },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
              conversation: {
                select: {
                  id: true,
                  channel: true,
                  contact: { select: { name: true, phoneNumber: true } },
                },
              },
            },
          })
        : Promise.resolve([]),
      fetchAgents
        ? prisma.agent.findMany({
            where: { workspaceId },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            select: {
              id: true,
              name: true,
              status: true,
              voice: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const unifiedActivities = [
      ...calls.map((c) => ({
        id: `call_${c.id}`,
        rawId: c.id,
        type: 'call' as const,
        direction: c.direction,
        status: c.status,
        title: `${c.direction === 'inbound' ? 'Inbound call from' : 'Outbound call to'} ${c.direction === 'inbound' ? c.fromNumber : c.toNumber}`,
        subtitle: `Agent: ${c.agent?.name || 'Unassigned'} • Duration: ${c.durationSeconds}s • Status: ${c.status}`,
        meta: {
          durationSeconds: c.durationSeconds,
          agentId: c.agentId,
          agentName: c.agent?.name,
          phoneNumber: c.phoneNumber?.phoneNumber,
          fromNumber: c.fromNumber,
          toNumber: c.toNumber,
        },
        timestamp: c.createdAt.toISOString(),
      })),
      ...messages.map((m) => ({
        id: `msg_${m.id}`,
        rawId: m.id,
        type: 'message' as const,
        direction: m.direction,
        status: m.status,
        channel: m.conversation?.channel || 'sms',
        title: `${m.direction === 'inbound' ? 'Message from' : 'Message to'} ${m.direction === 'inbound' ? m.senderNumber : m.recipientNumber}`,
        subtitle: m.body.length > 80 ? `${m.body.slice(0, 80)}...` : m.body,
        meta: {
          conversationId: m.conversationId,
          contactName: m.conversation?.contact?.name,
          channel: m.conversation?.channel || 'sms',
          senderNumber: m.senderNumber,
          recipientNumber: m.recipientNumber,
        },
        timestamp: m.createdAt.toISOString(),
      })),
      ...agents.map((a) => ({
        id: `agent_${a.id}`,
        rawId: a.id,
        type: 'agent' as const,
        status: a.status,
        title: `Agent updated: ${a.name}`,
        subtitle: `Voice: ${a.voice} • Status: ${a.status}`,
        meta: {
          agentId: a.id,
          agentName: a.name,
          voice: a.voice,
        },
        timestamp: a.updatedAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        workspaceId,
        activities: unifiedActivities,
        totalCount: unifiedActivities.length,
        hasMore: unifiedActivities.length === limit,
        isDemoMode: Boolean(auth.isDemoMode),
      },
    });
  } catch (error: any) {
    console.error('Error fetching activity stream:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to fetch activity stream' },
      },
      { status: 500 }
    );
  }
}
