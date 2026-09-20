'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How does Talkie achieve sub-300ms voice response latency?',
    a: 'We combine real-time bidirectional WebSocket audio streaming with Deepgram Nova-2 streaming STT, speculative turn streaming, and ElevenLabs neural TTS to deliver live conversation turns in under 300ms.',
  },
  {
    q: 'Can I provision real phone numbers in US and Canada?',
    a: 'Yes. Talkie provides immediate API and dashboard provisioning for local 10-digit carrier numbers and toll-free numbers across thousands of North American area codes.',
  },
  {
    q: 'How does MCP (Model Context Protocol) integration work?',
    a: 'Talkie provides an official open-source MCP server (@talkie/mcp-server) enabling AI assistants in Claude Code, Cursor, and agent frameworks to make voice calls and send SMS messages natively.',
  },
  {
    q: 'Are incoming webhooks secured against replay attacks?',
    a: 'All webhook payloads are HMAC-SHA256 signed with unique signatures and timestamps in the request headers (X-Talkie-Signature, X-Talkie-Timestamp) with a 5-minute replay tolerance.',
  },
  {
    q: 'What are the pay-as-you-go pricing rates?',
    a: 'Voice calls are $0.05/minute (including STT, LLM inference, and TTS), SMS messages are $0.015/segment, and dedicated carrier numbers are $2.00/month with zero minimum commitments.',
  },
];

export function MarketingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 sm:py-28 bg-[#050406] border-t border-white/[0.06] overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-pink-600/[0.04] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Developer FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-3 font-normal">
            Everything you need to know about Talkie infrastructure and telephony.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#0d080c]/95 border-pink-500/30 shadow-lg shadow-pink-500/5'
                    : 'bg-[#09060a]/70 border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className={`text-sm sm:text-base font-bold transition-colors ${isOpen ? 'text-pink-300' : 'text-white'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-pink-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/[0.05] pt-3 font-normal font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
