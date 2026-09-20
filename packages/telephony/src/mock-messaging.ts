import { createHmac } from 'crypto';
import type {
  MessagingProvider,
  SendMessageOptions,
  MessageResult,
  InboundMessage,
  DeliveryReceipt,
} from './messaging-interface';

export class MockMessagingProvider implements MessagingProvider {
  readonly name = 'mock-messaging';

  private sentMessages: MessageResult[] = [];
  private deliveryListeners: ((receipt: DeliveryReceipt) => void)[] = [];

  /**
   * Send an outbound message
   */
  async sendMessage(options: SendMessageOptions): Promise<MessageResult> {
    if (!options.to || !options.from || !options.body) {
      throw new Error('Invalid message parameters: to, from, and body are required');
    }

    // Calculate segment count based on standard GSM 160-char rules
    const segmentCount = Math.max(1, Math.ceil(options.body.length / 160));
    const costCents = segmentCount * 1; // 1 cent per segment in mock

    const messageResult: MessageResult = {
      messageId: `msg_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      from: options.from,
      to: options.to,
      body: options.body,
      channel: options.channel || 'sms',
      status: 'sent',
      segmentCount,
      costCents,
      providerRef: `mock_ref_${Date.now()}`,
      createdAt: new Date(),
    };

    this.sentMessages.push(messageResult);

    // Simulate async transition to delivered
    setTimeout(() => {
      messageResult.status = 'delivered';
      const receipt: DeliveryReceipt = {
        messageId: messageResult.messageId,
        status: 'delivered',
        timestamp: new Date(),
      };
      this.deliveryListeners.forEach((listener) => listener(receipt));
    }, 10);

    return messageResult;
  }

  /**
   * Simulate an inbound incoming SMS
   */
  async simulateInboundMessage(options: {
    from: string;
    to: string;
    body: string;
    mediaUrls?: string[];
  }): Promise<InboundMessage> {
    return {
      messageId: `in_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      from: options.from,
      to: options.to,
      body: options.body,
      mediaUrls: options.mediaUrls || [],
      channel: options.mediaUrls && options.mediaUrls.length > 0 ? 'mms' : 'sms',
      timestamp: new Date(),
      rawPayload: {
        From: options.from,
        To: options.to,
        Body: options.body,
        NumMedia: (options.mediaUrls?.length || 0).toString(),
      },
    };
  }

  /**
   * Register a delivery status listener
   */
  onDeliveryStatus(listener: (receipt: DeliveryReceipt) => void) {
    this.deliveryListeners.push(listener);
    return () => {
      this.deliveryListeners = this.deliveryListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Verify an HMAC signature for simulated or real webhooks
   */
  verifyWebhookSignature(signature: string, payload: string, secret: string): boolean {
    if (!signature || !payload || !secret) return false;
    const computed = createHmac('sha256', secret).update(payload).digest('hex');
    return computed === signature;
  }

  /**
   * Get all mock sent messages
   */
  getSentMessages() {
    return [...this.sentMessages];
  }

  /**
   * Clear sent message store
   */
  clear() {
    this.sentMessages = [];
  }
}
