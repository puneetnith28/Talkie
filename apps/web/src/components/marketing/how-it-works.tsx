'use client';

import React, { useState } from 'react';

export function MarketingHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Provision a Carrier Number',
      desc: 'Search US and Canada area codes and instantly bind numbers to your workspace in seconds.',
      badge: 'Telephony Engine',
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
      codeSnippet: `// 2. Configure Agent Persona
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
      codeSnippet: `// 3. Listen to live call transcript stream
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
      codeSnippet: `// 4. Send post-call SMS confirmation
await talkie.messages.send({
  fromNumber: '+14155550199',
  toNumber: callerNumber,
  body: 'Your booking has been confirmed for tomorrow at 10:00 AM.',
});`,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Step selector list */}
        <div className="lg:col-span-5 space-y-3">
          {steps.map((s, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-5 rounded-2xl border transition duration-200 block ${
                  isActive
                    ? 'bg-zinc-900 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-mono font-bold ${isActive ? 'text-blue-400' : 'text-zinc-500'}`}>
                    STEP {s.num}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {s.badge}
                  </span>
                </div>
                <div className="text-base font-bold text-white mb-1">{s.title}</div>
                <div className="text-xs text-zinc-400 leading-relaxed">{s.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Code Snippet Box */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl font-mono text-xs overflow-x-auto relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 text-zinc-500 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="ml-2 text-zinc-400 font-sans font-semibold">
                  {steps[activeStep].title}
                </span>
              </div>
              <span>TypeScript SDK</span>
            </div>

            <pre className="text-zinc-200 leading-loose">
              <code>{steps[activeStep].codeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
