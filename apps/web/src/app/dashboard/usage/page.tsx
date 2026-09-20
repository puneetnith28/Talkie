'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@talkie/ui';
import { TopUpModal } from '@/components/billing/top-up-modal';
import { UsageBreakdown } from '@/components/billing/usage-breakdown';

export default function UsagePage() {
  const [data, setData] = useState<{ summary: any; recentRecords: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/v1/billing/usage');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load usage summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Usage & Billing</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time balance, consumption analytics, itemized ledger, and automated payment settings.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowTopUpModal(true)} className="shadow-lg shadow-blue-500/20">
          + Add Funds
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-zinc-500 font-mono">Loading usage and billing ledger...</div>
      ) : data ? (
        <>
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-zinc-900 to-zinc-900 border border-blue-500/30">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
                Available Credits
              </div>
              <div className="text-3xl font-extrabold text-white">
                ${(data.summary.currentBalanceCents / 100).toFixed(2)}
              </div>
              <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Auto-recharge disabled
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Month-to-Date Spend
              </div>
              <div className="text-3xl font-extrabold text-white">
                ${(data.summary.totalCostCents / 100).toFixed(2)}
              </div>
              <div className="text-xs text-zinc-500 mt-2">
                Billing cycle ends in {30 - new Date().getDate()} days
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Voice Minutes Used
              </div>
              <div className="text-3xl font-extrabold text-white">
                {data.summary.voiceMinutes} <span className="text-sm font-normal text-zinc-500">mins</span>
              </div>
              <div className="text-xs text-zinc-500 mt-2">
                Across {data.summary.phoneNumbersCount} active phone lines
              </div>
            </div>
          </div>

          {/* Breakdown & Rate Cards */}
          <UsageBreakdown summary={data.summary} recentRecords={data.recentRecords} />
        </>
      ) : (
        <div className="p-12 text-center text-red-400">Failed to load billing information.</div>
      )}

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSuccess={fetchUsage}
      />
    </div>
  );
}
