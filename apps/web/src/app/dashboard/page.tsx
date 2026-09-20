'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@talkie/ui';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist';
import { RecentActivity } from '@/components/dashboard/recent-activity';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
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
      }
    }
    loadStats();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {stats ? stats.workspaceName : 'Dashboard Overview'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time status of conversational AI agents, telephony routing, and omnichannel messaging.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/agents">
            <Button variant="outline">+ Create Agent</Button>
          </Link>
          <Link href="/dashboard/numbers">
            <Button variant="primary" className="shadow-lg shadow-blue-500/20">
              Get Phone Number
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-zinc-500 font-mono">Loading workspace telemetry...</div>
      ) : stats ? (
        <>
          {/* Key Metric Overview Cards */}
          <StatsCards
            agentCount={stats.agentCount}
            numberCount={stats.numberCount}
            totalCalls={stats.totalCalls}
            balanceCents={stats.balanceCents}
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
              <RecentActivity activities={stats.recentActivities} />
            </div>

            {/* Quick Links / Docs card */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white">Developer Quickstart</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your backend or local AI tools using our native client libraries and Model Context Protocol server.
              </p>

              <div className="space-y-2">
                <Link
                  href="/docs"
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition group block"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-blue-400">
                    Interactive API Reference
                  </div>
                  <span className="text-xs text-zinc-500">→</span>
                </Link>
                <Link
                  href="/dashboard/settings/api-keys"
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition group block"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-blue-400">
                    API Keys Management
                  </div>
                  <span className="text-xs text-zinc-500">→</span>
                </Link>
                <Link
                  href="/dashboard/webhooks"
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition group block"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-blue-400">
                    Webhook Endpoints
                  </div>
                  <span className="text-xs text-zinc-500">→</span>
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
