'use client';

import React from 'react';
import Link from 'next/link';

interface ChecklistProps {
  hasAgents: boolean;
  hasNumbers: boolean;
  hasCalls: boolean;
}

export function OnboardingChecklist({ hasAgents, hasNumbers, hasCalls }: ChecklistProps) {
  const steps = [
    {
      title: 'Create an AI Voice Agent',
      desc: 'Define custom system instructions, persona, and voice styling.',
      done: hasAgents,
      href: '/dashboard/agents',
    },
    {
      title: 'Provision a Phone Number',
      desc: 'Get an instant US/CA number and route calls to your agent.',
      done: hasNumbers,
      href: '/dashboard/numbers',
    },
    {
      title: 'Simulate or Receive First Call',
      desc: 'Test sub-second conversational latency and live transcript stream.',
      done: hasCalls,
      href: '/dashboard/calls',
    },
    {
      title: 'Generate Developer API Key',
      desc: 'Connect our TypeScript/Python SDKs or MCP Server.',
      done: true,
      href: '/dashboard/settings/api-keys',
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (completedCount === steps.length) return null;

  return (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white">Getting Started with Talkie</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Complete these setup steps to launch your first voice agent</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-blue-400">{completedCount} of {steps.length} completed</span>
          <div className="w-32 h-1.5 rounded-full bg-zinc-800 mt-1.5 overflow-hidden">
            <div style={{ width: `${progressPercent}%` }} className="h-full bg-blue-500 rounded-full transition-all duration-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {steps.map((s, i) => (
          <Link
            key={s.title}
            href={s.href}
            className={`p-4 rounded-xl border flex items-start gap-3.5 transition group ${
              s.done
                ? 'bg-zinc-950/60 border-zinc-800/60 opacity-60'
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                s.done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {s.done ? '✓' : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition">
                {s.title}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{s.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
