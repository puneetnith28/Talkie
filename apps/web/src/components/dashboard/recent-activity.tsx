'use client';

import React from 'react';
import Link from 'next/link';
import { PhoneCall, MessageSquare, Bot, Activity, ArrowRight } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'call' | 'message' | 'agent';
  title: string;
  subtitle: string;
  timestamp: string;
  status?: string;
  direction?: string;
}

export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#0a0c10] border border-white/[0.08] text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-neutral-500">
          <Activity className="w-5 h-5" />
        </div>
        <div className="text-xs text-neutral-400 font-medium">No recent activity detected</div>
        <p className="text-[11px] text-neutral-500 max-w-xs">
          Trigger a live call, send a message, or configure an agent to see real-time workspace events here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-[#0a0c10] border border-white/[0.08] shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-tight">Recent Activity Stream</h3>
        </div>
        <Link
          href="/dashboard/calls"
          className="text-xs text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 font-medium"
        >
          <span>View calls</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {activities.map((act) => {
          let Icon = Activity;
          let iconColor = 'text-neutral-400 bg-white/[0.03] border-white/[0.08]';

          if (act.type === 'call') {
            Icon = PhoneCall;
            iconColor =
              act.direction === 'inbound'
                ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                : 'text-blue-400 bg-blue-500/10 border-blue-500/20';
          } else if (act.type === 'message') {
            Icon = MessageSquare;
            iconColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          } else if (act.type === 'agent') {
            Icon = Bot;
            iconColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
          }

          return (
            <div key={act.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{act.title}</div>
                  <div className="text-[11px] text-neutral-400 truncate mt-0.5">{act.subtitle}</div>
                </div>
              </div>
              <div className="text-[11px] text-neutral-500 font-mono shrink-0">
                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
