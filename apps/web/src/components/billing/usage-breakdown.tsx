'use client';

import React from 'react';

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

interface UsageBreakdownProps {
  summary: UsageSummaryData;
  recentRecords: any[];
}

export function UsageBreakdown({ summary, recentRecords }: UsageBreakdownProps) {
  const total = Math.max(summary.totalCostCents, 1);
  const voicePercent = Math.round((summary.voiceCostCents / total) * 100);
  const smsPercent = Math.round((summary.smsCostCents / total) * 100);
  const numbersPercent = Math.round((summary.phoneNumbersCostCents / total) * 100);

  return (
    <div className="space-y-6">
      {/* Spend Breakdown Bar */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-base font-semibold text-white mb-2">Month-to-Date Spend Distribution</h3>
        <p className="text-xs text-zinc-400 mb-4">Itemized breakdown across voice minutes, messaging units, and active phone lines.</p>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden flex mb-4">
          <div style={{ width: `${voicePercent}%` }} className="bg-blue-500 transition-all duration-500" title={`Voice: ${voicePercent}%`} />
          <div style={{ width: `${smsPercent}%` }} className="bg-purple-500 transition-all duration-500" title={`SMS: ${smsPercent}%`} />
          <div style={{ width: `${numbersPercent}%` }} className="bg-emerald-500 transition-all duration-500" title={`Numbers: ${numbersPercent}%`} />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
            <div>
              <div className="text-xs text-zinc-400">Voice Calls ({summary.voiceMinutes} mins)</div>
              <div className="text-sm font-bold text-white">${(summary.voiceCostCents / 100).toFixed(2)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
            <div>
              <div className="text-xs text-zinc-400">SMS Outbound ({summary.smsCount} msgs)</div>
              <div className="text-sm font-bold text-white">${(summary.smsCostCents / 100).toFixed(2)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <div className="text-xs text-zinc-400">Numbers ({summary.phoneNumbersCount} active)</div>
              <div className="text-sm font-bold text-white">${(summary.phoneNumbersCostCents / 100).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Rate Matrix */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-base font-semibold text-white mb-2">Transparent Pricing Matrix</h3>
        <p className="text-xs text-zinc-400 mb-4">Pay-as-you-go utility rates billed in real-time down to the millisecond and segment.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="text-xs text-zinc-400 mb-1">AI Voice Call</div>
            <div className="text-lg font-bold text-white">$0.05 <span className="text-xs font-normal text-zinc-500">/ min</span></div>
            <div className="text-[11px] text-zinc-500 mt-1">Includes STT & TTS</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="text-xs text-zinc-400 mb-1">SMS Message</div>
            <div className="text-lg font-bold text-white">$0.015 <span className="text-xs font-normal text-zinc-500">/ segment</span></div>
            <div className="text-[11px] text-zinc-500 mt-1">160 characters</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="text-xs text-zinc-400 mb-1">Phone Number</div>
            <div className="text-lg font-bold text-white">$2.00 <span className="text-xs font-normal text-zinc-500">/ mo</span></div>
            <div className="text-[11px] text-zinc-500 mt-1">US/Canada local</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="text-xs text-zinc-400 mb-1">LLM Inference</div>
            <div className="text-lg font-bold text-white">Included <span className="text-xs font-normal text-emerald-400">✓</span></div>
            <div className="text-[11px] text-zinc-500 mt-1">Ultra-low latency</div>
          </div>
        </div>
      </div>

      {/* Transaction & Usage Ledger */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-base font-semibold text-white mb-2">Recent Usage Ledger</h3>
        <p className="text-xs text-zinc-400 mb-4">Audit log of consumed resources and charge deductions.</p>

        {recentRecords.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            No consumption recorded for this period yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {recentRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-2.5 px-3 text-zinc-300 font-mono">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white capitalize">
                      {r.metric.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400">
                      {r.quantity} {r.metric.includes('minute') ? 'mins' : 'units'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-red-400">
                      -${(r.costCents / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
