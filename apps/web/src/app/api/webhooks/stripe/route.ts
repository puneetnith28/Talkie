import { NextRequest, NextResponse } from 'next/server';
import { StripeBillingProvider } from '@talkie/billing';
import { AuditService } from '@talkie/database';

const stripeProvider = new StripeBillingProvider();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    const { event, workspaceId, amountCents } = await stripeProvider.handleWebhook(rawBody, signature);

    if (event === 'payment_intent.succeeded' && workspaceId) {
      // Record audit log for credit addition
      await AuditService.log(workspaceId, {
        userId: 'stripe_system',
        action: 'billing.credit_added',
        resourceType: 'billing',
        resourceId: `pay_${Date.now()}`,
        metadata: {
          amountCents: amountCents || 0,
          provider: 'stripe',
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Stripe Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }
}
