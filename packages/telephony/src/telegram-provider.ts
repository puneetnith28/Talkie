import type {
  MessagingProvider,
  SendMessageOptions,
  MessageResult,
  InboundMessage,
  DeliveryReceipt,
} from './messaging-interface';

export interface TelegramConfig {
  botToken: string;
  botUsername?: string;
  secretToken?: string;
  webhookUrl?: string;
}

export class TelegramBotProvider implements MessagingProvider {
  readonly name = 'telegram';
  private config: TelegramConfig;

  constructor(config: TelegramConfig) {
    this.config = config;
  }

  /**
   * Test Bot Token validity and fetch Bot profile
   */
  async getMe(): Promise<{ id: number; is_bot: boolean; first_name: string; username?: string }> {
    const isLive = Boolean(this.config.botToken && !this.config.botToken.includes('mock'));
    if (isLive) {
      const res = await fetch(`https://api.telegram.org/bot${this.config.botToken}/getMe`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.description || `Telegram Bot API Error ${res.status}`);
      }
      return data.result;
    }

    return {
      id: 987654321,
      is_bot: true,
      first_name: 'Talkie AI Bot',
      username: this.config.botUsername || 'TalkieAiBot',
    };
  }

  /**
   * Register Webhook with Telegram Bot API
   */
  async setWebhook(webhookUrl: string, secretToken?: string): Promise<boolean> {
    const isLive = Boolean(this.config.botToken && !this.config.botToken.includes('mock'));
    if (isLive) {
      const res = await fetch(`https://api.telegram.org/bot${this.config.botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secretToken || this.config.secretToken,
          allowed_updates: ['message', 'edited_message', 'callback_query'],
        }),
      });
      const data = await res.json();
      return Boolean(data.ok);
    }
    return true;
  }

  /**
   * Remove Webhook from Telegram Bot API
   */
  async deleteWebhook(): Promise<boolean> {
    const isLive = Boolean(this.config.botToken && !this.config.botToken.includes('mock'));
    if (isLive) {
      const res = await fetch(`https://api.telegram.org/bot${this.config.botToken}/deleteWebhook`);
      const data = await res.json();
      return Boolean(data.ok);
    }
    return true;
  }

  /**
   * Send message to a Telegram chat
   */
  async sendMessage(options: SendMessageOptions): Promise<MessageResult> {
    const chatId = options.to.replace(/^tg_/, '').replace(/^\+/, '');
    const isLive = Boolean(this.config.botToken && !this.config.botToken.includes('mock'));

    if (isLive) {
      try {
        let endpoint = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
        let payload: Record<string, any> = {
          chat_id: chatId,
          text: options.body,
          parse_mode: 'HTML',
        };

        if (options.mediaUrls && options.mediaUrls.length > 0) {
          endpoint = `https://api.telegram.org/bot${this.config.botToken}/sendPhoto`;
          payload = {
            chat_id: chatId,
            photo: options.mediaUrls[0],
            caption: options.body,
            parse_mode: 'HTML',
          };
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.description || `Telegram error ${res.status}`);
        }

        const messageId = String(data.result?.message_id || Date.now());
        return {
          messageId,
          from: this.config.botUsername ? `@${this.config.botUsername}` : 'TalkieBot',
          to: options.to,
          body: options.body,
          channel: 'telegram' as any,
          status: 'delivered',
          segmentCount: 1,
          costCents: 1,
          providerRef: messageId,
          createdAt: new Date(),
        };
      } catch (err: any) {
        return {
          messageId: `tg_${Date.now()}`,
          from: this.config.botUsername || 'TalkieBot',
          to: options.to,
          body: options.body,
          channel: 'telegram' as any,
          status: 'failed',
          segmentCount: 1,
          costCents: 0,
          providerRef: 'failed',
          createdAt: new Date(),
          error: err.message,
        };
      }
    }

    // Mock dev simulation
    const mockId = `tg_msg_${Date.now()}`;
    return {
      messageId: mockId,
      from: this.config.botUsername ? `@${this.config.botUsername}` : 'TalkieBot',
      to: options.to,
      body: options.body,
      channel: 'telegram' as any,
      status: 'delivered',
      segmentCount: 1,
      costCents: 1,
      providerRef: mockId,
      createdAt: new Date(),
    };
  }

  /**
   * Verify Telegram Webhook Secret Token Header (X-Telegram-Bot-Api-Secret-Token)
   */
  verifyWebhookSignature(signature: string, payload: string, secret?: string): boolean {
    const expectedSecret = secret || this.config.secretToken;
    if (!expectedSecret) return true; // No secret configured in dev mode
    return signature === expectedSecret;
  }

  /**
   * Parse incoming Telegram Update webhook payload
   */
  parseUpdate(update: any): InboundMessage | null {
    const msg = update?.message || update?.edited_message || update?.channel_post;
    if (!msg) return null;

    const fromUser = msg.from;
    const chatId = String(msg.chat?.id || fromUser?.id || '');
    const username = fromUser?.username || '';
    const name = [fromUser?.first_name, fromUser?.last_name].filter(Boolean).join(' ') || username || 'Telegram User';

    let body = msg.text || msg.caption || '';
    const mediaUrls: string[] = [];

    if (!body && msg.photo) body = '[Photo]';
    if (!body && msg.voice) body = '[Voice Message]';
    if (!body && msg.document) body = `[Document: ${msg.document.file_name || 'file'}]`;

    return {
      messageId: String(msg.message_id),
      from: chatId,
      to: this.config.botUsername ? `@${this.config.botUsername}` : 'TalkieBot',
      body: body || '[Telegram Update]',
      mediaUrls,
      channel: 'telegram' as any,
      timestamp: new Date(msg.date ? msg.date * 1000 : Date.now()),
      rawPayload: {
        ...update,
        senderName: name,
        senderUsername: username,
      },
    };
  }

  /**
   * Simulate inbound Telegram message
   */
  async simulateInboundMessage(options: {
    from: string;
    to: string;
    body: string;
    mediaUrls?: string[];
  }): Promise<InboundMessage> {
    return {
      messageId: `tg_sim_${Date.now()}`,
      from: options.from,
      to: options.to,
      body: options.body,
      mediaUrls: options.mediaUrls ?? [],
      channel: 'telegram' as any,
      timestamp: new Date(),
    };
  }
}
