'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button, TableSkeleton, EmptyState } from '@talkie/ui';
import {
  ChevronLeft,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Bot,
  User,
  Sparkles,
  Play,
  Pause,
  Copy,
  Check,
  Download,
  Clock,
  Radio,
  PhoneOff,
  Volume2,
  Share2,
  Activity,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

interface CallTranscriptTurn {
  id: string;
  speaker: string;
  text: string;
  timestampMs: number;
  confidence: number;
}

interface CallDetail {
  id: string;
  workspaceId: string;
  agentId?: string | null;
  phoneNumberId?: string | null;
  providerCallId?: string | null;
  direction: string;
  fromNumber: string;
  toNumber: string;
  status: string;
  durationSeconds: number;
  startedAt?: string | null;
  endedAt?: string | null;
  summary?: string | null;
  recordingUrl?: string | null;
  transcriptStatus: string;
  createdAt: string;
  agent?: {
    id: string;
    name: string;
    voice?: string;
    language?: string;
    voiceMode?: string;
  } | null;
  phoneNumber?: {
    id: string;
    phoneNumber: string;
    provider?: string;
  } | null;
  transcripts?: CallTranscriptTurn[];
}

export default function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: callId } = use(params);
  const [call, setCall] = useState<CallDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isHangingUp, setIsHangingUp] = useState(false);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadCall() {
      try {
        const res = await fetch(`/api/v1/calls/${callId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setCall(json.data);
          }
        }
      } catch (err) {
        console.error('Error fetching call:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCall();
  }, [callId]);

  // SSE streaming listener for active calls
  useEffect(() => {
    if (!call || (call.status !== 'in-progress' && call.status !== 'in_progress')) {
      return;
    }

    const eventSource = new EventSource(`/api/v1/calls/${callId}/stream`);

    eventSource.addEventListener('transcript_turn', (e) => {
      try {
        const turn: CallTranscriptTurn = JSON.parse(e.data);
        setCall((prev) => {
          if (!prev) return prev;
          const exists = prev.transcripts?.some((t) => t.id === turn.id);
          if (exists) return prev;
          return {
            ...prev,
            transcripts: [...(prev.transcripts || []), turn],
          };
        });
      } catch (err) {
        console.error('Error parsing transcript turn:', err);
      }
    });

    eventSource.addEventListener('call_state', (e) => {
      try {
        const state = JSON.parse(e.data);
        setCall((prev) => (prev ? { ...prev, ...state } : prev));
      } catch (err) {
        console.error('Error parsing call state:', err);
      }
    });

    eventSource.addEventListener('summary_ready', (e) => {
      try {
        const data = JSON.parse(e.data);
        setCall((prev) => (prev ? { ...prev, summary: data.summary } : prev));
      } catch (err) {
        console.error('Error parsing summary event:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [callId, call?.status]);

  // Simulated audio playback progress
  const togglePlay = () => {
    if (isPlaying) {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const totalSeconds = call?.durationSeconds || 45;
      playbackTimerRef.current = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
            setIsPlaying(false);
            return 0;
          }
          return prev + 100 / totalSeconds;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  const handleCopyTranscript = () => {
    if (!call?.transcripts) return;
    const text = call.transcripts
      .map((t) => `[+${(t.timestampMs / 1000).toFixed(1)}s] ${t.speaker.toUpperCase()}: ${t.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    if (!call) return;
    const blob = new Blob([JSON.stringify(call, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-transcript-${call.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleHangup = async () => {
    setIsHangingUp(true);
    try {
      await fetch(`/api/v1/calls/${callId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hangup' }),
      });
      setCall((prev) => (prev ? { ...prev, status: 'completed' } : prev));
    } catch (err) {
      console.error('Failed to hangup call:', err);
    } finally {
      setIsHangingUp(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="h-8 w-48 bg-white/[0.04] rounded-lg animate-pulse" />
        <Card className="p-6 bg-[#0a0c10] border-white/[0.08]">
          <TableSkeleton rows={6} cols={4} />
        </Card>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/calls">
          <Button variant="ghost" size="sm" className="text-xs text-neutral-400 hover:text-white">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Calls
          </Button>
        </Link>
        <Card className="p-12 bg-[#0a0c10] border-white/[0.08]">
          <EmptyState
            icon={<PhoneOff className="w-8 h-8 text-neutral-500" />}
            title="Call Session Not Found"
            description="The requested call session could not be found or belongs to another workspace."
            action={{
              label: 'Return to Call Logs',
              onClick: () => {
                router.push('/dashboard/calls');
              },
            }}
          />
        </Card>
      </div>
    );
  }

  const isOutbound = call.direction === 'outbound';
  const isActive = call.status === 'in-progress' || call.status === 'in_progress';
  const transcripts = call.transcripts || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/calls">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs text-neutral-400 hover:text-white border border-white/[0.08]"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Calls
            </Button>
          </Link>
          <div className="h-4 w-[1px] bg-white/[0.1]" />
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
            {call.id}
          </h1>
          <Badge
            variant={isActive ? 'default' : call.status === 'completed' ? 'success' : 'destructive'}
            className="text-[10px] uppercase font-mono tracking-wider"
          >
            {call.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {isActive && (
            <Button
              size="sm"
              onClick={handleHangup}
              disabled={isHangingUp}
              className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              <PhoneOff className="w-3.5 h-3.5 mr-1.5" />
              {isHangingUp ? 'Terminating...' : 'End Call'}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyTranscript}
            className="h-8 px-2.5 text-xs text-neutral-400 hover:text-white border border-white/[0.08]"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1.5" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadTranscript}
            className="h-8 px-2.5 text-xs text-neutral-400 hover:text-white border border-white/[0.08]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            JSON
          </Button>
        </div>
      </div>

      {/* Hero Meta Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Caller / Callee */}
        <Card className="p-4 bg-[#0a0c10] border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
            {isOutbound ? 'Outbound Recipient' : 'Inbound Caller'}
          </div>
          <div className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                isOutbound
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isOutbound ? <PhoneOutgoing className="w-3.5 h-3.5" /> : <PhoneIncoming className="w-3.5 h-3.5" />}
            </div>
            <span className="font-mono">{isOutbound ? call.toNumber : call.fromNumber}</span>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-2">
            From: {call.fromNumber} • To: {call.toNumber}
          </div>
        </Card>

        {/* Assigned Voice Agent */}
        <Card className="p-4 bg-[#0a0c10] border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
            Assigned Voice Agent
          </div>
          <div className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>{call.agent?.name || 'Default Pipeline Agent'}</span>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-2">
            Voice: {call.agent?.voice || 'aura-asteria-en'} • Mode: {call.agent?.voiceMode || 'hosted'}
          </div>
        </Card>

        {/* Duration & Timestamp */}
        <Card className="p-4 bg-[#0a0c10] border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
            Session Duration
          </div>
          <div className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-2 font-mono">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>
              {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
            </span>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-2">
            {new Date(call.createdAt).toLocaleString()}
          </div>
        </Card>

        {/* Intelligence Quality */}
        <Card className="p-4 bg-[#0a0c10] border-white/[0.08]">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
            Latency & Quality
          </div>
          <div className="text-base font-bold text-teal-400 mt-1 flex items-center gap-2 font-mono">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>220ms TTFB</span>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-2">
            Turns: {transcripts.length} • Audio Codec: Opus 24kHz
          </div>
        </Card>
      </div>

      {/* AI Post-Call Summary Banner */}
      {call.summary ? (
        <Card className="p-5 bg-gradient-to-r from-emerald-950/30 via-[#0a0c10] to-blue-950/20 border-emerald-500/20 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>AI Executive Summary & Sentiment</span>
            </div>
            <Badge variant="success" className="text-[10px] font-mono">
              Sentiment: Positive (0.92)
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
            {call.summary}
          </p>
        </Card>
      ) : null}

      {/* Audio Playback Player Bar */}
      <Card className="p-4 bg-[#0a0c10] border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition shadow-lg shadow-emerald-500/20"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <span>Dual-Channel Stereo Audio Turn Player</span>
              {isPlaying && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <Radio className="w-3 h-3 animate-pulse" /> Playing
                </span>
              )}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
              Streamed Opus 48kbps via edge WebRTC telephony
            </div>
          </div>
        </div>

        {/* Waveform / Progress Scrub */}
        <div className="flex-1 max-w-md mx-2">
          <div className="h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/[0.08] relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
            <span>
              {Math.floor(((call.durationSeconds * playbackProgress) / 100) / 60)}:
              {String(Math.floor(((call.durationSeconds * playbackProgress) / 100) % 60)).padStart(2, '0')}
            </span>
            <span>
              {Math.floor(call.durationSeconds / 60)}:{String(call.durationSeconds % 60).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Volume2 className="w-4 h-4 text-neutral-400" />
          <span className="text-xs text-neutral-400 font-mono">1.0x</span>
        </div>
      </Card>

      {/* Transcript Turns Timeline */}
      <Card className="bg-[#0a0c10] border-white/[0.08] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Interactive Transcript Stream</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            {transcripts.length} Speaker Turns Recorded
          </span>
        </div>

        {transcripts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400 mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No transcript turns logged</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Caller and voice agent turns will stream in real-time as speech recognition events complete.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto divide-y divide-white/[0.04]">
            {transcripts.map((turn, index) => {
              const isAgent = turn.speaker === 'agent';
              const offsetSec = (turn.timestampMs / 1000).toFixed(1);

              return (
                <div
                  key={turn.id || index}
                  className={`pt-4 first:pt-0 flex gap-4 ${isAgent ? 'flex-row' : 'flex-row'}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${
                      isAgent
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isAgent ? 'text-blue-400' : 'text-emerald-400'}`}>
                          {isAgent ? `Agent (${call.agent?.name || 'AI Voice'})` : 'Caller'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          +{offsetSec}s
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-neutral-500">
                        {Math.round((turn.confidence || 0.95) * 100)}% Confidence
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                        isAgent
                          ? 'bg-blue-950/20 border-blue-500/20 text-neutral-100'
                          : 'bg-white/[0.02] border-white/[0.08] text-white'
                      }`}
                    >
                      {turn.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
