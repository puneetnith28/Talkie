import { NextRequest } from 'next/server';
import { realtimePubSub } from '@/lib/realtime/pubsub';
import { CallService } from '@talkie/database';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: callId } = await params;
  const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';

  // Verify call access
  const call = await CallService.getById(workspaceId, callId);
  if (!call) {
    return new Response(JSON.stringify({ error: 'Call not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Stream existing turns first
      for (const turn of call.transcripts) {
        controller.enqueue(
          encoder.encode(`event: transcript\ndata: ${JSON.stringify(turn)}\n\n`)
        );
      }

      // Subscribe to live turns
      unsubscribe = realtimePubSub.subscribeCallTranscript(callId, (turn) => {
        try {
          controller.enqueue(
            encoder.encode(`event: transcript\ndata: ${JSON.stringify(turn)}\n\n`)
          );
        } catch {
          // Closed stream
        }
      });
    },
    cancel() {
      if (unsubscribe) {
        unsubscribe();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
