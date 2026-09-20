'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Mic, Sparkles } from 'lucide-react';

interface TranscriptItem {
  id: string;
  speaker: 'Caller' | 'AI Agent';
  time: string;
  text: string;
  latencyMs?: number;
}

const FULL_TURNS: TranscriptItem[] = [
  {
    id: '1',
    speaker: 'Caller',
    time: '00:02',
    text: "Can you confirm the refund policy for enterprise annual subscriptions?",
  },
  {
    id: '2',
    speaker: 'AI Agent',
    time: '00:05',
    text: "Yes. Enterprise plans include a 30-day money-back guarantee with zero cancellation fees.",
    latencyMs: 290,
  },
  {
    id: '3',
    speaker: 'Caller',
    time: '00:09',
    text: "Fantastic. Can you email me the itemized invoice?",
  },
  {
    id: '4',
    speaker: 'AI Agent',
    time: '00:11',
    text: "Sent to your primary account email just now. Anything else I can assist with?",
    latencyMs: 315,
  },
];

export function TranscriptionDemo() {
  const [visibleCount, setVisibleCount] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  // Progressive streaming loop
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= FULL_TURNS.length) {
          return 1; // loop back seamlessly
        }
        return prev + 1;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 800);
    return () => clearTimeout(t);
  }, [visibleCount]);

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl space-y-4 font-sans backdrop-blur-xl relative overflow-hidden">
      {/* Top ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30 shadow-inner">
            <Mic className="size-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-tight">Live Real-Time Transcription</div>
            <div className="text-[10px] text-zinc-400 font-medium">Deepgram Nova-2 • 98.4% Accuracy</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
            Streaming
          </span>
        </div>
      </div>

      {/* Transcript Items */}
      <div className="space-y-2.5 min-h-[235px] max-h-[235px] overflow-y-auto pr-1">
        {FULL_TURNS.slice(0, visibleCount).map((t, idx) => {
          const isLatest = idx === visibleCount - 1;
          const isAgent = t.speaker === 'AI Agent';
          return (
            <div
              key={t.id}
              className={`p-3 rounded-xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                isAgent
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-100'
                  : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-semibold">
                <span className={isAgent ? 'text-blue-400 font-bold' : 'text-zinc-300 font-bold'}>
                  {t.speaker}
                </span>

                <div className="flex items-center gap-2">
                  {t.latencyMs && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                      ⚡ {t.latencyMs}ms
                    </span>
                  )}
                  <span className="font-mono text-zinc-500 text-[10px]">{t.time}</span>
                </div>
              </div>

              <p className="text-zinc-200 text-xs leading-relaxed font-normal">
                {t.text}
                {isLatest && isTyping && (
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-blue-400 animate-pulse align-middle" />
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
