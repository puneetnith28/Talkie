import { NextRequest, NextResponse } from 'next/server';
import {
  MessageService,
  NumberService,
  ContactService,
  UsageService,
  IdempotencyService,
} from '@talkie/database';
import { MockMessagingProvider } from '@talkie/telephony';
import { z } from 'zod';

const createMessageSchema = z.object({
  from: z.string().min(1, 'Sender number (from) is required'),
  to: z.string().min(1, 'Recipient number (to) is required'),
  body: z.string().min(1, 'Message body is required'),
  mediaUrls: z.array(z.string()).optional(),
  channel: z.enum(['sms', 'mms', 'whatsapp']).optional().default('sms'),
  agentId: z.string().optional(),
});

const messagingProvider = new MockMessagingProvider();

export async function POST(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';
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

    // Verify sender phone number belongs to this workspace
    const senderPhoneNumber = await NumberService.getByPhoneNumber(from);
    if (!senderPhoneNumber || senderPhoneNumber.workspaceId !== workspaceId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Sender phone number ${from} does not belong to this workspace`,
          },
        },
        { status: 403 }
      );
    }

    // Resolve or auto-create contact
    let contact = await ContactService.getByPhoneNumber(workspaceId, to);
    if (!contact) {
      contact = await ContactService.create(workspaceId, {
        phoneNumber: to,
        name: `Contact (${to})`,
      });
    }

    // Dispatch message via telephony provider
    const dispatchResult = await messagingProvider.sendMessage({
      from,
      to,
      body: textBody,
      mediaUrls,
      channel,
    });

    // Store message record and update conversation thread
    const message = await MessageService.createMessage(workspaceId, {
      phoneNumberId: senderPhoneNumber.id,
      contactId: contact.id,
      agentId: agentId || senderPhoneNumber.agentId || undefined,
      channel,
      direction: 'outbound',
      senderNumber: from,
      recipientNumber: to,
      body: textBody,
      mediaUrls,
      providerMessageId: dispatchResult.messageId,
      status: dispatchResult.status === 'undelivered' ? 'failed' : dispatchResult.status,
    });

    // Record usage billing (e.g. 1 cent per segment)
    await UsageService.recordUsage(workspaceId, {
      type: 'sms',
      quantity: dispatchResult.segmentCount,
      costCents: dispatchResult.costCents,
      description: `Outbound SMS to ${to} (${dispatchResult.segmentCount} segments)`,
    });

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
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
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
