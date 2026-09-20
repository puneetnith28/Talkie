'use client';

import React from 'react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'call' | 'message';
  title: string;
  subtitle: string;
  timestamp: string;
}

export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center py-10 text-zinc-500 text-xs font-mono">
        No recent activity detected. Trigger a call or message to view events here.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white">Recent Activity Stream</h3>
        <Link href="/dashboard/calls" className="text-xs text-blue-400 hover:text-blue-300 transition">
          View all calls →
        </Link>
      </div>

      <div className="divide-y divide-zinc-800/60">
        {activities.map((act) => (
          <div key={act.id} className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm shrink-0 border border-zinc-700/60">
                {act.type === 'call' ? '📞' : '💬'}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{act.title}</div>
                <div className="text-[11px] text-zinc-400 truncate">{act.subtitle}</div>
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 font-mono shrink-0">
              {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
