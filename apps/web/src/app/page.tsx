import React from 'react';
import { Button } from '@talkie/ui';
import { Phone, MessageSquare, Bot, Terminal, Shield, Zap, Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#08090b] text-white selection:bg-emerald-500/20 selection:text-emerald-400 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/10 blur-[140px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#08090b]/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              T
            </div>
            <span className="font-semibold text-lg tracking-tight">Talkie</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
              v1.0
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="/docs" className="hover:text-white transition-colors">Documentation</a>
            <a href="/dashboard" className="hover:text-white transition-colors">Console</a>
          </nav>

          <div className="flex items-center gap-3">
            <a href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </a>
            <a href="/dashboard">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Carrier-Grade AI Telephony & Messaging Engine</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent">
            Build Conversational AI Phone Agents in Minutes
          </h1>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Programmable voice calling, ultra-low latency speech pipelines, SMS & MMS messaging, and multi-tenant workspace orchestration — built for developers.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a href="/dashboard">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_30px_rgba(16,185,129,0.35)] px-8">
                Launch Console
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <a href="/docs">
              <Button size="lg" variant="outline" className="px-8">
                View API Docs
              </Button>
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/30 transition-all hover:bg-white/[0.03] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white">Voice AI State Machine</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Ultra-low latency STT, prompt context management, streaming LLM turns, real-time barge-in cancellation, and TTS synthesis.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/30 transition-all hover:bg-white/[0.03] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white">Omnichannel Messaging</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Bidirectional SMS and MMS routing with automatic conversation clustering, delivery receipts, and webhook notification triggers.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/30 transition-all hover:bg-white/[0.03] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white">Developer Platform & MCP</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Model Context Protocol (MCP) server, REST API v1 with HMAC signing, TypeScript SDK, Python SDK, and instant CLI tools.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
