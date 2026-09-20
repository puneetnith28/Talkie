import { NextRequest, NextResponse } from 'next/server';
import { CallManager } from '@/lib/voice/call-manager';
import { z } from 'zod';

const controlSchema = z.object({
  action: z.enum(['hangup', 'speak', 'interrupt', 'mute']),
  text: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: callId } = await params;
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';
    const body = await req.json();

    const parsed = controlSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { action, text } = parsed.data;

    if (action === 'hangup') {
      const result = await CallManager.hangupCall(workspaceId, callId);
      return NextResponse.json({ success: true, data: result });
    }

    const session = CallManager.getActiveSession(callId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'SESSION_NOT_FOUND', message: 'No active voice session found for call' } },
        { status: 404 }
      );
    }

    if (action === 'speak' && text) {
      await session.speak(text);
      return NextResponse.json({ success: true, data: { action: 'speak', text } });
    }

    if (action === 'interrupt') {
      session.tts.cancel();
      if (session.getState() === 'speaking') {
        session.stateMachine.transition('interrupted');
      }
      return NextResponse.json({ success: true, data: { action: 'interrupted' } });
    }

    return NextResponse.json({ success: true, data: { action } });
  } catch (error: any) {
    console.error('Error in call control:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
