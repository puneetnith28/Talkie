import { NextRequest, NextResponse } from 'next/server';
import { ChannelAccountService, ContactService, MessageService, UsageService } from '@talkie/database';
import { WhatsAppBusinessProvider } from '@talkie/telephony';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'talkie_wa_verify_token';
  const provider = new WhatsAppBusinessProvider({
    phoneNumberId: 'default',
    accessToken: 'default',
    verifyToken,
  });

  const verifiedChallenge = provider.verifyWebhookHandshake(mode, token, challenge);

  if (verifiedChallenge) {
    return new NextResponse(verifiedChallenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const signature = req.headers.get('x-hub-signature-256') || '';
    const phoneNumberId = payload?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

    let account = null;
    if (phoneNumberId) {
      account = await ChannelAccountService.findByIdentifier('whatsapp', phoneNumberId);
    }

    const provider = new WhatsAppBusinessProvider({
      phoneNumberId: phoneNumberId || 'default',
      accessToken: account ? (JSON.parse(account.credentialsJson).accessToken || '') : '',
      appSecret: account ? (JSON.parse(account.credentialsJson).appSecret || '') : process.env.WHATSAPP_APP_SECRET,
    });

    if (process.env.NODE_ENV === 'production' && !provider.verifyWebhookSignature(signature, rawBody)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { inboundMessages, deliveryReceipts } = provider.parseWebhookPayload(payload);

    if (account) {
      // 1. Process inbound messages
      for (const msg of inboundMessages) {
        const contact = await ContactService.resolveOmnichannelContact(account.workspaceId, {
          channel: 'whatsapp',
          identifier: msg.from,
        });

        await MessageService.createMessage(account.workspaceId, {
          channel: 'whatsapp',
          channelAccountId: account.id,
          contactId: contact.id,
          direction: 'inbound',
          senderNumber: msg.from,
          recipientNumber: msg.to,
          body: msg.body,
          mediaUrls: msg.mediaUrls,
          providerMessageId: msg.messageId,
          status: 'delivered',
        });

        // Record usage for inbound message
        await UsageService.recordUsage(account.workspaceId, {
          type: 'sms',
          quantity: 1,
          unit: 'messages',
          costCents: 1,
          metadata: { channel: 'whatsapp', messageId: msg.messageId },
        }).catch(() => {});
      }

      // 2. Process status receipts
      for (const receipt of deliveryReceipts) {
        // Status tracking
      }
    }

    return NextResponse.json({ success: true, processed: inboundMessages.length });
  } catch (error: any) {
    console.error('WhatsApp webhook processing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
