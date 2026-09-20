'use client';

import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

interface Turn {
  id: string;
  speaker: 'Caller' | 'AI Agent';
  text: string;
  time: string;
  latencyMs?: number;
}

const TRANSCRIPT_CONVERSATION: Turn[] = [
  {
    id: '1',
    speaker: 'Caller',
    time: '00:02',
    text: 'Can you confirm the refund policy for enterprise annual subscriptions?',
  },
  {
    id: '2',
    speaker: 'AI Agent',
    time: '00:04',
    text: 'Enterprise plans include a 30-day full refund guarantee with zero cancellation fees.',
    latencyMs: 240,
  },
  {
    id: '3',
    speaker: 'Caller',
    time: '00:08',
    text: 'Can you dispatch the itemized invoice to my primary billing email?',
  },
  {
    id: '4',
    speaker: 'AI Agent',
    time: '00:10',
    text: 'Itemized invoice PDF has been dispatched. Can I assist with anything else today?',
    latencyMs: 215,
  },
];

export function TranscriptionDemo() {
  const [turnIndex, setTurnIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTurnIndex((prev) => (prev + 1) % 3); // cycles pairs cleanly
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  // Display sliding 2-message window for zero-scroll minimalism
  const currentTurns = [
    TRANSCRIPT_CONVERSATION[turnIndex % TRANSCRIPT_CONVERSATION.length],
    TRANSCRIPT_CONVERSATION[(turnIndex + 1) % TRANSCRIPT_CONVERSATION.length],
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0d080c]/90 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[280px]">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/[0.08] rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center border border-pink-500/30">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-tight">Live Voice Transcription</div>
            <div className="text-[10px] text-neutral-400 font-mono">Deepgram Nova-2 • &lt;240ms latency</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
          <span className="text-[9px] font-mono text-pink-300 font-bold uppercase tracking-wider">
            Streaming
          </span>
        </div>
      </div>

      {/* Dynamic Animated Turns with zero scrollbars */}
      <div className="space-y-2.5 overflow-hidden flex-1 flex flex-col justify-center">
        {currentTurns.map((t, idx) => {
          const isAgent = t.speaker === 'AI Agent';
          return (
            <div
              key={`${t.id}-${idx}-${turnIndex}`}
              className={`p-3.5 rounded-xl border transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 ${
                isAgent
                  ? 'bg-pink-950/20 border-pink-500/30 text-white'
                  : 'bg-neutral-900/60 border-white/[0.06] text-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1 font-semibold">
                <span className={isAgent ? 'text-pink-400 font-bold' : 'text-neutral-300'}>
                  {t.speaker}
                </span>

                <div className="flex items-center gap-2">
                  {t.latencyMs && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono">
                      ⚡ {t.latencyMs}ms
                    </span>
                  )}
                  <span className="font-mono text-neutral-500 text-[10px]">{t.time}</span>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed font-sans font-normal">
                {t.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
