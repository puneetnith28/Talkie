'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, StatsSkeleton } from '@talkie/ui';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Plus, Phone, Terminal, Key, Webhook, RefreshCw } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadStats(isManual = false) {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/v1/dashboard/stats');
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {stats ? stats.workspaceName : 'Workspace Overview'}
            </h1>
            <button
              type="button"
              onClick={() => loadStats(true)}
              disabled={refreshing}
              title="Refresh Telemetry"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time status of conversational AI agents, telephony routing, and omnichannel messaging.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/dashboard/agents" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Agent</span>
            </Button>
          </Link>
          <Link href="/dashboard/numbers" className="flex-1 sm:flex-initial">
            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Get Phone Number</span>
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <StatsSkeleton count={4} />
          <div className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.01] animate-pulse h-48" />
        </div>
      ) : stats ? (
        <>
          {/* Key Metric Overview Cards */}
          <StatsCards
            agentCount={stats.agentCount}
            numberCount={stats.numberCount}
            totalCalls={stats.totalCalls}
            balanceCents={stats.balanceCents}
            callSuccessRate={stats.callSuccessRate}
          />

          {/* Onboarding Checklist */}
          <OnboardingChecklist
            hasAgents={stats.agentCount > 0}
            hasNumbers={stats.numberCount > 0}
            hasCalls={stats.totalCalls > 0}
          />

          {/* Quick Actions & Live Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentActivity activities={stats.recentActivities || []} />
            </div>

            {/* Quick Links / Docs card */}
            <div className="p-6 rounded-2xl bg-[#0a0c10] border border-white/[0.08] space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Developer Quickstart</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Connect your backend or local AI tools using our native client libraries and Model Context Protocol server.
              </p>

              <div className="space-y-2 pt-1">
                <Link
                  href="/docs"
                  className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between hover:border-emerald-500/30 transition group block"
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 transition" />
                    <span className="text-xs font-medium text-white group-hover:text-emerald-300">
                      Interactive API Reference
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 group-hover:text-emerald-400 transition">→</span>
                </Link>

                <Link
                  href="/dashboard/settings/api-keys"
                  className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between hover:border-emerald-500/30 transition group block"
                >
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 transition" />
                    <span className="text-xs font-medium text-white group-hover:text-emerald-300">
                      API Keys Management
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 group-hover:text-emerald-400 transition">→</span>
                </Link>

                <Link
                  href="/dashboard/webhooks"
                  className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between hover:border-emerald-500/30 transition group block"
                >
                  <div className="flex items-center gap-2.5">
                    <Webhook className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 transition" />
                    <span className="text-xs font-medium text-white group-hover:text-emerald-300">
                      Webhook Endpoints & Logs
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 group-hover:text-emerald-400 transition">→</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-red-400">Failed to load dashboard overview.</div>
      )}
    </div>
  );
}
