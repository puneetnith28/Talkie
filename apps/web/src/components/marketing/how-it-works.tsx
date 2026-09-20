'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Cpu, Phone, Radio, MessageSquare, Sparkles } from 'lucide-react';

export function MarketingHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeLang, setActiveLang] = useState<'ts' | 'py' | 'curl'>('ts');

  const steps = [
    {
      num: '01',
      title: 'Provision Number',
      desc: 'Instant carrier voice & SMS provisioning with global area codes.',
      badge: 'Telephony',
      icon: Phone,
      snippets: {
        ts: `// 1. Provision phone number via TypeScript SDK
const number = await talkie.numbers.provision({
  phoneNumber: '+14155550199',
  agentId: 'ag_voice_support',
  country: 'US',
  capabilities: ['voice', 'sms'],
});`,
        py: `# 1. Provision phone number via Python SDK
number = await talkie.numbers.provision(
    phone_number="+14155550199",
    agent_id="ag_voice_support",
    country="US",
    capabilities=["voice", "sms"]
)`,
        curl: `# 1. Provision phone number via cURL
curl -X POST https://api.talkie.ai/v1/numbers/provision \\
  -H "Authorization: Bearer $TALKIE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"phoneNumber": "+14155550199", "agentId": "ag_voice_support"}'`,
      },
    },
    {
      num: '02',
      title: 'Define Voice Persona',
      desc: 'Configure neural voice timbre, interruption sensitivity, & system prompt.',
      badge: 'Agent Studio',
      icon: Cpu,
      snippets: {
        ts: `// 2. Configure Agent Persona & LLM Prompt
const agent = await talkie.agents.create({
  name: 'Autonomous Billing Assistant',
  voiceProvider: 'elevenlabs',
  voiceId: 'rachel',
  temperature: 0.3,
  systemPrompt: 'You assist customers with invoice inquiries courteously.',
});`,
        py: `# 2. Configure Agent Persona & LLM Prompt
agent = await talkie.agents.create(
    name="Autonomous Billing Assistant",
    voice_provider="elevenlabs",
    voice_id="rachel",
    temperature=0.3,
    system_prompt="You assist customers with invoice inquiries courteously."
)`,
        curl: `# 2. Create voice agent via cURL
curl -X POST https://api.talkie.ai/v1/agents \\
  -H "Authorization: Bearer $TALKIE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Autonomous Billing Assistant", "voiceProvider": "elevenlabs", "voiceId": "rachel"}'`,
      },
    },
    {
      num: '03',
      title: 'Live Audio & Streams',
      desc: 'Stream live bidirectional audio with sub-300ms latency SSE transcripts.',
      badge: 'Real-Time PubSub',
      icon: Radio,
      snippets: {
        ts: `// 3. Subscribe to real-time call transcript stream (SSE)
const stream = talkie.realtime.streamCalls({ agentId: 'ag_voice_support' });

stream.on('transcript.turn', (event) => {
  console.log(\`[\${event.speaker}]: \${event.text} (latency: \${event.latencyMs}ms)\`);
});`,
        py: `# 3. Subscribe to real-time call transcript stream
async for event in talkie.realtime.stream_calls(agent_id="ag_voice_support"):
    if event.type == "transcript.turn":
        print(f"[{event.speaker}]: {event.text} (latency: {event.latency_ms}ms)")`,
        curl: `# 3. Stream real-time events over SSE
curl -N https://api.talkie.ai/v1/realtime/stream \\
  -H "Authorization: Bearer $TALKIE_API_KEY" \\
  -H "Accept: text/event-stream"`,
      },
    },
    {
      num: '04',
      title: 'Automate SMS & Hooks',
      desc: 'Dispatch HMAC-signed webhooks & instant post-call SMS confirmations.',
      badge: 'Omnichannel',
      icon: MessageSquare,
      snippets: {
        ts: `// 4. Send post-call confirmation SMS & trigger webhook
await talkie.messages.send({
  fromNumber: '+14155550199',
  toNumber: '+14155550142',
  body: 'Your appointment is confirmed for tomorrow at 10:00 AM EST.',
});`,
        py: `# 4. Send post-call confirmation SMS
await talkie.messages.send(
    from_number="+14155550199",
    to_number="+14155550142",
    body="Your appointment is confirmed for tomorrow at 10:00 AM EST."
)`,
        curl: `# 4. Send SMS message via cURL
curl -X POST https://api.talkie.ai/v1/messages \\
  -H "Authorization: Bearer $TALKIE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"fromNumber": "+14155550199", "toNumber": "+14155550142", "body": "Appointment confirmed"}'`,
      },
    },
  ];

  // Auto-cycle through the 4 steps every 5 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, steps.length]);

  const currentSnippet = steps[activeStep].snippets[activeLang];

  const copyCode = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 bg-[#050406] overflow-hidden">
      {/* Background ambient glowing gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-pink-600/[0.07] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer-First Telephony</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How Talkie Works in 4 Steps
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-3 font-normal">
            From provisioning carrier numbers to deploying autonomous voice pipelines in minutes.
          </p>
        </div>

        {/* 4 Steps in a Single Horizontal Line */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {steps.map((s, idx) => {
            const isActive = activeStep === idx;
            const Icon = s.icon;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900/90 border-pink-500/50 shadow-xl shadow-pink-500/10'
                    : 'bg-neutral-950/60 border-white/[0.08] hover:border-white/[0.18] hover:bg-neutral-900/40'
                }`}
              >
                {/* Active Step Linear Animated Progress Bar */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-pink-500/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-400"
                      style={{
                        animation: isPaused ? 'none' : 'growWidth 5s linear infinite',
                        width: isPaused ? '100%' : undefined,
                      }}
                    />
                  </div>
                )}

                {/* Top Row: Step Tag + Badge */}
                <div className="flex items-center justify-between mb-3 w-full">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                          : 'bg-white/[0.05] text-neutral-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-xs font-mono font-bold tracking-wider ${isActive ? 'text-pink-400' : 'text-neutral-500'}`}>
                      STEP {s.num}
                    </span>
                  </div>

                  <span className="text-[9px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] text-neutral-400 border border-white/[0.08]">
                    {s.badge}
                  </span>
                </div>

                {/* Step Title & Minimal Summary */}
                <div>
                  <h3 className={`text-sm sm:text-base font-bold tracking-tight mb-1.5 transition-colors ${isActive ? 'text-white' : 'text-neutral-300'}`}>
                    {s.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans line-clamp-2">
                    {s.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Full-Width Interactive Developer Terminal Below the 4 Steps */}
        <div
          className="w-full rounded-2xl sm:rounded-3xl bg-[#0b080d]/95 border border-white/[0.12] shadow-2xl backdrop-blur-2xl relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Top subtle pink glow */}
          <div className="absolute top-0 left-1/3 -translate-x-1/2 w-1/2 h-16 bg-pink-500/10 blur-xl pointer-events-none" />

          {/* Terminal Window Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-black/40 text-xs">
            {/* Left Window Controls + Step Indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/[0.1] text-neutral-300 font-semibold font-mono text-xs">
                <Terminal className="w-3.5 h-3.5 text-pink-400" />
                <span>talkie.{steps[activeStep].title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.execute()</span>
              </div>
            </div>

            {/* Right Controls: Language Selector + Copy Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher Tabs */}
              <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
                {(['ts', 'py', 'curl'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition uppercase ${
                      activeLang === lang
                        ? 'bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {lang === 'ts' ? 'TypeScript' : lang === 'py' ? 'Python' : 'cURL'}
                  </button>
                ))}
              </div>

              {/* Copy Code Button */}
              <button
                type="button"
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 hover:text-white transition text-xs font-medium border border-white/[0.1] active:scale-95 cursor-pointer"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-pink-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Terminal Code Body */}
          <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm text-neutral-200 leading-relaxed overflow-x-auto min-h-[160px] bg-black/20">
            <pre className="transition-opacity duration-200">
              <code>{currentSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
