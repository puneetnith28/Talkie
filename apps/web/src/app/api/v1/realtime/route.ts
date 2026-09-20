import { NextRequest } from 'next/server';
import { realtimePubSub } from '@/lib/realtime/pubsub';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const workspaceId = req.headers.get('x-workspace-id') || req.nextUrl.searchParams.get('workspaceId') || 'ws_default_talkie_01';

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connect message
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected', workspaceId })}\n\n`)
      );

      // Subscribe to workspace pubsub
      unsubscribe = realtimePubSub.subscribe(workspaceId, (msg) => {
        try {
          const payload = `event: ${msg.eventName}\ndata: ${JSON.stringify(msg.data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
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
