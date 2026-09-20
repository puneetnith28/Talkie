import React from 'react';
import Link from 'next/link';
import { Button } from '@talkie/ui';

export function MarketingFinalCTA() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-950 to-zinc-900 border border-blue-500/30 p-10 sm:p-16 text-center overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to give your AI agents a real phone number?
          </h3>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            Join thousands of developers building the future of automated voice, intelligent customer care, and omnichannel messaging.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/dashboard">
              <Button variant="primary" className="h-12 px-8 text-sm font-bold shadow-xl shadow-blue-500/30">
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
