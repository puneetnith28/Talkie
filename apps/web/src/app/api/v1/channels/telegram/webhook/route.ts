import { NextRequest, NextResponse } from 'next/server';
import { ChannelAccountService, ContactService, MessageService, UsageService } from '@talkie/database';
import { TelegramBotProvider } from '@talkie/telephony';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let update: any = {};
    try {
      update = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const secretHeader = req.headers.get('x-telegram-bot-api-secret-token') || '';

    // Find bot account by secret token or by checking active accounts
    let account = null;
    const allAccounts = await ChannelAccountService.listAccounts('', 'telegram');
    for (const acc of allAccounts) {
      const fullAcc = await ChannelAccountService.getAccountWithCredentials(acc.workspaceId, acc.id);
      if (fullAcc?.credentials?.secretToken && fullAcc.credentials.secretToken === secretHeader) {
        account = fullAcc;
        break;
      }
    }

    if (!account && allAccounts.length > 0) {
      // Fallback in local development
      account = await ChannelAccountService.getAccountWithCredentials(allAccounts[0].workspaceId, allAccounts[0].id);
    }

    const provider = new TelegramBotProvider({
      botToken: account?.credentials?.botToken || 'mock_token',
      botUsername: account?.credentials?.botUsername,
      secretToken: account?.credentials?.secretToken,
    });

    if (process.env.NODE_ENV === 'production' && account?.credentials?.secretToken) {
      if (!provider.verifyWebhookSignature(secretHeader, rawBody)) {
        return NextResponse.json({ error: 'Invalid secret token' }, { status: 401 });
      }
    }

    const inbound = provider.parseUpdate(update);

    if (inbound && account) {
      const contact = await ContactService.resolveOmnichannelContact(account.workspaceId, {
        channel: 'telegram',
        identifier: inbound.from,
        name: inbound.rawPayload?.senderName,
        username: inbound.rawPayload?.senderUsername,
      });

      await MessageService.createMessage(account.workspaceId, {
        channel: 'telegram',
        channelAccountId: account.id,
        contactId: contact.id,
        direction: 'inbound',
        senderNumber: `tg_${inbound.from}`,
        recipientNumber: inbound.to,
        body: inbound.body,
        mediaUrls: inbound.mediaUrls,
        providerMessageId: inbound.messageId,
        status: 'delivered',
      });

      // Record billing usage record
      await UsageService.recordUsage(account.workspaceId, {
        type: 'sms',
        quantity: 1,
        unit: 'messages',
        costCents: 1,
        metadata: { channel: 'telegram', messageId: inbound.messageId },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, processed: Boolean(inbound) });
  } catch (error: any) {
    console.error('Telegram webhook processing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
