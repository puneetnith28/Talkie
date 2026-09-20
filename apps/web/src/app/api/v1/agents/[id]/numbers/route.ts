import { NextRequest, NextResponse } from 'next/server';
import { NumberService, AgentService } from '@talkie/database';
import { z } from 'zod';

const attachSchema = z.object({
  numberId: z.string().min(1, 'Number ID is required'),
});

const detachSchema = z.object({
  numberId: z.string().min(1, 'Number ID is required'),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';

    const agent = await AgentService.getById(workspaceId, agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } },
        { status: 404 }
      );
    }

    const numbers = await NumberService.list(workspaceId, { agentId, status: 'active' });

    return NextResponse.json({
      success: true,
      data: numbers,
    });
  } catch (error: any) {
    console.error('Error fetching agent numbers:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';

    const body = await req.json();
    const parsed = attachSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0].message,
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const updatedNumber = await NumberService.attachToAgent(
      workspaceId,
      parsed.data.numberId,
      agentId
    );

    return NextResponse.json({
      success: true,
      data: updatedNumber,
    });
  } catch (error: any) {
    console.error('Error attaching number to agent:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';

    const body = await req.json().catch(() => ({}));
    const numberId = body.numberId || req.nextUrl.searchParams.get('numberId');

    if (!numberId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'numberId is required' } },
        { status: 400 }
      );
    }

    const updatedNumber = await NumberService.attachToAgent(
      workspaceId,
      numberId,
      null
    );

    return NextResponse.json({
      success: true,
      data: updatedNumber,
    });
  } catch (error: any) {
    console.error('Error detaching number from agent:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
