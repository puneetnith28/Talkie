'use client';

import React from 'react';
import { Headphones, TrendingUp, ShieldCheck, Bot, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface UseCase {
  title: string;
  desc: string;
  tag: string;
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  tagColor: string;
}

const USE_CASES: UseCase[] = [
  {
    title: 'Customer Support',
    desc: 'Automate Tier-1 inbound voice inquiries with sub-250ms responses & CRM sync.',
    tag: 'Inbound Telephony',
    iconBg: 'bg-blue-500/15',
    iconBorder: 'border-blue-500/30',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: <Headphones className="w-5 h-5 text-blue-400" />,
  },
  {
    title: 'Outbound Qualification',
    desc: 'Call incoming web leads in seconds to qualify intent & schedule sales demos.',
    tag: 'Speed to Lead',
    iconBg: 'bg-emerald-500/15',
    iconBorder: 'border-emerald-500/30',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
  },
  {
    title: '2FA & Critical Alerts',
    desc: 'Deliver OTP codes & time-sensitive security alerts over Tier-1 carrier routes.',
    tag: 'Security & Auth',
    iconBg: 'bg-amber-500/15',
    iconBorder: 'border-amber-500/30',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
  },
  {
    title: 'Autonomous MCP Agents',
    desc: 'Connect Claude & Cursor directly to live phone lines to place real calls.',
    tag: 'MCP & Coding',
    iconBg: 'bg-pink-500/15',
    iconBorder: 'border-pink-500/30',
    tagColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    icon: <Bot className="w-5 h-5 text-pink-400" />,
  },
];

export function MarketingUseCases() {
  return (
    <section id="use-cases" className="relative py-20 sm:py-28 bg-[#060407] border-t border-white/[0.06] overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-pink-600/[0.05] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-pink-400 mb-2">
            Production Applications
          </h2>
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Engineered for Enterprise Scale
          </h3>
          <p className="text-sm sm:text-base text-neutral-400 mt-3 font-normal">
            Mission-critical AI voice operations from fast-growing startups to global platforms.
          </p>
        </div>

        {/* 4 Minimal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {USE_CASES.map((c) => (
            <div
              key={c.title}
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0c080e]/80 hover:bg-[#120b15]/90 border border-white/[0.08] hover:border-pink-500/35 transition-all duration-300 flex flex-col justify-between group backdrop-blur-xl shadow-lg hover:shadow-pink-500/10"
            >
              <div>
                {/* Top: Real SVG Icon + Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${c.iconBg} border ${c.iconBorder} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                    {c.icon}
                  </div>
                  <span className={`text-[9px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full border ${c.tagColor}`}>
                    {c.tag}
                  </span>
                </div>

                {/* Title & Reduced Minimal Description */}
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight mb-2 group-hover:text-pink-300 transition-colors">
                  {c.title}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans font-normal">
                  {c.desc}
                </p>
              </div>

              {/* Bottom Subtle Action Link */}
              <div className="mt-5 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-neutral-400 group-hover:text-pink-400 transition-colors">
                <span className="font-medium text-[11px]">Explore API</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
