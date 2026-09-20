'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, Phone, PhoneCall, Key, CheckCircle2, Circle } from 'lucide-react';

interface ChecklistProps {
  hasAgents: boolean;
  hasNumbers: boolean;
  hasCalls: boolean;
  hasApiKeys: boolean;
}

export function OnboardingChecklist({ hasAgents, hasNumbers, hasCalls, hasApiKeys }: ChecklistProps) {
  const steps = [
    {
      title: 'Create an AI Voice Agent',
      desc: 'Define custom system instructions, persona, and voice styling.',
      done: hasAgents,
      href: '/dashboard/agents',
      icon: Bot,
    },
    {
      title: 'Provision a Phone Number',
      desc: 'Get an instant US/CA number and route calls to your agent.',
      done: hasNumbers,
      href: '/dashboard/numbers',
      icon: Phone,
    },
    {
      title: 'Simulate or Receive First Call',
      desc: 'Test sub-second conversational latency and live transcript stream.',
      done: hasCalls,
      href: '/dashboard/calls',
      icon: PhoneCall,
    },
    {
      title: 'Generate Developer API Key',
      desc: 'Connect our TypeScript/Python SDKs or MCP Server.',
      done: hasApiKeys,
      href: '/dashboard/settings/api-keys',
      icon: Key,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (completedCount === steps.length) return null;

  return (
    <div className="p-6 rounded-2xl bg-[#0a0c10] border border-white/[0.08] shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">Getting Started with Talkie</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Complete these setup steps to launch your first voice agent</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-400">{completedCount} of {steps.length} completed</span>
          <div className="w-32 h-1.5 rounded-full bg-white/[0.06] mt-1.5 overflow-hidden">
            <div style={{ width: `${progressPercent}%` }} className="h-full bg-emerald-500 rounded-full transition-all duration-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              href={s.href}
              className={`p-4 rounded-xl border flex items-start gap-3.5 transition group ${
                s.done
                  ? 'bg-black/30 border-white/[0.04] opacity-60'
                  : 'bg-black/50 border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.02]'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  s.done
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/[0.04] text-neutral-400 border border-white/[0.08]'
                }`}
              >
                {s.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">
                  {s.title}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{s.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
