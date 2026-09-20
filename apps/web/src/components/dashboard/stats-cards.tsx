import React from 'react';
import Link from 'next/link';

interface StatsProps {
  agentCount: number;
  numberCount: number;
  totalCalls: number;
  balanceCents: number;
}

export function StatsCards({ agentCount, numberCount, totalCalls, balanceCents }: StatsProps) {
  const cards = [
    {
      label: 'Active Agents',
      value: agentCount,
      change: '+1 this week',
      href: '/dashboard/agents',
      color: 'from-blue-500/10 border-blue-500/30',
      icon: '🤖',
    },
    {
      label: 'Phone Numbers',
      value: numberCount,
      change: 'US / CA active lines',
      href: '/dashboard/numbers',
      color: 'from-purple-500/10 border-purple-500/30',
      icon: '📞',
    },
    {
      label: 'Calls Processed',
      value: totalCalls,
      change: '100% completion rate',
      href: '/dashboard/calls',
      color: 'from-emerald-500/10 border-emerald-500/30',
      icon: '🎙️',
    },
    {
      label: 'Credit Balance',
      value: `$${(balanceCents / 100).toFixed(2)}`,
      change: 'Pay-as-you-go',
      href: '/dashboard/usage',
      color: 'from-amber-500/10 border-amber-500/30',
      icon: '💳',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className={`p-5 rounded-2xl bg-zinc-900 border bg-gradient-to-br ${card.color} hover:border-zinc-600 transition duration-200 group shadow-lg shadow-black/20`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300">
              {card.label}
            </span>
            <span className="text-xl p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50">
              {card.icon}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{card.value}</div>
          <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {card.change}
          </div>
        </Link>
      ))}
    </div>
  );
}
