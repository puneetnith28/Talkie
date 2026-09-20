import React from 'react';
import Link from 'next/link';
import { prisma } from '@talkie/database';
import { Button, Card, Badge } from '@talkie/ui';
import { Bot, Plus, Phone, Sparkles, Settings2, Play } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const workspace = await prisma.workspace.findFirst({
    where: { slug: 'talkie-demo' },
  });

  const agents = workspace
    ? await prisma.agent.findMany({
        where: { workspaceId: workspace.id },
        include: { phoneNumbers: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Voice Agents</h1>
          <p className="text-sm text-neutral-400">
            Create, tune, and assign conversational agents to phone numbers
          </p>
        </div>

        <Link href="/dashboard/agents/new">
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Agent
          </Button>
        </Link>
      </div>

      {/* Agents Grid */}
      {agents.length === 0 ? (
        <Card className="p-12 text-center bg-card border-white/[0.08] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-white">No agents created yet</h2>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto">
            Get started by creating your first AI phone agent with customized prompts and voices.
          </p>
          <Link href="/dashboard/agents/new">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium mt-2">
              <Plus className="w-4 h-4 mr-1" />
              Create First Agent
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="p-6 bg-card border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold group-hover:scale-105 transition-transform">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-base text-white">{agent.name}</h2>
                      <span className="text-xs text-neutral-400 font-mono">{agent.voice}</span>
                    </div>
                  </div>
                  <Badge
                    variant={agent.status === 'active' ? 'success' : 'neutral'}
                    className="text-[10px] uppercase font-mono"
                  >
                    {agent.status}
                  </Badge>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {agent.description || agent.systemPrompt}
                </p>

                <div className="pt-2 flex items-center gap-4 text-xs text-neutral-400 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-500" />
                    <span>
                      {agent.phoneNumbers.length > 0
                        ? agent.phoneNumbers[0].phoneNumber
                        : 'No number'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{agent.voiceMode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <Link href={`/dashboard/agents/${agent.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Configure</span>
                  </Button>
                </Link>

                <Link href={`/dashboard/agents/${agent.id}?tab=test`}>
                  <Button size="sm" className="bg-white/[0.06] hover:bg-emerald-500/20 hover:text-emerald-400 text-white gap-1.5">
                    <Play className="w-3 h-3" />
                    <span>Test</span>
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
