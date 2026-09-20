export interface PricingRateConfig {
  phoneNumberMonthlyCents: number; // e.g. 200 ($2.00)
  voicePerMinuteCents: number;      // e.g. 5 ($0.05)
  smsPerSegmentCents: number;       // e.g. 1.5 ($0.015)
  ttsPer1kCharsCents: number;       // e.g. 1.5 ($0.015)
  sttPerMinuteCents: number;        // e.g. 0.5 ($0.005)
}

export const DEFAULT_PRICING_RATES: PricingRateConfig = {
  phoneNumberMonthlyCents: 200,
  voicePerMinuteCents: 5,
  smsPerSegmentCents: 1.5,
  ttsPer1kCharsCents: 1.5,
  sttPerMinuteCents: 0.5,
};

export interface UsageSummary {
  workspaceId: string;
  periodStart: Date;
  periodEnd: Date;
  voiceMinutes: number;
  voiceCostCents: number;
  smsCount: number;
  smsCostCents: number;
  phoneNumbersCount: number;
  phoneNumbersCostCents: number;
  totalCostCents: number;
  currentBalanceCents: number;
}

export interface CheckoutSessionOptions {
  workspaceId: string;
  amountCents: number;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
}

export interface PortalSessionResult {
  portalUrl: string;
}
