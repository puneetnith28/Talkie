import { NextRequest, NextResponse } from 'next/server';
import { CallService } from '@talkie/database';
import { CallManager } from '@/lib/voice/call-manager';
import { z } from 'zod';

const createCallSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  from: z.string().min(1, 'Caller number (from) is required'),
  to: z.string().min(1, 'Recipient number (to) is required'),
});

export async function POST(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';
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
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId') || undefined;
    const contactId = searchParams.get('contactId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const calls = await CallService.list(workspaceId, {
      agentId,
      contactId,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: calls,
    });
  } catch (error: any) {
    console.error('Error listing calls:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
