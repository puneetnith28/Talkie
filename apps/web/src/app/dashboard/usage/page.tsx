'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Badge, TableSkeleton } from '@talkie/ui';
import {
  CreditCard,
  Plus,
  RefreshCw,
  PhoneCall,
  MessageSquare,
  DollarSign,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { TopUpModal } from '@/components/billing/top-up-modal';
import { UsageBreakdown } from '@/components/billing/usage-breakdown';

export default function UsagePage() {
  const [data, setData] = useState<{ summary: any; recentRecords: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const fetchUsage = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);

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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Usage & Billing</h1>
            {data && (
              <Badge variant="neutral" className="font-mono text-xs">
                Balance: ${(data.summary.currentBalanceCents / 100).toFixed(2)}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time balance, consumption telemetry, itemized ledger, and automated payment settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchUsage(true)}
            title="Refresh balance"
            disabled={refreshing}
            className="p-2 rounded-xl bg-black/40 border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.2] transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Button
            onClick={() => setShowTopUpModal(true)}
            className="h-9 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Funds
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
          <Card className="p-6 bg-[#0a0c10] border-white/[0.08]">
            <TableSkeleton rows={4} cols={4} />
          </Card>
        </div>
      ) : data ? (
        <>
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-[#0a0c10] border-emerald-500/30 flex items-center justify-between shadow-xl">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                  Available Credits
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">
                  ${(data.summary.currentBalanceCents / 100).toFixed(2)}
                </div>
                <div className="text-xs text-neutral-400 mt-2 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-recharge enabled
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-6 h-6" />
              </div>
            </Card>

            <Card className="p-5 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Month-to-Date Spend
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">
                  ${(data.summary.totalCostCents / 100).toFixed(2)}
                </div>
                <div className="text-xs text-neutral-500 mt-2 font-mono">
                  Billing cycle reset in {30 - new Date().getDate()} days
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </Card>

            <Card className="p-5 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Voice Minutes Used
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">
                  {data.summary.voiceMinutes} <span className="text-sm font-normal text-neutral-500">mins</span>
                </div>
                <div className="text-xs text-neutral-500 mt-2 font-mono">
                  Across {data.summary.phoneNumbersCount} active phone lines
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <PhoneCall className="w-6 h-6" />
              </div>
            </Card>
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
        onSuccess={() => fetchUsage(true)}
      />
    </div>
  );
}
