'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Check, ArrowRight, Signal, Globe, Copy } from 'lucide-react';

const REAL_CARRIER_NUMBERS: Record<string, Array<{ number: string; region: string; features: string }>> = {
  '80': [
    { number: '+91 80 4567 8901', region: 'Bengaluru, Karnataka', features: 'Voice & SMS' },
    { number: '+91 80 6123 4499', region: 'Bengaluru, Karnataka', features: 'Voice & SMS' },
  ],
  '11': [
    { number: '+91 11 2345 6789', region: 'New Delhi, NCR', features: 'Voice & SMS' },
    { number: '+91 11 4987 1122', region: 'Connaught Place, Delhi', features: 'Voice & SMS' },
  ],
  '22': [
    { number: '+91 22 6789 0123', region: 'Mumbai, Maharashtra', features: 'Voice & SMS' },
    { number: '+91 22 2845 9901', region: 'BKC, Mumbai', features: 'Voice & SMS' },
  ],
  '40': [
    { number: '+91 40 4012 3456', region: 'Hyderabad, Telangana', features: 'Voice & SMS' },
    { number: '+91 40 6688 9911', region: 'HITEC City, Hyderabad', features: 'Voice & SMS' },
  ],
  '98': [
    { number: '+91 98765 43210', region: 'National Mobile (Direct SIP)', features: 'Voice & 2-Way SMS' },
    { number: '+91 98201 55432', region: 'National Mobile (Direct SIP)', features: 'Voice & 2-Way SMS' },
  ],
  '99': [
    { number: '+91 99887 76655', region: 'National Mobile (Direct SIP)', features: 'Voice & 2-Way SMS' },
    { number: '+91 99001 23456', region: 'National Mobile (Direct SIP)', features: 'Voice & 2-Way SMS' },
  ],
};

export function NumberSearchDemo() {
  const [areaCode, setAreaCode] = useState('80');
  const [copiedNum, setCopiedNum] = useState<string | null>(null);

  const activeNumbers =
    REAL_CARRIER_NUMBERS[areaCode] || [
      {
        number: `+91 ${areaCode || '80'} 4567 8901`,
        region: 'India Metro',
        features: 'Voice & SMS',
      },
      {
        number: `+91 ${areaCode || '80'} 6123 4499`,
        region: 'India Metro',
        features: 'Voice & SMS',
      },
    ];

  const handleCopy = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedNum(num);
    setTimeout(() => setCopiedNum(null), 2000);
  };

  return (
    <section id="numbers" className="relative py-20 sm:py-28 bg-[#050406] border-t border-white/[0.06] overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-pink-600/[0.06] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-3">
            <Signal className="w-3.5 h-3.5" />
            <span>Tier-1 Indian Carrier Inventory</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Search &amp; Bind Telecom Numbers
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-3 font-normal">
            Instant SIP trunk binding with automated inbound AI voice webhooks across Indian telecom circles (+91).
          </p>
        </div>

        {/* Minimal Search & Provisioning Card */}
        <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#0c080e]/90 border border-white/[0.08] shadow-2xl backdrop-blur-2xl">
          {/* Filter row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Country</label>
              <div className="relative">
                <select
                  disabled
                  value="IN"
                  className="w-full bg-neutral-900/90 border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none appearance-none cursor-default opacity-90"
                >
                  <option value="IN">🇮🇳 India (+91)</option>
                </select>
                <Globe className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                STD / Mobile Code (e.g. 80, 11, 22, 40, 98, 99)
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="80"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-neutral-900/90 border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500/50 transition font-mono"
              />
            </div>
          </div>

          {/* Quick city selectors for India */}
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">Popular Indian Hubs:</span>
            {[
              { code: '80', name: 'Bengaluru' },
              { code: '11', name: 'Delhi NCR' },
              { code: '22', name: 'Mumbai' },
              { code: '40', name: 'Hyderabad' },
              { code: '98', name: 'Mobile Direct' },
            ].map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setAreaCode(c.code)}
                className={`px-3 py-1 rounded-lg border font-mono transition-colors ${
                  areaCode === c.code
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                    : 'bg-white/[0.03] text-neutral-300 border-white/[0.08] hover:text-white'
                }`}
              >
                {c.name} ({c.code})
              </button>
            ))}
          </div>

          {/* Available Numbers List */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 flex items-center justify-between">
              <span>Available Indian Carrier Inventory</span>
              <span className="text-pink-400">Status: Real-Time Ready</span>
            </div>

            {activeNumbers.map((item) => {
              const isCopied = copiedNum === item.number;
              return (
                <div
                  key={item.number}
                  className="p-4 rounded-xl sm:rounded-2xl bg-black/40 border border-white/[0.06] hover:border-pink-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/25 flex items-center justify-center text-pink-400 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-bold text-white font-mono">{item.number}</div>
                      <div className="text-xs text-neutral-400">{item.region} • {item.features}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.number)}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-neutral-200 border border-white/[0.08] transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-pink-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <Link
                      href="/sign-up"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-xs font-bold text-white transition shadow-lg shadow-pink-500/20 flex items-center gap-1.5 active:scale-95"
                    >
                      <span>Claim Number</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
