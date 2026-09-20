import React from 'react';
import Link from 'next/link';
import { Button, GridBackground, GlowBackground } from '@talkie/ui';

export function MarketingFinalCTA() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative font-sans">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#141824] via-[#0d1017] to-[#08090b] border border-white/10 p-10 sm:p-16 text-center overflow-hidden shadow-2xl">
        {/* Ambient High-Contrast Backdrop */}
        <GridBackground size={32} variant="glow" mask="radial" opacity={0.65} />
        <GlowBackground position="center" variant="primary" size={650} blur={150} opacity={0.24} />
        <GlowBackground position="top-right" variant="cyan" size={450} blur={160} opacity={0.15} />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to give your AI agents a real phone number?
          </h3>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            Join thousands of developers building the future of automated voice, intelligent customer care, and omnichannel messaging.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/dashboard">
              <Button variant="primary" className="h-12 px-8 text-sm font-bold shadow-xl shadow-emerald-500/20">
                Claim Your Free Number →
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" className="h-12 px-6 text-sm font-semibold">
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
