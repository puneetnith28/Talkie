import React from 'react';

export function MarketingEcosystem() {
  const providers = [
    { name: 'Deepgram', role: 'Sub-300ms Speech-to-Text' },
    { name: 'ElevenLabs', role: 'Ultra-realistic Neural Voice' },
    { name: 'Anthropic Claude', role: 'Low-latency Reasoning Engine' },
    { name: 'OpenAI GPT-4o', role: 'Conversational Intelligence' },
    { name: 'Model Context Protocol', role: 'Native MCP Server Integration' },
    { name: 'Stripe', role: 'Real-time Metered Invoicing' },
  ];

  return (
    <section className="py-14 border-y border-zinc-800/80 bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-8">
          Powering next-generation autonomous AI voice & telephony infrastructure
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {providers.map((p) => (
            <div
              key={p.name}
              className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center flex flex-col items-center justify-center hover:border-zinc-700 transition group"
            >
              <div className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                {p.name}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">{p.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
