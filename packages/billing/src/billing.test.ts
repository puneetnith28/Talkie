import { describe, it, expect, beforeAll } from 'vitest';
import { UsageMeter, MockBillingProvider } from './index';
import { WorkspaceService } from '@talkie/database';

describe('@talkie/billing (Usage Metering & Billing Abstraction)', () => {
  let meter: UsageMeter;
  let billingProvider: MockBillingProvider;
  let workspaceId: string;

  beforeAll(async () => {
    meter = new UsageMeter();
    billingProvider = new MockBillingProvider();

    const ws = await WorkspaceService.create({
      name: 'Billing Test Workspace',
      slug: `billing-test-${Date.now()}`,
    });
    workspaceId = ws.id;
  });

  it('calculates voice call duration cost with ceil minute rounding', () => {
    // 45 seconds -> 1 minute -> 5 cents voice + 0.5 cents STT = 6 cents (rounded)
    const cost45s = meter.calculateVoiceCallCost(45);
    expect(cost45s).toBe(6);

    // 130 seconds -> 3 minutes -> 3 * 5.5 = 16.5 -> 17 cents
    const cost130s = meter.calculateVoiceCallCost(130);
    expect(cost130s).toBe(17);
  });

  it('calculates SMS cost per 160-char segment', () => {
    // 50 chars -> 1 segment -> 1.5 cents -> 2 cents rounded
    expect(meter.calculateSmsCost(50)).toBe(2);

    // 320 chars -> 2 segments -> 3 cents
    expect(meter.calculateSmsCost(320)).toBe(3);
  });

  it('records voice and SMS usage and computes workspace usage summary', async () => {
    await meter.recordVoiceUsage(workspaceId, 'call_test_1', 120);
    await meter.recordSmsUsage(workspaceId, 'msg_test_1', 80);

    const summary = await meter.getWorkspaceUsageSummary(workspaceId);
    expect(summary.workspaceId).toBe(workspaceId);
    expect(summary.voiceMinutes).toBeGreaterThanOrEqual(2);
    expect(summary.smsCount).toBeGreaterThanOrEqual(1);
    expect(summary.totalCostCents).toBeGreaterThan(0);
  });

  it('creates checkout session and portal link via billing provider', async () => {
    const session = await billingProvider.createCheckoutSession({
      workspaceId,
      amountCents: 2500,
      successUrl: 'http://localhost:3000/dashboard/usage?success=true',
      cancelUrl: 'http://localhost:3000/dashboard/usage?cancelled=true',
    });

    expect(session.sessionId).toContain('cs_mock_');
    expect(session.checkoutUrl).toContain('amount=2500');
  });
});
