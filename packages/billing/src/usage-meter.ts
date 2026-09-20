import { DEFAULT_PRICING_RATES, type PricingRateConfig, type UsageSummary } from './types';
import { prisma, UsageService } from '@talkie/database';

export class UsageMeter {
  private rates: PricingRateConfig;

  constructor(rates: PricingRateConfig = DEFAULT_PRICING_RATES) {
    this.rates = rates;
  }

  /**
   * Calculate cost in cents for a voice call duration (rounded up to nearest minute)
   */
  public calculateVoiceCallCost(durationSeconds: number): number {
    if (durationSeconds <= 0) return 0;
    const minutes = Math.ceil(durationSeconds / 60);
    const voiceCost = minutes * this.rates.voicePerMinuteCents;
    const sttCost = minutes * this.rates.sttPerMinuteCents;
    return Math.round(voiceCost + sttCost);
  }

  /**
   * Calculate cost in cents for SMS transmission (160 characters per segment)
   */
  public calculateSmsCost(messageLength: number): number {
    if (messageLength <= 0) return 0;
    const segments = Math.max(1, Math.ceil(messageLength / 160));
    return Math.round(segments * this.rates.smsPerSegmentCents);
  }

  /**
   * Calculate cost in cents for TTS character generation
   */
  public calculateTtsCost(characterCount: number): number {
    if (characterCount <= 0) return 0;
    const thousands = characterCount / 1000;
    return Math.round(thousands * this.rates.ttsPer1kCharsCents);
  }

  /**
   * Record and deduct usage against workspace balance
   */
  public async recordVoiceUsage(workspaceId: string, callId: string, durationSeconds: number): Promise<number> {
    const costCents = this.calculateVoiceCallCost(durationSeconds);
    const minutes = Math.ceil(durationSeconds / 60);

    await UsageService.recordUsage(workspaceId, {
      type: 'voice_minutes',
      quantity: minutes,
      unit: 'minutes',
      costCents,
      metadata: { callId },
    });

    return costCents;
  }

  /**
   * Record and deduct SMS usage against workspace balance
   */
  public async recordSmsUsage(workspaceId: string, messageId: string, textLength: number): Promise<number> {
    const costCents = this.calculateSmsCost(textLength);

    await UsageService.recordUsage(workspaceId, {
      type: 'sms_messages',
      quantity: 1,
      unit: 'messages',
      costCents,
      metadata: { messageId },
    });

    return costCents;
  }

  /**
   * Get complete itemized usage summary for the workspace
   */
  public async getWorkspaceUsageSummary(workspaceId: string): Promise<UsageSummary> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const records = await prisma.usageRecord.findMany({
      where: {
        workspaceId,
        timestamp: { gte: periodStart },
      },
    });

    let voiceMinutes = 0;
    let voiceCostCents = 0;
    let smsCount = 0;
    let smsCostCents = 0;

    for (const record of records) {
      if (record.type === 'voice_minutes') {
        voiceMinutes += record.quantity;
        voiceCostCents += record.costCents;
      } else if (record.type === 'sms_messages') {
        smsCount += record.quantity;
        smsCostCents += record.costCents;
      }
    }

    const phoneNumbersCount = await prisma.phoneNumber.count({
      where: { workspaceId, status: 'active' },
    });
    const phoneNumbersCostCents = phoneNumbersCount * this.rates.phoneNumberMonthlyCents;

    const totalCostCents = voiceCostCents + smsCostCents + phoneNumbersCostCents;

    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { balanceCents: true },
    });
    const currentBalanceCents = ws?.balanceCents ?? 0;

    return {
      workspaceId,
      periodStart,
      periodEnd: now,
      voiceMinutes,
      voiceCostCents,
      smsCount,
      smsCostCents,
      phoneNumbersCount,
      phoneNumbersCostCents,
      totalCostCents,
      currentBalanceCents,
    };
  }
}
