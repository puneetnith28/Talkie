'use client';

import React, { useState } from 'react';
import { Button, Input, Card, Badge } from '@talkie/ui';
import { PromptEditor } from './prompt-editor';
import { Save, Volume2, Bot, Sparkles, Check, AlertCircle } from 'lucide-react';

interface AgentConfigTabProps {
  agent: any;
  onUpdate?: (updated: any) => void;
}

const VOICES = [
  { id: 'aura-aarav-in', name: 'Aarav (Male)', accent: 'Indian English', provider: 'Aura', style: 'Confident & Crisp' },
  { id: 'aura-priya-in', name: 'Priya (Female)', accent: 'Indian English', provider: 'Aura', style: 'Warm & Professional' },
  { id: 'aura-ananya-in', name: 'Ananya (Female)', accent: 'Hindi / Indian English', provider: 'Aura', style: 'Friendly & Engaging' },
  { id: 'aura-rohan-in', name: 'Rohan (Male)', accent: 'Hindi / Indian English', provider: 'Aura', style: 'Articulate & Calm' },
  { id: 'aura-aditi-in', name: 'Aditi (Female)', accent: 'Indian English', provider: 'Deepgram', style: 'Natural & Expressive' },
  { id: 'alloy', name: 'Alloy (Neutral)', accent: 'Global English', provider: 'OpenAI', style: 'Balanced' },
];

export function AgentConfigTab({ agent, onUpdate }: AgentConfigTabProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(agent.name || '');
  const [description, setDescription] = useState(agent.description || '');
  const [voiceMode, setVoiceMode] = useState(agent.voiceMode || 'hosted');
  const [webhookUrl, setWebhookUrl] = useState(agent.webhookUrl || '');
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt || '');
  const [beginMessage, setBeginMessage] = useState(agent.beginMessage || '');
  const [voice, setVoice] = useState(agent.voice || 'aura-asteria-en');
  const [voiceSpeed, setVoiceSpeed] = useState(agent.voiceSpeed || 1.0);
  const [interruptionSensitivity, setInterruptionSensitivity] = useState(
    agent.interruptionSensitivity || 0.6
  );
  const [status, setStatus] = useState(agent.status || 'active');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name,
        description,
        voiceMode,
        webhookUrl: voiceMode === 'webhook' ? webhookUrl : null,
        systemPrompt,
        beginMessage,
        voice,
        voiceSpeed: Number(voiceSpeed),
        interruptionSensitivity: Number(interruptionSensitivity),
        status,
      };

      const res = await fetch(`/api/v1/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to update agent');
      }

      setSuccess(true);
      if (onUpdate) onUpdate(data.data);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Agent configuration saved successfully!</span>
        </div>
      )}

      {/* General Settings */}
      <Card className="p-6 bg-card border-white/[0.08] space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">General & Status</h3>
              <p className="text-xs text-neutral-400">Basic metadata and operational status</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-2.5 py-1 rounded bg-[#0a0c10] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300">Agent Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-300">Greeting Message</label>
          <Input
            value={beginMessage}
            onChange={(e) => setBeginMessage(e.target.value)}
            placeholder="Agent initial greeting..."
          />
        </div>
      </Card>

      {/* Voice & Synthesis Tuning */}
      <Card className="p-6 bg-card border-white/[0.08] space-y-6">
        <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Voice & Turn Dynamics</h3>
            <p className="text-xs text-neutral-400">Audio model selection and conversational responsiveness</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {VOICES.map((v) => (
            <div
              key={v.id}
              onClick={() => setVoice(v.id)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                voice === v.id
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                  : 'bg-white/[0.02] border-white/[0.08] text-neutral-400 hover:border-white/[0.16]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">{v.name}</span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {v.provider}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
                <span>{v.accent}</span>
                <span>•</span>
                <span>{v.style}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300 font-medium">Voice Speed</span>
              <span className="text-emerald-400 font-mono">{voiceSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.05"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300 font-medium">Interruption Sensitivity</span>
              <span className="text-emerald-400 font-mono">{interruptionSensitivity}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={interruptionSensitivity}
              onChange={(e) => setInterruptionSensitivity(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* System Prompt */}
      <Card className="p-6 bg-card border-white/[0.08] space-y-4">
        <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">System Prompt Instructions</h3>
            <p className="text-xs text-neutral-400">Behavioral guardrails and agent persona</p>
          </div>
        </div>

        <PromptEditor value={systemPrompt} onChange={setSystemPrompt} />
      </Card>

      {/* Save Trigger */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] px-6 gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
        </Button>
      </div>
    </form>
  );
}
