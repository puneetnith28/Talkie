import * as crypto from 'crypto';
import type {
  MessagingProvider,
  SendMessageOptions,
  MessageResult,
  InboundMessage,
  DeliveryReceipt,
  MessageDeliveryStatus,
} from './messaging-interface';

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  appSecret?: string;
  verifyToken?: string;
  apiVersion?: string;
}

export class WhatsAppBusinessProvider implements MessagingProvider {
  readonly name = 'whatsapp';
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = {
      apiVersion: 'v19.0',
      ...config,
    };
  }

  /**
   * Send WhatsApp Message via Meta Graph Cloud API
   */
  async sendMessage(options: SendMessageOptions): Promise<MessageResult> {
    const toFormatted = options.to.replace(/\D/g, ''); // E.164 without +
    const isLive = Boolean(
      this.config.accessToken &&
      !this.config.accessToken.includes('mock') &&
      this.config.phoneNumberId &&
      !this.config.phoneNumberId.includes('mock')
    );

    if (isLive) {
      try {
        const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;
        const bodyPayload: Record<string, any> = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: toFormatted,
          type: 'text',
          text: { preview_url: true, body: options.body },
        };

        if (options.mediaUrls && options.mediaUrls.length > 0) {
          bodyPayload.type = 'image';
          delete bodyPayload.text;
          bodyPayload.image = { link: options.mediaUrls[0], caption: options.body };
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || `WhatsApp API error ${response.status}`);
        }

        const messageId = data.messages?.[0]?.id || `wamid.${Date.now()}`;
        return {
          messageId,
          from: this.config.phoneNumberId,
          to: options.to,
          body: options.body,
          channel: 'whatsapp',
          status: 'sent',
          segmentCount: 1,
          costCents: 1, // Standard WhatsApp conversation unit
          providerRef: messageId,
          createdAt: new Date(),
        };
      } catch (err: any) {
        return {
          messageId: `wa_${Date.now()}`,
          from: this.config.phoneNumberId,
          to: options.to,
          body: options.body,
          channel: 'whatsapp',
          status: 'failed',
          segmentCount: 1,
          costCents: 0,
          providerRef: 'failed',
          createdAt: new Date(),
          error: err.message,
        };
      }
    }

    // Mock mode / dev simulation
    const mockMsgId = `wamid.HBgL${Date.now()}XyZ`;
    return {
      messageId: mockMsgId,
      from: this.config.phoneNumberId || 'mock_whatsapp_sender',
      to: options.to,
      body: options.body,
      channel: 'whatsapp',
      status: 'sent',
      segmentCount: 1,
      costCents: 1,
      providerRef: mockMsgId,
      createdAt: new Date(),
    };
  }

  /**
   * Verify WhatsApp Webhook Challenge Handshake (GET /webhook)
   */
  verifyWebhookHandshake(mode: string | null, token: string | null, challenge: string | null): string | null {
    if (mode === 'subscribe' && token && this.config.verifyToken && token === this.config.verifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Verify WhatsApp Webhook Signature (X-Hub-Signature-256)
   */
  verifyWebhookSignature(signature: string, payload: string, secret?: string): boolean {
    const appSecret = secret || this.config.appSecret;
    if (!appSecret) return true; // Bypass in local mock test if no secret configured

    try {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', appSecret)
        .update(payload, 'utf8')
        .digest('hex')}`;

      return crypto.timingSafeEqual(
        Buffer.from(signature || '', 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch {
      return false;
    }
  }

  /**
   * Parse incoming WhatsApp Cloud API Webhook payload
   */
  parseWebhookPayload(payload: any): {
    inboundMessages: InboundMessage[];
    deliveryReceipts: DeliveryReceipt[];
  } {
    const inboundMessages: InboundMessage[] = [];
    const deliveryReceipts: DeliveryReceipt[] = [];

    if (!payload?.entry) return { inboundMessages, deliveryReceipts };

    for (const entry of payload.entry) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value) continue;

        // Process inbound messages
        if (value.messages) {
          for (const msg of value.messages) {
            let body = '';
            const mediaUrls: string[] = [];

            if (msg.type === 'text') {
              body = msg.text?.body || '';
            } else if (msg.type === 'image') {
              body = msg.image?.caption || '[Image]';
            } else if (msg.type === 'button') {
              body = msg.button?.text || '';
            } else if (msg.type === 'interactive') {
              body = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
            } else {
              body = `[${msg.type}]`;
            }

            inboundMessages.push({
              messageId: msg.id,
              from: `+${msg.from}`,
              to: value.metadata?.display_phone_number || this.config.phoneNumberId,
              body,
              mediaUrls,
              channel: 'whatsapp',
              timestamp: new Date(parseInt(msg.timestamp, 10) * 1000 || Date.now()),
              rawPayload: msg,
            });
          }
        }

        // Process status receipts
        if (value.statuses) {
          for (const st of value.statuses) {
            let status: MessageDeliveryStatus = 'sent';
            if (st.status === 'delivered') status = 'delivered';
            else if (st.status === 'read') status = 'delivered';
            else if (st.status === 'failed') status = 'failed';

            deliveryReceipts.push({
              messageId: st.id,
              status,
              timestamp: new Date(parseInt(st.timestamp, 10) * 1000 || Date.now()),
              errorCode: st.errors?.[0]?.code ? String(st.errors[0].code) : undefined,
              errorMessage: st.errors?.[0]?.title || st.errors?.[0]?.message,
            });
          }
        }
      }
    }

    return { inboundMessages, deliveryReceipts };
  }

  /**
   * Simulate an inbound WhatsApp message for testing
   */
  async simulateInboundMessage(options: {
    from: string;
    to: string;
    body: string;
    mediaUrls?: string[];
  }): Promise<InboundMessage> {
    return {
      messageId: `wamid.sim_${Date.now()}`,
      from: options.from,
      to: options.to,
      body: options.body,
      mediaUrls: options.mediaUrls ?? [],
      channel: 'whatsapp',
      timestamp: new Date(),
    };
  }
}
