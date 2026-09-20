import React from 'react';
import Link from 'next/link';
import { AgentForm } from '@/components/agents/agent-form';
import { ArrowLeft, Bot } from 'lucide-react';

export default function NewAgentPage() {
  return (
    <div className="space-y-6">
      {/* Header Breadcrumb */}
      <div>
        <Link
          href="/dashboard/agents"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Agents</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Voice Agent</h1>
            <p className="text-sm text-neutral-400">
              Configure personality, system prompt, and synthesis parameters
            </p>
          </div>
        </div>
      </div>

      {/* Main Agent Creation Form */}
      <AgentForm />
    </div>
  );
}
