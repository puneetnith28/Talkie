'use client';

import React, { useState } from 'react';

export function MarketingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Talkie achieve sub-second voice latency?',
      a: 'We combine real-time WebSocket audio streaming with Deepgram streaming speech-to-text, speculative LLM turn generation, and ElevenLabs low-latency voice synthesis to achieve round-trip conversational turns in under 450 milliseconds.',
    },
    {
      q: 'Can I provision real phone numbers in US and Canada?',
      a: 'Yes! Talkie allows instant search and provisioning of local 10-digit phone numbers and toll-free numbers across thousands of US and Canadian area codes directly via dashboard or API.',
    },
    {
      q: 'How does MCP (Model Context Protocol) integration work?',
      a: 'Talkie provides an official MCP Server (@talkie/mcp-server) enabling AI assistants in Claude Desktop, Cursor, or autonomous agents to make calls, send texts, and provision phone numbers natively.',
    },
    {
      q: 'Are webhooks secured against replay attacks?',
      a: 'All webhook events are HMAC-SHA256 signed with unique signatures, timestamps (5-minute tolerance window), and event identifiers in the request headers (X-Talkie-Signature, X-Talkie-Timestamp).',
    },
    {
      q: 'What are the pay-as-you-go pricing rates?',
      a: 'AI voice calls are $0.05/minute (including STT, LLM, and TTS), SMS messages are $0.015/segment, and dedicated phone numbers are $2.00/month. There are no minimum commitments or hidden fees.',
    },
  ];

  return (
    <section id="pricing" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
          Frequently Asked Questions
        </h2>
        <h3 className="text-3xl font-black text-white tracking-tight">
          Everything You Need to Know
        </h3>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden transition shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4"
              >
                <span className="text-sm font-bold text-white">{faq.q}</span>
                <span className="text-zinc-400 text-lg">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-850 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
