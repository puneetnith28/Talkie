import { describe, it, expect, beforeAll } from 'vitest';
import { WorkspaceService } from '@talkie/database';
import { UsageMeter, MockBillingProvider, StripeBillingProvider } from '@talkie/billing';

describe('Phase 7 Checkpoint: Usage Metering, Rates & Billing Integration', () => {
  let workspaceId: string;
  let usageMeter: UsageMeter;
  let mockBilling: MockBillingProvider;
  let stripeBilling: StripeBillingProvider;

  beforeAll(async () => {
    const ws = await WorkspaceService.create({
      name: 'Billing Integration Workspace',
      slug: `billing-e2e-${Date.now()}`,
    });
    workspaceId = ws.id;
    usageMeter = new UsageMeter();
    mockBilling = new MockBillingProvider();
    stripeBilling = new StripeBillingProvider();
  });

  it('Step 1: UsageMeter precisely calculates multi-metric voice & SMS costs', () => {
    // 60s voice = 1 min = 5.5 cents -> 6 cents rounded
    const call1m = usageMeter.calculateVoiceCallCost(60);
    expect(call1m).toBe(6);

    // 180s voice = 3 mins = 16.5 cents -> 17 cents rounded
    const call3m = usageMeter.calculateVoiceCallCost(180);
    expect(call3m).toBe(17);

    // SMS: 140 chars = 1 segment -> 2 cents rounded
    const sms1 = usageMeter.calculateSmsCost(140);
    expect(sms1).toBe(2);

    // SMS: 300 chars = 2 segments -> 3 cents
    const sms2 = usageMeter.calculateSmsCost(300);
    expect(sms2).toBe(3);
  });

  it('Step 2: Records usage records and aggregates workspace monthly summary', async () => {
    await usageMeter.recordVoiceUsage(workspaceId, 'call_e2e_1', 300); // 5 mins
    await usageMeter.recordSmsUsage(workspaceId, 'msg_e2e_1', 120);    // 1 msg

    const summary = await usageMeter.getWorkspaceUsageSummary(workspaceId);
    expect(summary.workspaceId).toBe(workspaceId);
    expect(summary.voiceMinutes).toBeGreaterThanOrEqual(5);
    expect(summary.smsCount).toBeGreaterThanOrEqual(1);
    expect(summary.totalCostCents).toBeGreaterThan(0);
    expect(summary.currentBalanceCents).toBeLessThanOrEqual(5000);
  });

  it('Step 3: Billing providers handle customer creation, checkout sessions, and webhook decoding', async () => {
    // Mock Billing Provider
    const customer = await mockBilling.createCustomer(workspaceId, 'billing@talkie.ai', 'Billing Admin');
    expect(customer.customerId).toContain('cus_mock_');

    const checkout = await mockBilling.createCheckoutSession({
      workspaceId,
      amountCents: 5000,
      successUrl: 'http://localhost:3000/dashboard/usage?status=success',
      cancelUrl: 'http://localhost:3000/dashboard/usage?status=cancelled',
    });
    expect(checkout.sessionId).toContain('cs_mock_');
    expect(checkout.checkoutUrl).toContain('amount=5000');

    // Stripe Provider Webhook simulation
    const webhookPayload = JSON.stringify({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          amount: 5000,
          metadata: { workspaceId },
        },
      },
    });

    const parsedWebhook = await stripeBilling.handleWebhook(webhookPayload, 'sig_test_123');
    expect(parsedWebhook.event).toBe('payment_intent.succeeded');
    expect(parsedWebhook.workspaceId).toBe(workspaceId);
    expect(parsedWebhook.amountCents).toBe(5000);
  });
});
