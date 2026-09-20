export type MessageChannel = 'sms' | 'mms' | 'whatsapp';
export type MessageDeliveryStatus = 'queued' | 'sending' | 'sent' | 'delivered' | 'undelivered' | 'failed';

export interface SendMessageOptions {
  from: string; // E.164 sender number
  to: string; // E.164 recipient number
  body: string;
  mediaUrls?: string[];
  channel?: MessageChannel;
  idempotencyKey?: string;
  statusCallbackUrl?: string;
}

export interface MessageResult {
  messageId: string;
  from: string;
  to: string;
  body: string;
  channel: MessageChannel;
  status: MessageDeliveryStatus;
  segmentCount: number;
  costCents: number;
  providerRef: string;
  createdAt: Date;
  error?: string;
}

export interface InboundMessage {
  messageId: string;
  from: string;
  to: string;
  body: string;
  mediaUrls?: string[];
  channel: MessageChannel;
  timestamp: Date;
  rawPayload?: Record<string, any>;
}

export interface DeliveryReceipt {
  messageId: string;
  status: MessageDeliveryStatus;
  timestamp: Date;
  errorCode?: string;
  errorMessage?: string;
}

export interface MessagingProvider {
  readonly name: string;

  /**
   * Send an outbound SMS or MMS
   */
  sendMessage(options: SendMessageOptions): Promise<MessageResult>;

  /**
   * Simulate or generate an inbound SMS into the platform
   */
  simulateInboundMessage(options: {
    from: string;
    to: string;
    body: string;
    mediaUrls?: string[];
  }): Promise<InboundMessage>;

  /**
   * Verify an incoming webhook signature from carrier/provider
   */
  verifyWebhookSignature(signature: string, payload: string, secret: string): boolean;
}
