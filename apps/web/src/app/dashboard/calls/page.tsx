'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button } from '@talkie/ui';
import { PhoneCall, Activity, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { CallsTable } from '@/components/calls/calls-table';

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalls = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/calls?limit=50');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCalls(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load initial calls:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const activeCalls = calls.filter((c) => c.status === 'in-progress' || c.status === 'in_progress').length;
  const completedCalls = calls.filter((c) => c.status === 'completed').length;
  const totalDuration = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const avgDurationSeconds = calls.length > 0 ? Math.round(totalDuration / calls.length) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Calls & Transcripts</h1>
            <Badge variant="neutral" className="font-mono text-xs">
              {calls.length} Total Records
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time telephony sessions, speaker turns, AI sentiment, and post-call intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCalls}
            title="Refresh calls"
            className="p-2 rounded-xl bg-black/40 border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.2] transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Sessions</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{calls.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <PhoneCall className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Active In-Call</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono flex items-center gap-2">
              <span>{activeCalls}</span>
              {activeCalls > 0 && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{completedCalls}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Avg Duration</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {avgDurationSeconds > 0 ? `${avgDurationSeconds}s` : '—'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Interactive Calls Table */}
      <CallsTable initialCalls={calls} />
    </div>
  );
}
