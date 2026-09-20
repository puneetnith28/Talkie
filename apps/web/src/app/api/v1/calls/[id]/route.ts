import { NextRequest, NextResponse } from 'next/server';
import { CallService } from '@talkie/database';
import { getAuthenticatedSession } from '@/lib/auth/session';
import { z } from 'zod';

const updateCallSchema = z.object({
  status: z.string().optional(),
  summary: z.string().optional(),
  durationSeconds: z.number().optional(),
  recordingUrl: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession(req);
    const { id } = await params;

    const call = await CallService.getCallById(session.workspaceId, id);
    if (!call) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Call ${id} not found.` } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: call,
    });
  } catch (error: any) {
    console.error(`Error fetching call details:`, error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession(req);
    const { id } = await params;
    const body = await req.json();

    const parsed = updateCallSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const updated = await CallService.updateCall(session.workspaceId, id, parsed.data);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error(`Error updating call:`, error);
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
