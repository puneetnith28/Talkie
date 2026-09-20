import type { BillingProvider } from './interface';
import type { CheckoutSessionOptions, CheckoutSessionResult, PortalSessionResult } from './types';

export class MockBillingProvider implements BillingProvider {
  async createCustomer(workspaceId: string, email: string, name?: string): Promise<{ customerId: string }> {
    return {
      customerId: `cus_mock_${workspaceId.slice(-8)}`,
    };
  }

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult> {
    const sessionId = `cs_mock_${Date.now()}`;
    return {
      sessionId,
      checkoutUrl: `${options.successUrl}?session_id=${sessionId}&amount=${options.amountCents}`,
    };
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<PortalSessionResult> {
    return {
      portalUrl: `${returnUrl}?portal_session=active&customer=${customerId}`,
    };
  }

  async handleWebhook(payload: string | Buffer, signature: string): Promise<{ event: string; workspaceId?: string; amountCents?: number }> {
    return {
      event: 'payment_intent.succeeded',
      workspaceId: 'ws_default_talkie_01',
      amountCents: 5000,
    };
  }
}
