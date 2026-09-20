'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Card, Badge, Switch } from '@talkie/ui';
import { Bot, Sparkles, Volume2, Mic, ArrowRight, Wand2, Check } from 'lucide-react';

interface AgentFormProps {
  initialData?: any;
  onSubmitSuccess?: (agent: any) => void;
}

const VOICES = [
  { id: 'aura-asteria-en', name: 'Asteria (Female)', accent: 'American', provider: 'Aura', style: 'Warm & Natural' },
  { id: 'aura-orpheus-en', name: 'Orpheus (Male)', accent: 'American', provider: 'Aura', style: 'Authoritative & Clear' },
  { id: 'aura-luna-en', name: 'Luna (Female)', accent: 'British', provider: 'Aura', style: 'Sophisticated' },
  { id: 'alloy', name: 'Alloy (Neutral)', accent: 'American', provider: 'OpenAI', style: 'Friendly & Balanced' },
  { id: 'echo', name: 'Echo (Male)', accent: 'American', provider: 'OpenAI', style: 'Resonant & Smooth' },
  { id: 'shimmer', name: 'Shimmer (Female)', accent: 'American', provider: 'OpenAI', style: 'Expressive & Bright' },
];

const PROMPT_TEMPLATES = [
  {
    name: 'Customer Support',
    greeting: 'Thank you for calling Talkie! How can I assist you with your account today?',
    prompt:
      'You are a friendly, concise, and expert customer support assistant for a cloud platform. Always verify details gently, answer questions directly, and summarize action items before ending the call.',
  },
  {
    name: 'Sales SDR Qualifier',
    greeting: 'Hi there! This is Alex calling from Talkie. Reaching out regarding your interest in AI voice agents.',
    prompt:
      'You are an energetic and polite outbound Sales Development Representative. Qualify leads by asking about team size, current telephony provider, and timeline. Aim to schedule a technical walkthrough with our team.',
  },
  {
    name: 'Appointment Booking',
    greeting: 'Hello! I am your automated scheduling concierge. Would you like to book or reschedule an appointment?',
    prompt:
      'You are an efficient scheduling assistant. Ask for caller name, preferred date and time, and confirm their phone number for SMS reminders.',
  },
];

export function AgentForm({ initialData, onSubmitSuccess }: AgentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [voiceMode, setVoiceMode] = useState(initialData?.voiceMode || 'hosted');
  const [webhookUrl, setWebhookUrl] = useState(initialData?.webhookUrl || '');
  const [systemPrompt, setSystemPrompt] = useState(
    initialData?.systemPrompt || PROMPT_TEMPLATES[0].prompt
  );
  const [beginMessage, setBeginMessage] = useState(
    initialData?.beginMessage || PROMPT_TEMPLATES[0].greeting
  );
  const [voice, setVoice] = useState(initialData?.voice || 'aura-asteria-en');
  const [language, setLanguage] = useState(initialData?.language || 'en-US');
  const [voiceSpeed, setVoiceSpeed] = useState(initialData?.voiceSpeed || 1.0);
  const [interruptionSensitivity, setInterruptionSensitivity] = useState(
    initialData?.interruptionSensitivity || 0.6
  );
  const [enableBackchannel, setEnableBackchannel] = useState(
    initialData?.enableBackchannel ?? true
  );

  const applyTemplate = (template: typeof PROMPT_TEMPLATES[0]) => {
    setSystemPrompt(template.prompt);
    setBeginMessage(template.greeting);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Agent name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        description,
        voiceMode,
        webhookUrl: voiceMode === 'webhook' ? webhookUrl : undefined,
        systemPrompt,
        beginMessage,
        voice,
        language,
        voiceSpeed: Number(voiceSpeed),
        interruptionSensitivity: Number(interruptionSensitivity),
        enableBackchannel,
      };

      const res = await fetch('/api/v1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to create agent');
      }

      if (onSubmitSuccess) {
        onSubmitSuccess(data.data);
      } else {
        router.push(`/dashboard/agents/${data.data.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* 1. Identity & Routing */}
      <Card className="p-6 bg-card border-white/[0.08] space-y-6">
        <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Agent Identity</h2>
            <p className="text-xs text-neutral-400">Basic metadata and voice pipeline routing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300">Agent Name *</label>
            <Input
              placeholder="e.g., Inbound Concierge Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300">Description</label>
            <Input
              placeholder="e.g., Triage customer inquiries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-medium text-neutral-300">Voice Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setVoiceMode('hosted')}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                voiceMode === 'hosted'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                  : 'bg-white/[0.02] border-white/[0.08] text-neutral-400 hover:border-white/[0.16]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Talkie Hosted LLM</span>
                {voiceMode === 'hosted' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Managed conversational pipeline with sub-500ms voice turns.
              </p>
            </div>

            <div
              onClick={() => setVoiceMode('webhook')}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                voiceMode === 'webhook'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                  : 'bg-white/[0.02] border-white/[0.08] text-neutral-400 hover:border-white/[0.16]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Custom Webhook Dispatch</span>
                {voiceMode === 'webhook' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Stream audio turns directly to your custom server endpoint.
              </p>
            </div>
          </div>
        </div>

        {voiceMode === 'webhook' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300">Server Webhook URL</label>
            <Input
              placeholder="https://your-server.com/api/voice-turns"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
        )}
      </Card>

      {/* 2. Voice Persona & Synthesis */}
      <Card className="p-6 bg-card border-white/[0.08] space-y-6">
        <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Voice & Audio Synthesis</h2>
            <p className="text-xs text-neutral-400">Acoustic profile, speech speed, and conversational pacing</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-medium text-neutral-300">Select Voice Model</label>
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

      {/* 3. Prompt Engineering & Behavior */}
      <Card className="p-6 bg-card border-white/[0.08] space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Prompt & Behavior</h2>
              <p className="text-xs text-neutral-400">System prompt instructions and initial conversational greeting</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 hidden sm:inline">Presets:</span>
            {PROMPT_TEMPLATES.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => applyTemplate(t)}
                className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-xs text-neutral-300 font-medium border border-white/[0.08] transition-colors"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-300">Initial Greeting Message</label>
          <Input
            placeholder="What the agent says immediately upon call connect"
            value={beginMessage}
            onChange={(e) => setBeginMessage(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <label className="font-medium text-neutral-300">System Prompt</label>
            <span className="text-neutral-500 font-mono">
              ~{Math.round(systemPrompt.length / 4)} tokens
            </span>
          </div>
          <Textarea
            rows={5}
            placeholder="Define the persona, boundaries, and domain knowledge for this agent..."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </div>
      </Card>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/agents')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] px-6"
        >
          {loading ? 'Creating Agent...' : 'Create Agent'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
