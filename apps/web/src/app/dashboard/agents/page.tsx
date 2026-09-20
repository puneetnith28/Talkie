'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, Badge, EmptyState, CardSkeleton } from '@talkie/ui';
import {
  Bot,
  Plus,
  Phone,
  Sparkles,
  Settings2,
  Play,
  Search,
  Power,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description?: string | null;
  voiceMode: string;
  webhookUrl?: string | null;
  systemPrompt: string;
  voice: string;
  language: string;
  status: string;
  phoneNumbers?: Array<{ id: string; phoneNumber: string }>;
  createdAt: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/v1/agents');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAgents(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch agents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleToggleStatus = async (agent: Agent) => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    setActionLoadingId(agent.id);

    // Optimistic update
    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, status: newStatus } : a))
    );

    try {
      const res = await fetch(`/api/v1/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
    } catch (err) {
      console.error('Error toggling agent status:', err);
      // Revert on error
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, status: agent.status } : a))
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAgent = async (agentId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setActionLoadingId(agentId);
    const previous = [...agents];
    setAgents((prev) => prev.filter((a) => a.id !== agentId));

    try {
      const res = await fetch(`/api/v1/agents/${agentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete agent');
    } catch (err) {
      console.error('Error deleting agent:', err);
      setAgents(previous);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.voice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">AI Voice Studio</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Create, tune, and assign conversational agents to phone numbers
          </p>
        </div>

        <Link href="/dashboard/agents/new">
          <Button
            size="sm"
            className="w-full sm:w-auto text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Agent</span>
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by name, voice model..."
            className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/40 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-black/40 border border-white/[0.08] p-1">
            {(['all', 'active', 'paused'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                  statusFilter === st
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchAgents}
            title="Refresh agents"
            className="p-2 rounded-xl bg-black/40 border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.2] transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredAgents.length === 0 ? (
        <EmptyState
          icon={<Bot className="w-6 h-6 text-emerald-400" />}
          title={searchQuery || statusFilter !== 'all' ? 'No matching agents' : 'No agents created yet'}
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try changing your search keywords or status filter.'
              : 'Get started by creating your first conversational voice agent with low-latency LLM pipeline.'
          }
          action={
            !searchQuery && statusFilter === 'all'
              ? {
                  label: 'Create First Agent',
                  onClick: () => (window.location.href = '/dashboard/agents/new'),
                  icon: <Plus className="w-3.5 h-3.5" />,
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const hasPhone = agent.phoneNumbers && agent.phoneNumbers.length > 0;
            const isProcessing = actionLoadingId === agent.id;

            return (
              <Card
                key={agent.id}
                className="p-6 bg-[#0a0c10] border-white/[0.08] hover:border-white/[0.2] transition-all flex flex-col justify-between group space-y-5 shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold group-hover:scale-105 transition-transform shrink-0">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <h2 className="font-semibold text-base text-white truncate">{agent.name}</h2>
                        <span className="text-xs text-neutral-400 font-mono">{agent.voice}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleToggleStatus(agent)}
                      title={`Click to ${agent.status === 'active' ? 'pause' : 'activate'}`}
                      className="shrink-0"
                    >
                      <Badge
                        variant={agent.status === 'active' ? 'success' : 'neutral'}
                        className="text-[10px] uppercase font-mono cursor-pointer hover:opacity-80 transition"
                      >
                        {agent.status}
                      </Badge>
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {agent.description || agent.systemPrompt}
                  </p>

                  <div className="pt-3 flex items-center justify-between text-xs text-neutral-400 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{hasPhone ? agent.phoneNumbers![0].phoneNumber : 'No line attached'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="capitalize">{agent.voiceMode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] gap-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/agents/${agent.id}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5">
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>Configure</span>
                      </Button>
                    </Link>

                    <Link href={`/dashboard/agents/${agent.id}?tab=test`}>
                      <Button
                        size="sm"
                        className="text-xs bg-white/[0.06] hover:bg-emerald-500/20 hover:text-emerald-400 text-white gap-1.5 transition"
                      >
                        <Play className="w-3 h-3" />
                        <span>Simulate</span>
                      </Button>
                    </Link>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDeleteAgent(agent.id, agent.name)}
                    title="Delete Agent"
                    className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
