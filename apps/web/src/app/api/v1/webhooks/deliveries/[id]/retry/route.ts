import { NextRequest, NextResponse } from 'next/server';
import { prisma, WebhookService } from '@talkie/database';
import { WebhookDispatcher } from '@talkie/webhook-engine';
import { getAuthenticatedSession } from '@/lib/auth/session';

const dispatcher = new WebhookDispatcher();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deliveryId } = await params;
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;

    const delivery = await prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { webhook: true },
    });

    if (!delivery || delivery.webhook.workspaceId !== workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Delivery record not found' } },
        { status: 404 }
      );
    }

    let payload: any = {};
    try {
      payload = JSON.parse(delivery.payloadJson);
    } catch {
      payload = { event: delivery.event, data: {} };
    }

    const nextAttempt = delivery.attempt + 1;
    const result = await dispatcher.dispatch(
      {
        id: delivery.webhook.id,
        workspaceId,
        url: delivery.webhook.url,
        secret: delivery.webhook.secret,
        events: JSON.parse(delivery.webhook.eventsJson || '["*"]'),
        status: delivery.webhook.status as any,
      },
      payload,
      nextAttempt
    );

    const updatedDelivery = await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        statusCode: result.statusCode,
        responseBody: result.responseBody,
        latencyMs: result.latencyMs,
        attempt: nextAttempt,
        status: result.status === 'success' ? 'success' : result.status === 'retrying' ? 'retrying' : 'failed',
        nextRetryAt: result.nextRetryAt,
      },
    });

    await prisma.webhook.update({
      where: { id: delivery.webhook.id },
      data: { lastDeliveryAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: {
        delivery: updatedDelivery,
        attempt: result,
      },
    });
  } catch (error: any) {
    console.error('Error retrying webhook delivery:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
