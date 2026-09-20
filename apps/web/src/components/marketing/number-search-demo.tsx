'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Check, ArrowRight } from 'lucide-react';
import { GridBackground, GlowBackground } from '@talkie/ui';

export function NumberSearchDemo() {
  const [country, setCountry] = useState('US');
  const [areaCode, setAreaCode] = useState('415');
  const [claimed, setClaimed] = useState<string | null>(null);

  const sampleNumbers = [
    { number: `+1 (${areaCode || '415'}) 555-0199`, locality: 'San Francisco, CA', type: 'Voice & SMS' },
    { number: `+1 (${areaCode || '415'}) 842-1102`, locality: 'Downtown Metro', type: 'Voice & SMS' },
    { number: `+1 (${areaCode || '415'}) 920-4381`, locality: 'Bay Area Central', type: 'Voice & SMS' },
  ];

  const handleClaim = (num: string) => {
    navigator.clipboard?.writeText(num);
    setClaimed(num);
    setTimeout(() => setClaimed(null), 2500);
  };

  return (
    <section id="features" className="relative py-24 bg-zinc-950/60 border-t border-zinc-800/80 font-sans overflow-hidden">
      {/* Telephony Technical Grid System */}
      <GridBackground size={40} variant="telephony" mask="radial" opacity={0.75} />
      <GlowBackground position="top-right" variant="cyan" size={600} blur={160} opacity={0.16} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
            Global Telephony Provisioning
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Search & Claim Live Numbers Instantly
          </h3>
          <p className="text-sm text-zinc-400 mt-2 font-normal">
            Deploy local presence phone numbers anywhere in North America with automatic SIP binding and inbound AI routing.
          </p>
        </div>

        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800/90 shadow-2xl space-y-6 backdrop-blur-xl">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="US">🇺🇸 United States (+1)</option>
                <option value="CA">🇨🇦 Canada (+1)</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Area Code (e.g. 415, 212, 647)</label>
              <input
                type="text"
                maxLength={3}
                placeholder="415"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition font-mono"
              />
            </div>
          </div>

          {/* Results list */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Available Numbers for Immediate Provisioning
            </div>

            {sampleNumbers.map((item) => {
              const isClaimed = claimed === item.number;
              return (
                <div
                  key={item.number}
                  className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <Phone className="size-4" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-white font-mono">{item.number}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{item.locality} • {item.type}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleClaim(item.number)}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs font-semibold text-zinc-200 border border-zinc-700/70 transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isClaimed ? (
                        <>
                          <Check className="size-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <span>Copy Number</span>
                      )}
                    </button>
                    <Link
                      href="/dashboard/numbers"
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                    >
                      <span>Claim</span>
                      <ArrowRight className="size-3" />
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
