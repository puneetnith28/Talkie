import { NextRequest, NextResponse } from 'next/server';
import {
  NumberService,
  ContactService,
  MessageService,
  AgentService,
  UsageService,
  WebhookService,
} from '@talkie/database';
import { MockMessagingProvider } from '@talkie/telephony';

const messagingProvider = new MockMessagingProvider();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let bodyJson: Record<string, any> = {};

    try {
      bodyJson = JSON.parse(rawBody);
    } catch {
      // In case of URL encoded form from legacy carrier
      const searchParams = new URLSearchParams(rawBody);
      bodyJson = Object.fromEntries(searchParams.entries());
    }

    const from = bodyJson.From || bodyJson.from;
    const to = bodyJson.To || bodyJson.to;
    const body = bodyJson.Body || bodyJson.body || '';
    const mediaUrl = bodyJson.MediaUrl0 || bodyJson.mediaUrl;
    const mediaUrls = mediaUrl ? [mediaUrl] : [];

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PAYLOAD', message: 'From and To are required' } },
        { status: 400 }
      );
    }

    // Optional webhook signature verification
    const signature = req.headers.get('x-talkie-signature') || req.headers.get('x-twilio-signature');
    const secret = process.env.TELEPHONY_WEBHOOK_SECRET || 'talkie_mock_webhook_secret';
    if (signature && !messagingProvider.verifyWebhookSignature(signature, rawBody, secret)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid webhook signature' } },
        { status: 401 }
      );
    }

    // Lookup destination phone number
    const phoneNumber = await NumberService.getByPhoneNumber(to);
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Destination number ${to} not registered` } },
        { status: 404 }
      );
    }

    const workspaceId = phoneNumber.workspaceId;

    // Resolve or create contact for sender
    let contact = await ContactService.getByPhoneNumber(workspaceId, from);
    if (!contact) {
      contact = await ContactService.create(workspaceId, {
        phoneNumber: from,
        name: `Inbound Contact (${from})`,
      });
    }

    // Create inbound message and thread
    const inboundMessage = await MessageService.createMessage(workspaceId, {
      phoneNumberId: phoneNumber.id,
      contactId: contact.id,
      agentId: phoneNumber.agentId || undefined,
      channel: mediaUrls.length > 0 ? 'mms' : 'sms',
      direction: 'inbound',
      senderNumber: from,
      recipientNumber: to,
      body,
      mediaUrls,
      providerMessageId: bodyJson.MessageSid || `in_${Date.now()}`,
      status: 'delivered',
    });

    // Record incoming usage record
    await UsageService.recordUsage(workspaceId, {
      type: 'sms',
      quantity: 1,
      costCents: 1,
      description: `Inbound SMS from ${from}`,
    });

    // Webhook event dispatch for workspace subscribers
    await WebhookService.queueEvent(workspaceId, 'message.received', {
      messageId: inboundMessage.id,
      from,
      to,
      body,
      contactId: contact.id,
      conversationId: inboundMessage.conversationId,
    });

    // Optional auto-reply if agent is assigned
    let autoReplyMessage = null;
    if (phoneNumber.agentId) {
      const agent = await AgentService.getById(workspaceId, phoneNumber.agentId);
      if (agent && agent.status === 'active') {
        const replyText = `Thanks for reaching out! This is ${agent.name}. How can I help you today?`;
        
        const dispatchResult = await messagingProvider.sendMessage({
          from: to,
          to: from,
          body: replyText,
        });

        autoReplyMessage = await MessageService.createMessage(workspaceId, {
          phoneNumberId: phoneNumber.id,
          contactId: contact.id,
          agentId: agent.id,
          channel: 'sms',
          direction: 'outbound',
          senderNumber: to,
          recipientNumber: from,
          body: replyText,
          providerMessageId: dispatchResult.messageId,
          status: 'sent',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        inbound: inboundMessage,
        autoReply: autoReplyMessage,
      },
    });
  } catch (error: any) {
    console.error('Error handling inbound webhook:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message || 'Internal error' } },
      { status: 500 }
    );
  }
}
