import { describe, it, expect, beforeAll } from 'vitest';
import { WorkspaceService, WebhookService } from '@talkie/database';
import { WebhookDispatcher, WebhookEventBuilder, WebhookSigner } from '@talkie/webhook-engine';

describe('Phase 6 Checkpoint: Webhooks, Dispatcher & HMAC Verification', () => {
  let workspaceId: string;
  let webhook: any;

  beforeAll(async () => {
    const ws = await WorkspaceService.create({
      name: 'Webhooks Integration Test Workspace',
      slug: `wh-test-${Date.now()}`,
    });
    workspaceId = ws.id;

    webhook = await WebhookService.createWebhook(workspaceId, {
      url: 'https://webhook.site/test-endpoint',
      events: ['call.started', 'call.ended', 'message.received'],
    });
  });

  it('Step 1: Generates valid webhook subscription with cryptographically secure secret', async () => {
    expect(webhook).toBeDefined();
    expect(webhook.id).toBeDefined();
    expect(webhook.secret).toMatch(/^whsec_/);
    expect(webhook.status).toBe('active');

    const list = await WebhookService.listWebhooks(workspaceId);
    expect(list.some((w) => w.id === webhook.id)).toBe(true);
  });

  it('Step 2: Dispatches signed payload and logs successful delivery attempt', async () => {
    let capturedSignature = '';
    let capturedBody = '';

    const mockFetch: typeof fetch = async (url, init) => {
      capturedSignature = (init?.headers as Record<string, string>)['X-Talkie-Signature'];
      capturedBody = init?.body as string;
      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    };

    const dispatcher = new WebhookDispatcher({ fetchFn: mockFetch });
    const event = WebhookEventBuilder.createEvent(workspaceId, 'call.started', {
      callId: 'call_live_777',
      from: '+14155550100',
      to: '+14155550199',
    });

    const result = await dispatcher.dispatch(
      {
        id: webhook.id,
        workspaceId,
        url: webhook.url,
        secret: webhook.secret,
        events: ['call.started'],
        status: 'active',
      },
      event
    );

    expect(result.status).toBe('success');
    expect(result.statusCode).toBe(200);

    // Verify HMAC signature
    const isValid = WebhookSigner.verify(capturedBody, capturedSignature, webhook.secret);
    expect(isValid).toBe(true);

    // Record delivery
    const delivery = await WebhookService.recordDelivery(webhook.id, {
      event: event.event,
      payload: event,
      statusCode: result.statusCode,
      latencyMs: result.latencyMs,
      attempt: 1,
      status: 'success',
    });

    expect(delivery).toBeDefined();
    expect(delivery.statusCode).toBe(200);

    const logs = await WebhookService.getWebhookDeliveries(webhook.id);
    expect(logs.length).toBeGreaterThan(0);
  });

  it('Step 3: Queues and broadcasts events to all subscribed webhooks in workspace', async () => {
    const deliveries = await WebhookService.queueEvent(workspaceId, 'call.ended', {
      callId: 'call_live_777',
      durationSeconds: 90,
    });

    expect(deliveries.length).toBeGreaterThan(0);
    expect(deliveries[0].event).toBe('call.ended');
  });
});
