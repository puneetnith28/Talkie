'use client';

import React, { useState } from 'react';

export function NumberSearchDemo() {
  const [country, setCountry] = useState('US');
  const [areaCode, setAreaCode] = useState('415');
  const [copied, setCopied] = useState<string | null>(null);

  const sampleNumbers = [
    { number: `+1 (${areaCode || '415'}) 555-0199`, locality: 'San Francisco, CA', type: 'Local Voice & SMS' },
    { number: `+1 (${areaCode || '415'}) 842-1102`, locality: 'Downtown Metro', type: 'Local Voice & SMS' },
    { number: `+1 (${areaCode || '415'}) 920-4381`, locality: 'Bay Area Central', type: 'Local Voice & SMS' },
  ];

  const handleCopy = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopied(num);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section id="features" className="py-20 bg-zinc-950/60 border-t border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
            Global Telephony Provisioning
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Search & Claim Live Numbers Instantly
          </h3>
          <p className="text-sm text-zinc-400 mt-2">
            Deploy local presence phone numbers anywhere in North America with automatic SIP binding and inbound AI routing.
          </p>
        </div>

        <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-6">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="US">🇺🇸 United States (+1)</option>
                <option value="CA">🇨🇦 Canada (+1)</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Area Code (e.g. 415, 212, 647)</label>
              <input
                type="text"
                maxLength={3}
                placeholder="415"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Results list */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Available Numbers for Immediate Provisioning
            </div>

            {sampleNumbers.map((item) => (
              <div
                key={item.number}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4 hover:border-zinc-700 transition"
              >
                <div>
                  <div className="text-base font-bold text-white font-mono">{item.number}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{item.locality} • {item.type}</div>
                </div>

                <button
                  onClick={() => handleCopy(item.number)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white border border-zinc-700 transition shadow-sm"
                >
                  {copied === item.number ? '✓ Copied' : 'Claim Number →'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
