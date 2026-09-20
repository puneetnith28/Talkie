import { NextRequest, NextResponse } from 'next/server';
import {
  MessageService,
  NumberService,
  ContactService,
  UsageService,
  IdempotencyService,
  ChannelAccountService,
} from '@talkie/database';
import {
  MockMessagingProvider,
  WhatsAppBusinessProvider,
  TelegramBotProvider,
} from '@talkie/telephony';
import { getAuthenticatedSession } from '@/lib/auth/session';
import { z } from 'zod';

const createMessageSchema = z.object({
  from: z.string().min(1, 'Sender identifier (from) is required'),
  to: z.string().min(1, 'Recipient identifier (to) is required'),
  body: z.string().min(1, 'Message body is required'),
  mediaUrls: z.array(z.string()).optional(),
  channel: z.enum(['sms', 'mms', 'whatsapp', 'telegram']).optional().default('sms'),
  agentId: z.string().optional(),
});

const smsMessagingProvider = new MockMessagingProvider();

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;
    const idempotencyKey = req.headers.get('idempotency-key') || req.headers.get('x-idempotency-key');

    const body = await req.json();

    // Check Idempotency
    if (idempotencyKey) {
      const cached = await IdempotencyService.check(workspaceId, idempotencyKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached.responseJson), {
          status: cached.statusCode,
          headers: { 'X-Cache-Lookup': 'HIT' },
        });
      }
    }

    const parsed = createMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0].message,
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { from, to, body: textBody, mediaUrls, channel, agentId } = parsed.data;

    let senderPhoneNumberId: string | undefined = undefined;
    let channelAccountId: string | undefined = undefined;
    let dispatchResult: any;

    if (channel === 'whatsapp') {
      // Find WhatsApp channel account
      const waAccounts = await ChannelAccountService.listAccounts(workspaceId, 'whatsapp');
      const account = waAccounts.length > 0 ? await ChannelAccountService.getAccountWithCredentials(workspaceId, waAccounts[0].id) : null;
      channelAccountId = account?.id;

      const provider = new WhatsAppBusinessProvider({
        phoneNumberId: from,
        accessToken: account?.credentials?.accessToken || 'mock_token',
        appSecret: account?.credentials?.appSecret,
      });

      dispatchResult = await provider.sendMessage({
        from,
        to,
        body: textBody,
        mediaUrls,
        channel: 'whatsapp',
      });
    } else if (channel === 'telegram') {
      // Find Telegram channel account
      const tgAccounts = await ChannelAccountService.listAccounts(workspaceId, 'telegram');
      const account = tgAccounts.length > 0 ? await ChannelAccountService.getAccountWithCredentials(workspaceId, tgAccounts[0].id) : null;
      channelAccountId = account?.id;

      const provider = new TelegramBotProvider({
        botToken: account?.credentials?.botToken || 'mock_token',
        botUsername: account?.credentials?.botUsername,
      });

      dispatchResult = await provider.sendMessage({
        from,
        to,
        body: textBody,
        mediaUrls,
        channel: 'telegram' as any,
      });
    } else {
      // SMS / MMS flow
      const senderPhoneNumber = await NumberService.getByPhoneNumber(from);
      if (senderPhoneNumber && senderPhoneNumber.workspaceId === workspaceId) {
        senderPhoneNumberId = senderPhoneNumber.id;
      }

      dispatchResult = await smsMessagingProvider.sendMessage({
        from,
        to,
        body: textBody,
        mediaUrls,
        channel,
      });
    }

    // Resolve or auto-create contact
    const contact = await ContactService.resolveOmnichannelContact(workspaceId, {
      channel,
      identifier: to,
    });

    // Store message record and update conversation thread
    const message = await MessageService.createMessage(workspaceId, {
      phoneNumberId: senderPhoneNumberId,
      channelAccountId,
      contactId: contact.id,
      agentId,
      channel,
      direction: 'outbound',
      senderNumber: from,
      recipientNumber: to,
      body: textBody,
      mediaUrls,
      providerMessageId: dispatchResult.messageId,
      status: dispatchResult.status === 'undelivered' ? 'failed' : dispatchResult.status,
    });

    // Record usage billing (1 cent per message)
    await UsageService.recordUsage(workspaceId, {
      type: 'sms',
      quantity: dispatchResult.segmentCount || 1,
      costCents: dispatchResult.costCents || 1,
      description: `Outbound ${channel.toUpperCase()} message to ${to}`,
    }).catch(() => {});

    const responsePayload = {
      success: true,
      data: message,
    };

    // Save idempotency key if provided
    if (idempotencyKey) {
      await IdempotencyService.save(
        workspaceId,
        idempotencyKey,
        '/api/v1/messages',
        200,
        responsePayload
      );
    }

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    console.error('Error sending outbound message:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message || 'Internal server error' },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const channel = searchParams.get('channel') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (conversationId) {
      const messages = await MessageService.getConversationMessages(
        workspaceId,
        conversationId,
        { limit, offset }
      );
      return NextResponse.json({ success: true, data: messages });
    }

    const conversations = await MessageService.listConversations(workspaceId, {
      channel,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error: any) {
    console.error('Error listing messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message || 'Internal server error' },
      },
      { status: 500 }
    );
  }
}
