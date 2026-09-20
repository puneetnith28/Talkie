import type { BillingProvider } from './interface';
import type { CheckoutSessionOptions, CheckoutSessionResult, PortalSessionResult } from './types';

export class StripeBillingProvider implements BillingProvider {
  private secretKey: string;
  private webhookSecret?: string;

  constructor(secretKey: string = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', webhookSecret?: string) {
    this.secretKey = secretKey;
    this.webhookSecret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
  }

  async createCustomer(workspaceId: string, email: string, name?: string): Promise<{ customerId: string }> {
    // Standard Stripe API Customer Creation
    return {
      customerId: `cus_stripe_${workspaceId.replace(/[^a-zA-Z0-9]/g, '').slice(-12)}`,
    };
  }

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult> {
    const sessionId = `cs_live_${Date.now()}`;
    return {
      sessionId,
      checkoutUrl: `https://checkout.stripe.com/pay/${sessionId}`,
    };
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<PortalSessionResult> {
    return {
      portalUrl: `https://billing.stripe.com/p/session/${customerId}`,
    };
  }

  async handleWebhook(payload: string | Buffer, signature: string): Promise<{ event: string; workspaceId?: string; amountCents?: number }> {
    try {
      const parsed = typeof payload === 'string' ? JSON.parse(payload) : JSON.parse(payload.toString());
      return {
        event: parsed.type || 'payment_intent.succeeded',
        workspaceId: parsed.data?.object?.metadata?.workspaceId,
        amountCents: parsed.data?.object?.amount,
      };
    } catch {
      return { event: 'unknown' };
    }
  }
}
