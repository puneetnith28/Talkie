import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@talkie/database';
import { WebhookDispatcher, WebhookEventBuilder } from '@talkie/webhook-engine';
import { getAuthenticatedSession } from '@/lib/auth/session';

const dispatcher = new WebhookDispatcher();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: webhookId } = await params;
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;

    const webhook = await WebhookService.getWebhookById(workspaceId, webhookId);
    if (!webhook) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Webhook not found' } },
        { status: 404 }
      );
    }

    const testEvent = WebhookEventBuilder.createEvent(workspaceId, 'call.started', {
      callId: `call_test_${Date.now()}`,
      direction: 'inbound',
      from: '+14155550199',
      to: '+14155550100',
      timestamp: new Date().toISOString(),
      isTest: true,
    });

    const result = await dispatcher.dispatch(
      {
        id: webhook.id,
        workspaceId,
        url: webhook.url,
        secret: webhook.secret,
        events: JSON.parse(webhook.eventsJson || '["*"]'),
        status: webhook.status as any,
      },
      testEvent
    );

    // Save delivery attempt record
    const delivery = await WebhookService.recordDelivery(webhook.id, {
      event: testEvent.event,
      payload: testEvent,
      statusCode: result.statusCode,
      responseBody: result.responseBody,
      latencyMs: result.latencyMs,
      attempt: result.attempt,
      status: result.status === 'success' ? 'success' : 'failed',
    });

    return NextResponse.json({
      success: true,
      data: {
        delivery,
        attempt: result,
      },
    });
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
