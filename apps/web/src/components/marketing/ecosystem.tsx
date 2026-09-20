'use client';

import React from 'react';

interface Partner {
  name: string;
  role: string;
  category: string;
  icon: React.ReactNode;
}

const PARTNERS: Partner[] = [
  {
    name: 'Deepgram',
    role: 'Sub-300ms Speech-to-Text',
    category: 'STT Audio Engine',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 4.5C4 3.67 4.67 3 5.5 3H12C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21H5.5C4.67 21 4 20.33 4 19.5V4.5Z"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <path
          d="M8.5 7.5H12C14.49 7.5 16.5 9.51 16.5 12C16.5 14.49 14.49 16.5 12 16.5H8.5V7.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: 'ElevenLabs',
    role: 'Ultra-realistic Neural Voice',
    category: 'TTS Synthesis',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="3" width="3.2" height="18" rx="1.6" fill="currentColor" />
        <rect x="13.8" y="3" width="3.2" height="18" rx="1.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Anthropic Claude',
    role: 'Low-latency Reasoning Engine',
    category: 'LLM Orchestration',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.8 3.5L18.4 20.5H14.8L13.8 16.4H8.6L7.6 20.5H4L8.6 3.5H13.8ZM12.8 12.8L11.2 6.8L9.6 12.8H12.8Z" />
      </svg>
    ),
  },
  {
    name: 'OpenAI GPT-4o',
    role: 'Conversational Intelligence',
    category: 'Multimodal Models',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 3.8 2.7 4 4 0 0 1 4.5 4.5 4 4 0 0 1 1.7 5.2 4 4 0 0 1-2.7 3.8 4 4 0 0 1-4.5 4.5 4 4 0 0 1-5.2 1.7 4 4 0 0 1-3.8-2.7 4 4 0 0 1-4.5-4.5 4 4 0 0 1-1.7-5.2 4 4 0 0 1 2.7-3.8 4 4 0 0 1 4.5-4.5 4 4 0 0 1 5.2-1.7Z" />
        <path d="M8.5 12h7" />
        <path d="M12 8.5v7" />
      </svg>
    ),
  },
  {
    name: 'Model Context Protocol',
    role: 'Native MCP Server Integration',
    category: 'Tool & Data Protocol',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
        <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
        <path d="M10 6.5H14M17.5 10V14M14 17.5H10M6.5 14V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Stripe',
    role: 'Real-time Metered Invoicing',
    category: 'Billing Infrastructure',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-4.329C17.587 1.986 15.143 1.5 12.38 1.5c-4.482 0-7.518 2.378-7.518 6.376 0 4.968 6.843 5.234 6.843 7.925 0 1.054-.932 1.528-2.278 1.528-2.023 0-5.011-1.042-6.93-2.091L1.5 19.664C3.593 20.84 6.84 21.5 9.878 21.5c4.78 0 7.822-2.316 7.822-6.499 0-5.277-3.724-5.851-3.724-5.851Z" />
      </svg>
    ),
  },
  {
    name: 'Groq',
    role: 'Ultra-fast LPU Inference',
    category: 'Low-latency Compute',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12L12 8L16 12L12 16L8 12Z" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="#000" />
      </svg>
    ),
  },
  {
    name: 'Twilio',
    role: 'Tier-1 Carrier Voice Trunking',
    category: 'Global Telephony',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="9" cy="9" r="2" />
        <circle cx="15" cy="9" r="2" />
        <circle cx="9" cy="15" r="2" />
        <circle cx="15" cy="15" r="2" />
      </svg>
    ),
  },
];

export function MarketingEcosystem() {
  // We duplicate the list to achieve an uninterrupted seamless infinite loop
  const marqueeItems = [...PARTNERS, ...PARTNERS];

  return (
    <section className="relative py-16 sm:py-20 border-y border-white/[0.06] bg-[#070508] overflow-hidden">
      {/* Subtle ambient pink background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-pink-500/[0.04] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center relative z-10">
        <p className="text-center text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-[0.22em] text-neutral-400">
          Powering Next-Generation Autonomous AI Voice &amp; Telephony Infrastructure
        </p>
      </div>

      {/* Marquee Wrapper with Left & Right Gradient Mask Overlays for Smooth Edge Fade */}
      <div className="relative w-full overflow-hidden flex items-center">
        {/* Left Gradient Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#070508] to-transparent z-20 pointer-events-none" />
        {/* Right Gradient Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#070508] to-transparent z-20 pointer-events-none" />

        {/* Infinite Looping Track (Moves Right to Left seamlessly) */}
        <div className="animate-marquee flex items-center gap-4 sm:gap-5 py-2">
          {marqueeItems.map((p, idx) => (
            <div
              key={`${p.name}-${idx}`}
              className="group flex-shrink-0 w-[240px] sm:w-[270px] px-5 py-4 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900/90 border border-white/[0.08] hover:border-pink-500/35 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-pink-500/10 flex flex-col justify-between cursor-default"
            >
              {/* Header: Icon + Name */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-neutral-300 group-hover:text-pink-400 group-hover:bg-pink-500/10 group-hover:border-pink-500/30 transition-all duration-200">
                  {p.icon}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white tracking-tight group-hover:text-pink-300 transition-colors">
                    {p.name}
                  </div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                    {p.category}
                  </div>
                </div>
              </div>

              {/* Description / Role */}
              <div className="text-[11px] text-neutral-400 font-sans mt-3 text-left leading-relaxed">
                {p.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
