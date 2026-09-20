'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { FloatingMascots } from './floating-mascots';
import { HeroCallPill } from './hero-call-pill';
import { TalkToTeamBadge } from './talk-badge';

export function MarketingHero() {
  return (
    <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden bg-[#050406]">
      {/* Background Floating Silhouettes */}
      <FloatingMascots />

      {/* Central Ambient Deep Pink/Rose Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] bg-pink-600/[0.14] rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/[0.08] rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/[0.08] rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        {/* Main Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-[1.05] sm:leading-[1.02] max-w-4xl mx-auto animate-hero-heading mt-2">
          Phone numbers <br className="hidden sm:inline" />
          for AI Agents
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg text-neutral-300 max-w-xl mx-auto mt-6 leading-relaxed font-normal animate-hero-copy">
          Talkie gives your AI its own phone number. Handle voice and messages through one unified webhook.
        </p>

        {/* Action Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mt-8 mb-16 animate-hero-cta">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25 active:scale-95 transition"
          >
            <span>Start building now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/docs"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800/90 text-neutral-300 hover:text-white text-sm font-semibold border border-white/[0.12] shadow-xl backdrop-blur-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-neutral-400" />
            <span>API Docs &amp; SDKs</span>
          </Link>
        </div>

        {/* Floating Telephony Call Simulator & Waveform */}
        <div className="w-full animate-hero-card">
          <HeroCallPill />
        </div>
      </div>

      {/* Floating Bottom-Right Rotating Talk Badge */}
      <TalkToTeamBadge />
    </section>
  );
}
