import React from 'react';
import Link from 'next/link';
import { Bot, Phone, PhoneCall, CreditCard, ArrowUpRight } from 'lucide-react';
import { Card } from '@talkie/ui';

interface StatsProps {
  agentCount: number;
  numberCount: number;
  totalCalls: number;
  balanceCents: number;
  callSuccessRate?: number;
}

export function StatsCards({
  agentCount,
  numberCount,
  totalCalls,
  balanceCents,
  callSuccessRate = 100,
}: StatsProps) {
  const cards = [
    {
      label: 'AI Agents',
      value: agentCount,
      change: agentCount > 0 ? `${agentCount} active voice bots` : 'No agents created',
      href: '/dashboard/agents',
      icon: Bot,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Phone Numbers',
      value: numberCount,
      change: numberCount > 0 ? `${numberCount} carrier lines assigned` : 'No numbers claimed',
      href: '/dashboard/numbers',
      icon: Phone,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Calls Processed',
      value: totalCalls,
      change: `${callSuccessRate}% success rate`,
      href: '/dashboard/calls',
      icon: PhoneCall,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Credit Balance',
      value: `$${(balanceCents / 100).toFixed(2)}`,
      change: 'Live balance ledger',
      href: '/dashboard/usage',
      icon: CreditCard,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.label} href={card.href} className="group block">
            <Card className="p-5 bg-[#0a0c10] border-white/[0.08] hover:border-white/[0.2] transition-all duration-200 shadow-xl relative overflow-hidden group-hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-300">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
                  {card.value}
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 transition-colors" />
              </div>

              <div className="text-[11px] text-neutral-400 mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{card.change}</span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
