'use client';

import React, { useState } from 'react';

export function CodeShowcase() {
  const [activeTab, setActiveTab] = useState<'ts' | 'py' | 'mcp' | 'curl'>('ts');
  const [copied, setCopied] = useState(false);

  const snippets = {
    ts: `import { TalkieClient } from '@talkie/sdk';

const talkie = new TalkieClient({
  apiKey: process.env.TALKIE_API_KEY!,
});

// Trigger an outbound AI voice call
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
)`,
    mcp: `{
  "mcpServers": {
    "talkie": {
      "command": "npx",
      "args": ["-y", "@talkie/mcp-server"],
      "env": {
        "TALKIE_API_KEY": "tk_live_..."
      }
    }
  }
}`,
    curl: `curl -X POST https://api.talkie.ai/v1/calls \\
  -H "Authorization: Bearer tk_live_..." \\
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
    <section id="code" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
          Developer-First Integration
        </h2>
        <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Built for Developers, SDKs & MCP
        </h3>
        <p className="text-sm text-zinc-400 mt-2">
          Native TypeScript and Python client packages, full Model Context Protocol server, and standard REST v1 endpoints.
        </p>
      </div>

      <div className="max-w-4xl mx-auto rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3 bg-zinc-900/60">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('ts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'ts' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              TypeScript / JS
            </button>
            <button
              onClick={() => setActiveTab('py')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'py' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Python SDK
            </button>
            <button
              onClick={() => setActiveTab('mcp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'mcp' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              MCP Config
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'curl' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              cURL REST
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="text-xs text-zinc-400 hover:text-white font-mono transition flex items-center gap-1.5 bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700/60"
          >
            {copied ? '✓ Copied' : 'Copy snippet'}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 font-mono text-xs overflow-x-auto text-zinc-200 leading-relaxed min-h-[220px]">
          <pre>
            <code>{snippets[activeTab]}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
