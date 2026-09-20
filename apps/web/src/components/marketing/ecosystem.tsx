'use client';

import React from 'react';

interface Partner {
  name: string;
  role: string;
  category: string;
  iconBg: string;
  iconBorder: string;
  icon: React.ReactNode;
}

const PARTNERS: Partner[] = [
  {
    name: 'Deepgram',
    role: 'Sub-300ms Speech-to-Text',
    category: 'STT Audio Engine',
    iconBg: 'bg-[#13EF93]/10',
    iconBorder: 'border-[#13EF93]/25',
    icon: (
      <svg className="w-5 h-5 text-[#13EF93]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3.5 6C3.5 4.61929 4.61929 3.5 6 3.5H12C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5H6C4.61929 20.5 3.5 19.3807 3.5 18V6Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8 8H12C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16H8V8Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: 'ElevenLabs',
    role: 'Ultra-realistic Neural Voice',
    category: 'TTS Synthesis',
    iconBg: 'bg-white/10',
    iconBorder: 'border-white/20',
    icon: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="3.5" width="3.2" height="17" rx="1.6" fill="currentColor" />
        <rect x="13.8" y="3.5" width="3.2" height="17" rx="1.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Anthropic Claude',
    role: 'Low-latency Reasoning Engine',
    category: 'LLM Orchestration',
    iconBg: 'bg-[#CC785C]/15',
    iconBorder: 'border-[#CC785C]/30',
    icon: (
      <svg className="w-5 h-5 text-[#CC785C]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.84 3.5L18.5 20.5H14.88L13.84 16.38H8.56L7.52 20.5H3.9L8.56 3.5H13.84ZM12.78 12.82L11.2 6.84L9.62 12.82H12.78Z" />
      </svg>
    ),
  },
  {
    name: 'OpenAI GPT-4o',
    role: 'Conversational Intelligence',
    category: 'Multimodal Models',
    iconBg: 'bg-[#10A37F]/15',
    iconBorder: 'border-[#10A37F]/30',
    icon: (
      <svg className="w-5 h-5 text-[#10A37F]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20.5 10.1a4.9 4.9 0 0 0-.4-3.7 5.1 5.1 0 0 0-4.6-2.5 5 5 0 0 0-1.8.3 5 5 0 0 0-3.6-1.6 5.1 5.1 0 0 0-4.9 3.5 5 5 0 0 0-3.1 2.3 5.1 5.1 0 0 0-.5 4.3 5 5 0 0 0 .4 3.7 5.1 5.1 0 0 0 4.6 2.5 5 5 0 0 0 1.8-.3 5 5 0 0 0 3.6 1.6 5.1 5.1 0 0 0 4.9-3.5 5 5 0 0 0 3.1-2.3 5.1 5.1 0 0 0 .5-4.3ZM12 13.5a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 4v4m0 8v4m-6.9-10 3.5 2m6.8 4 3.5 2m-13.8 0 3.5-2m6.8-4 3.5-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Model Context Protocol',
    role: 'Native MCP Server Integration',
    category: 'Tool & Data Protocol',
    iconBg: 'bg-[#FF6B4A]/15',
    iconBorder: 'border-[#FF6B4A]/30',
    icon: (
      <svg className="w-5 h-5 text-[#FF6B4A]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
        <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
        <path d="M10 6.5H14M17.5 10V14M14 17.5H10M6.5 14V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Stripe',
    role: 'Real-time Metered Invoicing',
    category: 'Billing Infrastructure',
    iconBg: 'bg-[#635BFF]/15',
    iconBorder: 'border-[#635BFF]/30',
    icon: (
      <svg className="w-5 h-5 text-[#635BFF]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-4.329C17.587 1.986 15.143 1.5 12.38 1.5c-4.482 0-7.518 2.378-7.518 6.376 0 4.968 6.843 5.234 6.843 7.925 0 1.054-.932 1.528-2.278 1.528-2.023 0-5.011-1.042-6.93-2.091L1.5 19.664C3.593 20.84 6.84 21.5 9.878 21.5c4.78 0 7.822-2.316 7.822-6.499 0-5.277-3.724-5.851-3.724-5.851Z" />
      </svg>
    ),
  },
  {
    name: 'Groq',
    role: 'Ultra-fast LPU Inference',
    category: 'Low-latency Compute',
    iconBg: 'bg-[#F55036]/15',
    iconBorder: 'border-[#F55036]/30',
    icon: (
      <svg className="w-5 h-5 text-[#F55036]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="4.5" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12L12 8L16 12L12 16L8 12Z" fill="currentColor" />
        <circle cx="12" cy="12" r="1.8" fill="#070508" />
      </svg>
    ),
  },
  {
    name: 'Twilio',
    role: 'Tier-1 Carrier Voice Trunking',
    category: 'Global Telephony',
    iconBg: 'bg-[#F22F46]/15',
    iconBorder: 'border-[#F22F46]/30',
    icon: (
      <svg className="w-5 h-5 text-[#F22F46]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="9" cy="9" r="2.2" />
        <circle cx="15" cy="9" r="2.2" />
        <circle cx="9" cy="15" r="2.2" />
        <circle cx="15" cy="15" r="2.2" />
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
              {/* Header: Authentic Colored Icon + Name */}
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${p.iconBg} border ${p.iconBorder} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200`}>
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
