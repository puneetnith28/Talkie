import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { MockTelephonyProvider, MockMessagingProvider } from './index';

describe('Telephony Provider & Mock Implementation', () => {
  const provider = new MockTelephonyProvider();

  it('should search available numbers with default settings', async () => {
    const results = await provider.searchNumbers({ areaCode: '415', limit: 5 });
    expect(results).toHaveLength(5);
    expect(results[0].phoneNumber.startsWith('+1415555')).toBe(true);
    expect(results[0].country).toBe('US');
    expect(results[0].capabilities.voice).toBe(true);
    expect(results[0].capabilities.sms).toBe(true);
  });

  it('should search Canadian numbers', async () => {
    const results = await provider.searchNumbers({ areaCode: '416', limit: 3 });
    expect(results).toHaveLength(3);
    expect(results[0].country).toBe('CA');
    expect(results[0].phoneNumber.startsWith('+1416555')).toBe(true);
  });

  it('should provision and release numbers successfully', async () => {
    const provision = await provider.provisionNumber('+14155550199');
    expect(provision.phoneNumber).toBe('+14155550199');
    expect(provision.status).toBe('active');
    expect(provision.providerNumberId.startsWith('mock_pn_')).toBe(true);

    const release = await provider.releaseNumber(provision.providerNumberId);
    expect(release.success).toBe(true);
  });
});

describe('Messaging Provider & Mock Messaging Implementation', () => {
  it('should send SMS message, compute segments, and transition to delivered', async () => {
    const messaging = new MockMessagingProvider();

    const res = await messaging.sendMessage({
      from: '+14155550100',
      to: '+14155550199',
      body: 'Hello from Talkie carrier test!',
    });

    expect(res.messageId).toMatch(/^msg_mock_/);
    expect(res.status).toBe('sent');
    expect(res.segmentCount).toBe(1);
    expect(res.costCents).toBe(1);
  });

  it('should simulate inbound SMS with raw carrier payload', async () => {
    const messaging = new MockMessagingProvider();

    const inbound = await messaging.simulateInboundMessage({
      from: '+14155550199',
      to: '+14155550100',
      body: 'I need help with my appointment.',
    });

    expect(inbound.messageId).toMatch(/^in_msg_/);
    expect(inbound.body).toBe('I need help with my appointment.');
    expect(inbound.rawPayload?.From).toBe('+14155550199');
  });

  it('should verify webhook signatures accurately', async () => {
    const messaging = new MockMessagingProvider();

    const secret = 'test_webhook_secret_key';
    const payload = JSON.stringify({ event: 'sms.received', id: '123' });
    const signature = createHmac('sha256', secret).update(payload).digest('hex');

    expect(messaging.verifyWebhookSignature(signature, payload, secret)).toBe(true);
    expect(messaging.verifyWebhookSignature('invalid_sig', payload, secret)).toBe(false);
  });
});
