import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@talkie/database';
import { AgentHeader } from '@/components/agents/agent-header';
import { AgentConfigTab } from '@/components/agents/agent-config-tab';
import { AgentSimulator } from '@/components/agents/agent-simulator';
import { Card, Badge, Button } from '@talkie/ui';
import { Phone, MessageSquare, PhoneCall, Sparkles, Settings2, Play, Activity } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function AgentDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab = 'overview' } = await searchParams;

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      phoneNumbers: true,
      calls: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      conversations: {
        take: 10,
        orderBy: { lastMessageAt: 'desc' },
      },
    },
  });

  if (!agent) {
    notFound();
  }

  const activeTab = tab;

  return (
    <div className="space-y-8">
      {/* Header */}
      <AgentHeader agent={agent} />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-px">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'config', label: 'Configuration', icon: Settings2 },
          { id: 'test', label: 'Live Test', icon: Play },
          { id: 'calls', label: `Calls (${agent.calls.length})`, icon: PhoneCall },
          { id: 'messages', label: `Messages (${agent.conversations.length})`, icon: MessageSquare },
        ].map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <Link
              key={t.id}
              href={`/dashboard/agents/${agent.id}?tab=${t.id}`}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/[0.04]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-white/[0.1]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-5 bg-card border-white/[0.08] space-y-2">
              <span className="text-xs text-neutral-400 font-medium">Total Calls</span>
              <div className="text-2xl font-bold text-white">{agent.calls.length}</div>
            </Card>

            <Card className="p-5 bg-card border-white/[0.08] space-y-2">
              <span className="text-xs text-neutral-400 font-medium">Conversations</span>
              <div className="text-2xl font-bold text-white">{agent.conversations.length}</div>
            </Card>

            <Card className="p-5 bg-card border-white/[0.08] space-y-2">
              <span className="text-xs text-neutral-400 font-medium">Voice Model</span>
              <div className="text-sm font-semibold text-emerald-400 font-mono mt-1">
                {agent.voice}
              </div>
            </Card>

            <Card className="p-5 bg-card border-white/[0.08] space-y-2">
              <span className="text-xs text-neutral-400 font-medium">Latency Profile</span>
              <div className="text-sm font-semibold text-white font-mono mt-1">
                &lt; 450ms (Turn)
              </div>
            </Card>
          </div>

          {/* Quick Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-card border-white/[0.08] lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="font-semibold text-sm text-white">System Prompt</h3>
                <span className="text-xs text-neutral-400 font-mono">
                  ~{Math.round(agent.systemPrompt.length / 4)} tokens
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-mono leading-relaxed bg-[#0a0c10] p-4 rounded-lg border border-white/[0.06] whitespace-pre-wrap">
                {agent.systemPrompt}
              </p>
            </Card>

            <Card className="p-6 bg-card border-white/[0.08] space-y-4">
              <div className="border-b border-white/[0.08] pb-3">
                <h3 className="font-semibold text-sm text-white">Assigned Numbers</h3>
              </div>
              {agent.phoneNumbers.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Phone className="w-6 h-6 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-400">No phone numbers assigned</p>
                  <Link href="/dashboard/numbers">
                    <Button size="sm" variant="outline" className="text-xs mt-2">
                      Attach a Number
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {agent.phoneNumbers.map((num) => (
                    <div
                      key={num.id}
                      className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                    >
                      <span className="font-mono text-xs text-white">{num.phoneNumber}</span>
                      <Badge variant="success" className="text-[10px]">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Configuration */}
      {activeTab === 'config' && <AgentConfigTab agent={agent} />}

      {/* Tab: Live Test */}
      {activeTab === 'test' && <AgentSimulator agent={agent} />}

      {/* Tab: Calls */}
      {activeTab === 'calls' && (
        <Card className="p-6 bg-card border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-semibold text-sm text-white">Recent Calls for {agent.name}</h3>
          </div>
          {agent.calls.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">No call logs recorded yet.</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {agent.calls.map((call) => (
                <div key={call.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-white">{call.fromNumber}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {call.direction}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-neutral-400">{call.summary || 'In progress call turn'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400">{call.durationSeconds}s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab: Messages */}
      {activeTab === 'messages' && (
        <Card className="p-6 bg-card border-white/[0.08] space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <h3 className="font-semibold text-sm text-white">SMS Conversations for {agent.name}</h3>
          </div>
          {agent.conversations.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">No SMS conversations recorded yet.</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {agent.conversations.map((conv) => (
                <div key={conv.id} className="py-3 flex items-center justify-between text-xs">
                  <span className="font-mono text-white">{conv.channel.toUpperCase()} Thread</span>
                  <span className="text-neutral-400">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
