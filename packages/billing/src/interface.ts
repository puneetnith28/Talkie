import type { CheckoutSessionOptions, CheckoutSessionResult, PortalSessionResult } from './types';

export interface BillingProvider {
  createCustomer(workspaceId: string, email: string, name?: string): Promise<{ customerId: string }>;
  createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResult>;
  createPortalSession(customerId: string, returnUrl: string): Promise<PortalSessionResult>;
  handleWebhook(payload: string | Buffer, signature: string): Promise<{ event: string; workspaceId?: string; amountCents?: number }>;
}
