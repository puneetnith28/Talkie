import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { syncClerkUser, deleteClerkUser } from '@/lib/auth/clerk-sync';

/**
 * Verify Svix / Clerk webhook signature.
 */
function verifyClerkWebhookSignature(
  payload: string,
  headers: { svixId: string | null; svixTimestamp: string | null; svixSignature: string | null },
  secret: string
): boolean {
  if (!headers.svixId || !headers.svixTimestamp || !headers.svixSignature) {
    return false;
  }

  // Check timestamp drift (5 minute tolerance)
  const timestamp = parseInt(headers.svixTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return false;
  }

  try {
    // Secret can be prefixed with whsec_
    const cleanSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const secretBuffer = Buffer.from(cleanSecret, 'base64');

    const signedContent = `${headers.svixId}.${headers.svixTimestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', secretBuffer)
      .update(signedContent)
      .digest('base64');

    // svix-signature header format: v1,<sig> or v1,<sig> v0,<sig>
    const signatures = headers.svixSignature.split(' ').map((sig) => {
      const parts = sig.split(',');
      return parts.length === 2 ? parts[1] : sig;
    });

    return signatures.some((sig) => {
      const sigBuffer = Buffer.from(sig, 'utf-8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
      if (sigBuffer.length !== expectedBuffer.length) return false;
      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    });
  } catch (err) {
    console.error('Clerk webhook signature verification error:', err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    // Verify signature if secret is configured and not default placeholder
    if (webhookSecret && !webhookSecret.includes('your_clerk')) {
      const isValid = verifyClerkWebhookSignature(
        rawBody,
        { svixId, svixTimestamp, svixSignature },
        webhookSecret
      );

      if (!isValid) {
        return NextResponse.json(
          { error: { code: 'INVALID_SIGNATURE', message: 'Clerk webhook signature verification failed' } },
          { status: 400 }
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.type;
    const data = event.data;

    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        const primaryEmailObj = data.email_addresses?.find(
          (e: any) => e.id === data.primary_email_address_id
        ) || data.email_addresses?.[0];

        const email = primaryEmailObj?.email_address;
        if (!email) {
          return NextResponse.json(
            { error: { code: 'MISSING_EMAIL', message: 'User event missing primary email' } },
            { status: 400 }
          );
        }

        const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username || null;

        await syncClerkUser({
          clerkUserId: data.id,
          email,
          name: fullName,
          imageUrl: data.image_url,
        });

        return NextResponse.json({
          success: true,
          event: eventType,
          userId: data.id,
        });
      }

      case 'user.deleted': {
        if (data.id) {
          await deleteClerkUser(data.id);
        }
        return NextResponse.json({
          success: true,
          event: eventType,
          userId: data.id,
        });
      }

      default:
        // Acknowledge unhandled event types cleanly
        return NextResponse.json({
          success: true,
          message: `Unhandled event type: ${eventType}`,
        });
    }
  } catch (error: any) {
    console.error('Error handling Clerk webhook:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to process Clerk webhook' } },
      { status: 500 }
    );
  }
}
