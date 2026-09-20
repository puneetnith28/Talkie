import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';
import { WhatsAppBusinessProvider } from './whatsapp-provider';

describe('WhatsAppBusinessProvider', () => {
  const secret = 'test_wa_secret_12345';
  const provider = new WhatsAppBusinessProvider({
    phoneNumberId: '10987654321',
    accessToken: 'mock_token',
    appSecret: secret,
    verifyToken: 'my_verify_token',
  });

  it('verifies webhook handshake challenge properly', () => {
    const challenge = 'test_challenge_12345';
    const result = provider.verifyWebhookHandshake('subscribe', 'my_verify_token', challenge);
    expect(result).toBe(challenge);

    const invalid = provider.verifyWebhookHandshake('subscribe', 'wrong_token', challenge);
    expect(invalid).toBeNull();
  });

  it('verifies HMAC-SHA256 signatures accurately', () => {
    const payload = JSON.stringify({ entry: [{ id: '123' }] });
    const signature = `sha256=${crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex')}`;

    expect(provider.verifyWebhookSignature(signature, payload)).toBe(true);
    expect(provider.verifyWebhookSignature('sha256=invalid', payload)).toBe(false);
  });

  it('parses incoming WhatsApp Cloud API webhook message payload', () => {
    const webhookPayload = {
      entry: [
        {
          changes: [
            {
              value: {
                metadata: {
                  display_phone_number: '+15550001111',
                  phone_number_id: '10987654321',
                },
                messages: [
                  {
                    from: '14155552671',
                    id: 'wamid.HBgLMjU=',
                    timestamp: '1700000000',
                    text: { body: 'Hello Talkie WhatsApp AI!' },
                    type: 'text',
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const { inboundMessages } = provider.parseWebhookPayload(webhookPayload);
    expect(inboundMessages.length).toBe(1);
    expect(inboundMessages[0].from).toBe('+14155552671');
    expect(inboundMessages[0].body).toBe('Hello Talkie WhatsApp AI!');
    expect(inboundMessages[0].channel).toBe('whatsapp');
  });

  it('sends WhatsApp message and returns valid message receipt', async () => {
    const res = await provider.sendMessage({
      from: '10987654321',
      to: '+14155550199',
      body: 'Hello from Talkie WhatsApp test',
    });

    expect(res.channel).toBe('whatsapp');
    expect(res.status).toBe('sent');
    expect(res.to).toBe('+14155550199');
  });
});
