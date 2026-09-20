'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Badge } from '@talkie/ui';
import { Bot, Phone, Play, Copy, Trash2, ArrowLeft, Check } from 'lucide-react';

interface AgentHeaderProps {
  agent: any;
  onOpenTest?: () => void;
}

export function AgentHeader({ agent, onOpenTest }: AgentHeaderProps) {
  const router = useRouter();
  const [cloning, setCloning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleClone = async () => {
    setCloning(true);
    try {
      const res = await fetch('/api/v1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${agent.name} (Copy)`,
          description: agent.description,
          voiceMode: agent.voiceMode,
          webhookUrl: agent.webhookUrl,
          systemPrompt: agent.systemPrompt,
          beginMessage: agent.beginMessage,
          voice: agent.voice,
          voiceSpeed: agent.voiceSpeed,
          interruptionSensitivity: agent.interruptionSensitivity,
        }),
      });
      const data = await res.json();
      if (data.data?.id) {
        router.push(`/dashboard/agents/${data.data.id}`);
      }
    } finally {
      setCloning(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete agent "${agent.name}"?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/v1/agents/${agent.id}`, { method: 'DELETE' });
      router.push('/dashboard/agents');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/agents"
        className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Agents</span>
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Bot className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{agent.name}</h1>
              <Badge
                variant={agent.status === 'active' ? 'success' : 'neutral'}
                className="text-[10px] uppercase font-mono"
              >
                {agent.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-neutral-400">
              <span className="font-mono text-neutral-300">ID: {agent.id}</span>
              <span>•</span>
              <span className="font-mono text-emerald-400">{agent.voice}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-neutral-500" />
                <span>
                  {agent.phoneNumbers?.length > 0
                    ? agent.phoneNumbers[0].phoneNumber
                    : 'No phone number attached'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClone}
            disabled={cloning}
            className="gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{cloning ? 'Cloning...' : 'Clone'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-1.5 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>

          {onOpenTest && (
            <Button
              type="button"
              size="sm"
              onClick={onOpenTest}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Agent</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
