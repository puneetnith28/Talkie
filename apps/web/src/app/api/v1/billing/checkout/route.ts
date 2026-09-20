import { NextRequest, NextResponse } from 'next/server';
import { MockBillingProvider } from '@talkie/billing';
import { UsageService } from '@talkie/database';
import { getAuthenticatedSession } from '@/lib/auth/session';
import { z } from 'zod';

const billingProvider = new MockBillingProvider();

const checkoutSchema = z.object({
  amountCents: z.number().int().min(500, 'Minimum top-up is $5.00 (500 cents)'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;
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

    const checkoutSession = await billingProvider.createCheckoutSession({
      workspaceId,
      amountCents: parsed.data.amountCents,
      successUrl: `${origin}/dashboard/usage?status=success`,
      cancelUrl: `${origin}/dashboard/usage?status=cancelled`,
    });

    // In local/mock mode, automatically credit the balance
    const updatedWorkspace = await UsageService.topUpBalance(
      workspaceId,
      parsed.data.amountCents,
      `Credit top-up via checkout`
    );

    return NextResponse.json({
      success: true,
      data: {
        ...checkoutSession,
        newBalanceCents: updatedWorkspace.balanceCents,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
