'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2, Sparkles } from 'lucide-react';
import { GridBackground, GlowBackground } from '@talkie/ui';

export function CodeShowcase() {
  const [activeTab, setActiveTab] = useState<'ts' | 'py' | 'mcp' | 'curl'>('ts');
  const [copied, setCopied] = useState(false);

  const tabs: Array<{ id: 'ts' | 'py' | 'mcp' | 'curl'; label: string; lang: string }> = [
    { id: 'ts', label: 'TypeScript / JS', lang: 'typescript' },
    { id: 'py', label: 'Python SDK', lang: 'python' },
    { id: 'mcp', label: 'MCP Config', lang: 'json' },
    { id: 'curl', label: 'cURL REST', lang: 'bash' },
  ];

  const snippets = {
    ts: `import { TalkieClient } from '@talkie/sdk';

const talkie = new TalkieClient({
  apiKey: process.env.TALKIE_API_KEY!,
});

// Trigger an outbound AI voice call with custom persona
const call = await talkie.calls.create({
  agentId: 'ag_concierge_01',
  fromNumber: '+14155550199',
  toNumber: '+14155550142',
});

console.log('Call initiated:', call.id);`,
    py: `from talkie import TalkieClient

client = TalkieClient(api_key="tk_live_your_api_key")

# Provision a phone number & attach AI agent
number = client.numbers.provision(
    phone_number="+14155550199",
    agent_id="ag_sales_rep"
)

# Send an outbound SMS message
msg = client.messages.send(
    from_number="+14155550199",
    to_number="+14155550100",
    body="Hello from Talkie Python SDK!"
)
print("Message status:", msg.status)`,
    mcp: `{
  "mcpServers": {
    "talkie": {
      "command": "npx",
      "args": ["-y", "@talkie/mcp-server"],
      "env": {
        "TALKIE_API_KEY": "tk_live_your_api_key_here"
      }
    }
  }
}`,
    curl: `curl -X POST https://api.talkie.ai/v1/calls \\
  -H "Authorization: Bearer tk_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "ag_support_triage",
    "fromNumber": "+14155550199",
    "toNumber": "+14155550142"
  }'`,
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code" className="relative py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* Terminal Grid Background Overlay */}
      <GridBackground size={28} variant="telephony" mask="radial" opacity={0.45} />
      <GlowBackground position="top-right" variant="cyan" size={600} blur={160} opacity={0.15} />

      <div className="relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
            Developer-First Integration
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Built for Developers, SDKs & MCP
          </h3>
          <p className="text-sm text-zinc-400 mt-2 font-normal">
            Native TypeScript and Python client packages, full Model Context Protocol server, and standard REST v1 endpoints.
          </p>
        </div>

      <div className="max-w-4xl mx-auto rounded-3xl bg-zinc-950 border border-zinc-800/90 shadow-2xl overflow-hidden relative backdrop-blur-2xl">
        {/* Subtle top glow highlight */}
        <div className="absolute top-0 right-1/3 w-60 h-24 bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Tab Headers */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 px-5 py-3 bg-zinc-900/70 gap-3">
          {/* Action dots & language tabs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
              {tabs.map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/25'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Copy snippet button */}
          <button
            onClick={handleCopy}
            className="text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 bg-zinc-800/90 hover:bg-zinc-750 px-3 py-1.5 rounded-xl border border-zinc-700/60 active:scale-95 cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied snippet</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-zinc-400" />
                <span>Copy snippet</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 font-mono text-xs overflow-x-auto text-zinc-200 leading-relaxed min-h-[240px] bg-zinc-950/90">
          <pre className="transition-all duration-200">
            <code>{snippets[activeTab]}</code>
          </pre>
        </div>
      </div>
    </div>
  </section>
);
}
