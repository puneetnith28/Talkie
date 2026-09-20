import { describe, it, expect } from 'vitest';
import { TelegramBotProvider } from './telegram-provider';

describe('TelegramBotProvider', () => {
  const provider = new TelegramBotProvider({
    botToken: 'mock_bot_12345:ABCdefGHI',
    botUsername: 'TalkieBot',
    secretToken: 'secret_token_xyz',
  });

  it('fetches bot profile in mock mode', async () => {
    const me = await provider.getMe();
    expect(me.is_bot).toBe(true);
    expect(me.username).toBe('TalkieBot');
  });

  it('verifies webhook secret token header correctly', () => {
    expect(provider.verifyWebhookSignature('secret_token_xyz', '')).toBe(true);
    expect(provider.verifyWebhookSignature('wrong_secret', '')).toBe(false);
  });

  it('parses incoming Telegram message update into normalized InboundMessage', () => {
    const update = {
      update_id: 1001,
      message: {
        message_id: 42,
        from: {
          id: 555666777,
          first_name: 'John',
          last_name: 'Doe',
          username: 'johndoe',
        },
        chat: {
          id: 555666777,
          type: 'private',
        },
        date: 1700000000,
        text: 'Hello from Telegram client!',
      },
    };

    const parsed = provider.parseUpdate(update);
    expect(parsed).not.toBeNull();
    expect(parsed?.from).toBe('555666777');
    expect(parsed?.to).toBe('@TalkieBot');
    expect(parsed?.body).toBe('Hello from Telegram client!');
    expect(parsed?.channel).toBe('telegram');
  });

  it('sends message via Telegram Bot provider', async () => {
    const res = await provider.sendMessage({
      from: '@TalkieBot',
      to: '555666777',
      body: 'Response from Talkie AI',
    });

    expect(res.channel).toBe('telegram');
    expect(res.status).toBe('delivered');
    expect(res.to).toBe('555666777');
  });
});
