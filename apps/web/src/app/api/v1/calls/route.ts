import { NextRequest, NextResponse } from 'next/server';
import { CallService } from '@talkie/database';
import { CallManager } from '@/lib/voice/call-manager';
import { getAuthenticatedSession } from '@/lib/auth/session';
import { z } from 'zod';

const createCallSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  from: z.string().min(1, 'Caller number (from) is required'),
  to: z.string().min(1, 'Recipient number (to) is required'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;
    const body = await req.json();

    const parsed = createCallSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 }
      );
    }

    const result = await CallManager.startOutboundCall({
      workspaceId,
      agentId: parsed.data.agentId,
      from: parsed.data.from,
      to: parsed.data.to,
    });

    return NextResponse.json({
      success: true,
      data: result.call,
    });
  } catch (error: any) {
    console.error('Error starting outbound call:', error);
    return NextResponse.json(
      { success: false, error: { code: 'CALL_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId') || undefined;
    const phoneNumberId = searchParams.get('phoneNumberId') || undefined;
    const contactId = searchParams.get('contactId') || undefined;
    const direction = searchParams.get('direction') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [calls, total] = await Promise.all([
      CallService.list(workspaceId, {
        agentId,
        phoneNumberId,
        contactId,
        direction: direction && direction !== 'all' ? direction : undefined,
        status: status && status !== 'all' ? status : undefined,
        search: search && search.trim() ? search.trim() : undefined,
        limit,
        offset,
      }),
      CallService.countCalls(workspaceId, {
        agentId,
        phoneNumberId,
        contactId,
        direction: direction && direction !== 'all' ? direction : undefined,
        status: status && status !== 'all' ? status : undefined,
        search: search && search.trim() ? search.trim() : undefined,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: calls,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + calls.length < total,
      },
    });
  } catch (error: any) {
    console.error('Error listing calls:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
