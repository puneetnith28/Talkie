'use client';

import React from 'react';
import Link from 'next/link';
import { Button, GridBackground, GlowBackground } from '@talkie/ui';
import { HeroCallDemo } from './hero-call-demo';

export function MarketingHero() {
  return (
    <section className="relative pt-28 pb-24 overflow-hidden border-b border-white/[0.06]">
      {/* Background System: Fine Grid + Dual Radial Ambient Glow */}
      <GridBackground size={36} variant="glow" mask="radial" opacity={0.65} />
      <GlowBackground position="top-center" variant="primary" size={750} blur={140} opacity={0.22} />
      <GlowBackground position="top-left" variant="cyan" size={500} blur={160} opacity={0.12} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-300">
                Announcing Talkie v1.0 • Global AI Telephony Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Phone numbers for{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                AI Voice Agents
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Instant carrier-grade phone numbers, sub-second conversational latency, real-time live transcripts, and unified omnichannel SMS. Built for modern AI applications, MCP tools, and autonomous agent backends.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/dashboard">
                <Button variant="primary" className="h-12 px-8 text-sm font-bold shadow-xl shadow-blue-500/25">
                  Get Started Free →
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" className="h-12 px-6 text-sm font-semibold">
                  Explore API Documentation
                </Button>
              </Link>
            </div>

            {/* Quick stats pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">⚡</span> &lt;450ms Voice Latency
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">🌐</span> US & Canada Local Numbers
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">🔒</span> End-to-End HMAC Signed
              </div>
            </div>
          </div>

          {/* Right Hero Demo */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroCallDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
