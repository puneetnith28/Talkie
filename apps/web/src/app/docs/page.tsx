'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@talkie/ui';
import { BookOpen, Key, Terminal, Code2, Copy, Check, ArrowLeft, Bot, Phone, MessageSquare, PhoneCall, Webhook } from 'lucide-react';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/agents',
    title: 'List Agents',
    description: 'Retrieve all AI voice and messaging agents in the workspace.',
    curl: `curl -X GET "http://localhost:3000/api/v1/agents" \\\n  -H "Authorization: Bearer tk_live_your_api_key"`,
    ts: `const agents = await client.agents.list();`,
    py: `agents = client.agents.list()`,
  },
  {
    method: 'POST',
    path: '/api/v1/messages',
    title: 'Send Outbound SMS',
    description: 'Dispatch an outbound SMS/MMS message to a recipient with auto-conversation threading.',
    curl: `curl -X POST "http://localhost:3000/api/v1/messages" \\\n  -H "Authorization: Bearer tk_live_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"from": "+14155550100", "to": "+14155550199", "body": "Hello from Talkie!"}'`,
    ts: `const msg = await client.messages.send({\n  from: "+14155550100",\n  to: "+14155550199",\n  body: "Hello from Talkie!"\n});`,
    py: `msg = client.messages.send(\n    from_number="+14155550100",\n    to_number="+14155550199",\n    body="Hello from Talkie!"\n)`,
  },
  {
    method: 'POST',
    path: '/api/v1/calls',
    title: 'Initiate Outbound Call',
    description: 'Start an automated outbound AI voice call connected to an agent.',
    curl: `curl -X POST "http://localhost:3000/api/v1/calls" \\\n  -H "Authorization: Bearer tk_live_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"agentId": "agent_123", "from": "+14155550100", "to": "+14155550199"}'`,
    ts: `const call = await client.calls.create({\n  agentId: "agent_123",\n  from: "+14155550100",\n  to: "+14155550199"\n});`,
    py: `call = client.calls.create(\n    agent_id="agent_123",\n    from_number="+14155550100",\n    to_number="+14155550199"\n)`,
  },
  {
    method: 'POST',
    path: '/api/v1/webhooks',
    title: 'Create Webhook Endpoint',
    description: 'Subscribe to real-time HMAC-signed event callbacks.',
    curl: `curl -X POST "http://localhost:3000/api/v1/webhooks" \\\n  -H "Authorization: Bearer tk_live_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"url": "https://api.myapp.com/webhooks", "events": ["call.ended"]}'`,
    ts: `const webhook = await client.webhooks.create({\n  url: "https://api.myapp.com/webhooks",\n  events: ["call.ended"]\n});`,
    py: `webhook = client.webhooks.create(\n    url="https://api.myapp.com/webhooks",\n    events=["call.ended"]\n)`,
  },
];

export default function DocsPage() {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'ts' | 'py'>('curl');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-200">
      {/* Docs Header */}
      <header className="h-16 px-8 border-b border-white/[0.08] flex items-center justify-between bg-[#0a0c10]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-neutral-400 hover:text-white flex items-center gap-1.5 text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/[0.1]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              T
            </div>
            <span className="font-bold text-white text-sm tracking-tight">Talkie Developer API v1</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/60 p-1 rounded-xl border border-white/[0.08]">
          {(['curl', 'ts', 'py'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-all ${
                selectedLang === lang
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {lang === 'ts' ? 'TypeScript' : lang === 'py' ? 'Python' : 'cURL'}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-8 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">REST API & SDK Reference</h1>
          <p className="text-neutral-400 text-sm max-w-2xl">
            Integrate carrier-grade telephony, real-time AI voice agents, and omnichannel messaging into your applications.
          </p>
        </div>

        {/* Quick Start Card */}
        <Card className="p-6 bg-[#0a0c10] border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Authentication</span>
          </div>
          <p className="text-xs text-neutral-400">
            Pass your API key in the <code className="text-emerald-400 font-mono">Authorization</code> HTTP header:
          </p>
          <div className="p-3 rounded-xl bg-black/60 border border-white/[0.06] font-mono text-xs text-neutral-300">
            Authorization: Bearer tk_live_••••••••••••••••
          </div>
        </Card>

        {/* Endpoints List */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Core Endpoints</h2>
          <div className="space-y-6">
            {ENDPOINTS.map((ep, idx) => {
              const codeSnippet = ep[selectedLang];

              return (
                <Card key={ep.path} className="p-6 bg-[#0a0c10] border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Badge
                        variant={ep.method === 'GET' ? 'neutral' : 'success'}
                        className="font-mono text-[10px] uppercase font-bold"
                      >
                        {ep.method}
                      </Badge>
                      <span className="font-mono text-sm font-semibold text-white">{ep.path}</span>
                    </div>
                    <span className="text-xs text-neutral-400 font-medium">{ep.title}</span>
                  </div>

                  <p className="text-xs text-neutral-400">{ep.description}</p>

                  <div className="relative group">
                    <pre className="p-4 rounded-xl bg-black/60 border border-white/[0.06] font-mono text-xs text-neutral-300 overflow-x-auto">
                      {codeSnippet}
                    </pre>
                    <button
                      onClick={() => copyCode(codeSnippet, idx)}
                      className="absolute right-3 top-3 p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-all"
                      title="Copy snippet"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
