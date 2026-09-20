import { NextRequest, NextResponse } from 'next/server';
import { MockBillingProvider } from '@talkie/billing';
import { z } from 'zod';

const billingProvider = new MockBillingProvider();

const checkoutSchema = z.object({
  amountCents: z.number().int().min(500, 'Minimum top-up is $5.00 (500 cents)'),
});

export async function POST(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';
    const body = await req.json();

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    const session = await billingProvider.createCheckoutSession({
      workspaceId,
      amountCents: parsed.data.amountCents,
      successUrl: `${origin}/dashboard/usage?status=success`,
      cancelUrl: `${origin}/dashboard/usage?status=cancelled`,
    });

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
