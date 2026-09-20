'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge } from '@talkie/ui';
import { Webhook, Activity, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { WebhookList } from '@/components/webhooks/webhook-list';

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/webhooks');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setWebhooks(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load webhooks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const activeCount = webhooks.filter((w) => w.status === 'active').length;
  const totalDeliveries = webhooks.reduce((acc, w) => acc + (w._count?.deliveries || w.deliveries?.length || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Webhooks & Event Streams</h1>
            <Badge variant="neutral" className="font-mono text-xs">
              {webhooks.length} Endpoints
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Configure secure HTTP callback endpoints signed with HMAC-SHA256 for real-time system events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchWebhooks}
            title="Refresh webhooks"
            className="p-2 rounded-xl bg-black/40 border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.2] transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Endpoints</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{webhooks.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Webhook className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Active Status</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono flex items-center gap-2">
              <span>{activeCount}</span>
              {activeCount > 0 && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Deliveries</div>
            <div className="text-2xl font-bold text-teal-400 mt-1 font-mono">{totalDeliveries}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex items-center justify-between shadow-xl">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Security Tier</div>
            <div className="text-2xl font-bold text-purple-400 mt-1 flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>HMAC Signed</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      <WebhookList initialWebhooks={webhooks} />
    </div>
  );
}
