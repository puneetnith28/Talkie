import { describe, it, expect } from 'vitest';
import {
  WebhookEventBuilder,
  WebhookSigner,
  WebhookRetryManager,
  WebhookDispatcher,
} from './index';

describe('Webhook Engine: Events, Signing, Dispatcher & Retries', () => {
  const secret = 'whsec_test_secret_key_8899aabbcc';

  it('Step 1: Constructs and serializes typed webhook events', () => {
    const event = WebhookEventBuilder.createEvent('ws_123', 'call.started', {
      callId: 'call_999',
      callerNumber: '+14155550100',
    });

    expect(event.id).toMatch(/^evt_/);
    expect(event.event).toBe('call.started');
    expect(event.workspaceId).toBe('ws_123');
    expect(event.data.callId).toBe('call_999');

    const serialized = WebhookEventBuilder.serialize(event);
    expect(serialized).toContain('"event":"call.started"');
  });

  it('Step 2: Generates valid HMAC-SHA256 signatures and verifies accurately', () => {
    const payload = JSON.stringify({ message: 'hello world' });
    const { signature, timestamp } = WebhookSigner.sign(payload, secret);

    expect(signature).toContain(`t=${timestamp},v1=`);

    const isValid = WebhookSigner.verify(payload, signature, secret, 300);
    expect(isValid).toBe(true);

    const isInvalid = WebhookSigner.verify(payload, signature, 'wrong_secret', 300);
    expect(isInvalid).toBe(false);

    // Tampered payload fails
    const isTampered = WebhookSigner.verify(payload + 'tampered', signature, secret, 300);
    expect(isTampered).toBe(false);
  });

  it('Step 3: Handles exponential retry backoff and dead-letter classification', () => {
    const retryManager = new WebhookRetryManager({ maxAttempts: 3 });

    // 500 error on attempt 1 -> retryable
    const attempt1 = retryManager.getNextRetry(1, 500);
    expect(attempt1.shouldRetry).toBe(true);
    expect(attempt1.isDeadLetter).toBe(false);
    expect(attempt1.nextRetryAt).toBeDefined();

    // 404 client error -> dead-letter
    const attempt404 = retryManager.getNextRetry(1, 404);
    expect(attempt404.shouldRetry).toBe(false);
    expect(attempt404.isDeadLetter).toBe(true);

    // Max attempts exceeded -> dead-letter
    const attempt3 = retryManager.getNextRetry(3, 500);
    expect(attempt3.shouldRetry).toBe(false);
    expect(attempt3.isDeadLetter).toBe(true);
  });

  it('Step 4: Dispatches signed webhook to destination and captures response latency', async () => {
    const mockFetch: typeof fetch = async (url, init) => {
      const sig = (init?.headers as Record<string, string>)['X-Talkie-Signature'];
      expect(sig).toBeDefined();
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const dispatcher = new WebhookDispatcher({ fetchFn: mockFetch });
    const event = WebhookEventBuilder.createEvent('ws_123', 'message.received', {
      body: 'Hi there!',
    });

    const attempt = await dispatcher.dispatch(
      {
        id: 'wh_1',
        workspaceId: 'ws_123',
        url: 'https://example.com/webhook',
        secret,
        events: ['*'],
        status: 'active',
      },
      event
    );

    expect(attempt.status).toBe('success');
    expect(attempt.statusCode).toBe(200);
    expect(attempt.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
