import { NextRequest } from 'next/server';
import { CallService } from '@talkie/database';
import { getAuthenticatedSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession(req);
    const { id: callId } = await params;

    const call = await CallService.getCallById(session.workspaceId, callId);
    if (!call) {
      return new Response(JSON.stringify({ error: 'Call not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Initial state payload
        controller.enqueue(
          encoder.encode(`event: call_state\ndata: ${JSON.stringify({ status: call.status, duration: call.durationSeconds })}\n\n`)
        );

        // Send existing transcripts
        if (call.transcripts && call.transcripts.length > 0) {
          for (const turn of call.transcripts) {
            controller.enqueue(
              encoder.encode(`event: transcript_turn\ndata: ${JSON.stringify(turn)}\n\n`)
            );
          }
        }

        // Send summary if ready
        if (call.summary) {
          controller.enqueue(
            encoder.encode(`event: summary_ready\ndata: ${JSON.stringify({ summary: call.summary })}\n\n`)
          );
        }

        // Heartbeat / ping
        const pingInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: ping\n\n`));
          } catch {
            clearInterval(pingInterval);
          }
        }, 15000);

        req.signal.addEventListener('abort', () => {
          clearInterval(pingInterval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
