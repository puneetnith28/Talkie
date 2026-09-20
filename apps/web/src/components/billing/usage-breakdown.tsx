'use client';

import React from 'react';
import { Card, Badge } from '@talkie/ui';
import { PhoneCall, MessageSquare, Phone, Sparkles, Activity, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface UsageSummaryData {
  voiceMinutes: number;
  voiceCostCents: number;
  smsCount: number;
  smsCostCents: number;
  phoneNumbersCount: number;
  phoneNumbersCostCents: number;
  totalCostCents: number;
  currentBalanceCents: number;
}

interface UsageRecordItem {
  id: string;
  type: string;
  quantity: number;
  unit: string;
  costCents: number;
  metadataJson?: string | null;
  timestamp: string;
}

interface UsageBreakdownProps {
  summary: UsageSummaryData;
  recentRecords: UsageRecordItem[];
}

export function UsageBreakdown({ summary, recentRecords }: UsageBreakdownProps) {
  const total = Math.max(summary.totalCostCents, 1);
  const voicePercent = Math.round((summary.voiceCostCents / total) * 100);
  const smsPercent = Math.round((summary.smsCostCents / total) * 100);
  const numbersPercent = Math.round((summary.phoneNumbersCostCents / total) * 100);

  return (
    <div className="space-y-6">
      {/* Spend Breakdown Bar */}
      <Card className="p-6 bg-[#0a0c10] border-white/[0.08] shadow-xl">
        <h3 className="text-base font-semibold text-white mb-1">Month-to-Date Spend Distribution</h3>
        <p className="text-xs text-neutral-400 mb-4">
          Itemized consumption breakdown across voice pipelines, messaging segments, and virtual numbers.
        </p>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 rounded-full bg-neutral-900 overflow-hidden flex mb-4 border border-white/[0.06]">
          <div
            style={{ width: `${voicePercent}%` }}
            className="bg-blue-500 transition-all duration-500"
            title={`Voice: ${voicePercent}%`}
          />
          <div
            style={{ width: `${smsPercent}%` }}
            className="bg-purple-500 transition-all duration-500"
            title={`SMS: ${smsPercent}%`}
          />
          <div
            style={{ width: `${numbersPercent}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Numbers: ${numbersPercent}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Voice Calls ({summary.voiceMinutes} mins)</div>
              <div className="text-sm font-bold text-white font-mono">${(summary.voiceCostCents / 100).toFixed(2)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">SMS Outbound ({summary.smsCount} msgs)</div>
              <div className="text-sm font-bold text-white font-mono">${(summary.smsCostCents / 100).toFixed(2)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Numbers ({summary.phoneNumbersCount} active)</div>
              <div className="text-sm font-bold text-white font-mono">${(summary.phoneNumbersCostCents / 100).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing Rate Matrix */}
      <Card className="p-6 bg-[#0a0c10] border-white/[0.08] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Transparent Utility Pricing</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Pay-as-you-go rates billed accurately down to the millisecond.</p>
          </div>
          <Badge variant="neutral" className="text-[10px] font-mono">
            Direct Tier 1
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-xs text-neutral-400 mb-1">AI Voice Call</div>
            <div className="text-lg font-bold text-white font-mono">
              $0.05 <span className="text-xs font-normal text-neutral-500">/ min</span>
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">Includes STT + TTS</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-xs text-neutral-400 mb-1">SMS Message</div>
            <div className="text-lg font-bold text-white font-mono">
              $0.015 <span className="text-xs font-normal text-neutral-500">/ segment</span>
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">160 characters</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-xs text-neutral-400 mb-1">Phone Number</div>
            <div className="text-lg font-bold text-white font-mono">
              $2.00 <span className="text-xs font-normal text-neutral-500">/ mo</span>
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">US/Canada local</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-xs text-neutral-400 mb-1">LLM Inference</div>
            <div className="text-lg font-bold text-white flex items-center gap-1.5">
              <span>Included</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">Ultra-low latency</div>
          </div>
        </div>
      </Card>

      {/* Itemized Usage Ledger */}
      <Card className="bg-[#0a0c10] border-white/[0.08] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Itemized Usage & Credit Ledger</h3>
            <p className="text-xs text-neutral-400">Detailed record of service consumption and balance additions.</p>
          </div>
          <Badge variant="neutral" className="text-[10px] font-mono">
            {recentRecords.length} Records
          </Badge>
        </div>

        {recentRecords.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-xs">
            No consumption or top-up records logged for this workspace yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Activity Type</th>
                  <th className="py-3 px-4">Quantity / Units</th>
                  <th className="py-3 px-4 text-right">Debit / Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentRecords.map((r) => {
                  const isTopup = r.type === 'topup' || r.costCents < 0;
                  const dateStr = new Date(r.timestamp).toLocaleString();

                  return (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-neutral-400 font-mono">
                        {dateStr}
                      </td>

                      <td className="py-3 px-4 font-medium text-white capitalize">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                              isTopup
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {isTopup ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          </div>
                          <span>{r.type.replace(/_/g, ' ')}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-300 font-mono">
                        {r.quantity} {r.unit}
                      </td>

                      <td className={`py-3 px-4 text-right font-mono font-semibold ${isTopup ? 'text-emerald-400' : 'text-neutral-200'}`}>
                        {isTopup
                          ? `+$${(Math.abs(r.costCents) / 100).toFixed(2)}`
                          : `-$${(Math.abs(r.costCents) / 100).toFixed(2)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
