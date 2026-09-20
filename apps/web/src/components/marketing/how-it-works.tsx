'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Cpu, Phone, Radio, MessageSquare } from 'lucide-react';

export function MarketingHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const steps = [
    {
      num: '01',
      title: 'Provision a Carrier Number',
      desc: 'Search US and Canada area codes and instantly bind numbers to your workspace in seconds.',
      badge: 'Telephony Engine',
      icon: Phone,
      codeSnippet: `// 1. Provision phone number via TypeScript SDK
const number = await talkie.numbers.provision({
  phoneNumber: '+14155550199',
  agentId: 'ag_medical_triage',
});`,
    },
    {
      num: '02',
      title: 'Define Voice Persona & Prompts',
      desc: 'Configure neural voice timbre, interruption sensitivity, greeting first sentence, and system persona instructions.',
      badge: 'Agent Studio',
      icon: Cpu,
      codeSnippet: `// 2. Configure Agent Persona & LLM Prompt
const agent = await talkie.agents.create({
  name: 'Customer Support Lead',
  voiceProvider: 'elevenlabs',
  voiceId: 'rachel',
  systemPrompt: 'You assist users with billing queries efficiently.',
});`,
    },
    {
      num: '03',
      title: 'Receive Calls & Real-Time Streams',
      desc: 'When inbound calls ring, Talkie handles SIP audio, streams live transcript SSE events, and auto-records audio.',
      badge: 'Real-Time PubSub',
      icon: Radio,
      codeSnippet: `// 3. Listen to live call transcript stream (SSE)
const eventSource = new EventSource('/api/v1/realtime');
eventSource.addEventListener('call.transcript.turn', (e) => {
  const turn = JSON.parse(e.data);
  console.log(\`[\${turn.speaker}]: \${turn.text}\`);
});`,
    },
    {
      num: '04',
      title: 'Automate Omnichannel SMS & Webhooks',
      desc: 'Trigger follow-up text messages, sync CRM contacts, and dispatch HMAC-signed webhooks to your servers.',
      badge: 'Omnichannel & Webhooks',
      icon: MessageSquare,
      codeSnippet: `// 4. Send post-call SMS confirmation
await talkie.messages.send({
  fromNumber: '+14155550199',
  toNumber: '+14155550142',
  body: 'Your booking has been confirmed for tomorrow at 10:00 AM.',
});`,
    },
  ];

  // Auto-cycle through the 4 steps every 4.5 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, steps.length]);

  const copyCode = () => {
    navigator.clipboard.writeText(steps[activeStep].codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
          Carrier-Grade Architecture
        </h2>
        <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          How Talkie Powers Autonomous Voice
        </h3>
        <p className="text-sm text-zinc-400 mt-3">
          Four simple steps to bring interactive voice calling and omnichannel SMS into your agent workflows.
        </p>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Step selector list */}
        <div className="lg:col-span-5 space-y-3.5">
          {steps.map((s, idx) => {
            const isActive = activeStep === idx;
            const Icon = s.icon;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden block cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 border-blue-500/60 shadow-xl shadow-blue-500/10'
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50'
                }`}
              >
                {/* Active Step Animated Progress Bar */}
                {isActive && !isPaused && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-400"
                      style={{
                        animation: 'growWidth 4.5s linear infinite',
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <span className={`text-xs font-mono font-bold ${isActive ? 'text-blue-400' : 'text-zinc-500'}`}>
                      STEP {s.num}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {s.badge}
                  </span>
                </div>

                <div className={`text-base font-bold mb-1 tracking-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                  {s.title}
                </div>
                <div className="text-xs text-zinc-400 leading-relaxed font-normal">{s.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Code Snippet Box */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient terminal top light */}
            <div className="absolute top-0 right-1/4 w-40 h-20 bg-blue-500/10 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4 text-zinc-400 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/70 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />
                <div className="flex items-center gap-1.5 ml-2 text-zinc-300 font-semibold text-xs">
                  <Terminal className="size-3.5 text-blue-400" />
                  <span>{steps[activeStep].title}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-500 font-mono">TypeScript SDK</span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition text-xs border border-zinc-750 cursor-pointer"
                >
                  {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3 text-zinc-400" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <pre className="font-mono text-xs text-zinc-200 leading-loose overflow-x-auto min-h-[140px] p-2 bg-zinc-900/40 rounded-xl border border-zinc-850 transition-all duration-300">
              <code>{steps[activeStep].codeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
