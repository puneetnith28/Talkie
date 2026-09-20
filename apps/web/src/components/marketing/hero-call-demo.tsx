'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AudioWaveform } from './waveform';
import { Phone, PhoneCall, PhoneOff, Mic, Sparkles } from 'lucide-react';

interface Turn {
  id: string;
  speaker: 'agent' | 'user';
  text: string;
  latencyMs?: number;
}

const DEMO_TURNS: Turn[] = [
  {
    id: '1',
    speaker: 'agent',
    text: "Namaste! Talkie AI Concierge online. How can I assist with your customer dispatch or support today?",
    latencyMs: 240,
  },
  {
    id: '2',
    speaker: 'user',
    text: "Hi! Need to expedite package delivery #TK-9842 to our Bengaluru tech park hub.",
  },
  {
    id: '3',
    speaker: 'agent',
    text: "Shipment #TK-9842 is routed to Courier Rahul. Scheduled for priority delivery by 11:30 AM tomorrow in Whitefield.",
    latencyMs: 285,
  },
];

export function HeroCallDemo() {
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<'agent' | 'user'>('agent');
  const [duration, setDuration] = useState(0);
  const [activeTurnIdx, setActiveTurnIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript container
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  // Call duration counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'connected') {
      interval = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Automated playback sequence
  useEffect(() => {
    if (callState !== 'connected') return;

    if (activeTurnIdx < DEMO_TURNS.length) {
      const nextTurn = DEMO_TURNS[activeTurnIdx];
      setCurrentSpeaker(nextTurn.speaker);

      const timer = setTimeout(() => {
        setTurns((prev) => [...prev, nextTurn]);
        setActiveTurnIdx((idx) => idx + 1);
      }, activeTurnIdx === 0 ? 600 : 2200);

      return () => clearTimeout(timer);
    }
  }, [callState, activeTurnIdx]);

  const startCall = () => {
    setCallState('calling');
    setTurns([]);
    setDuration(0);
    setActiveTurnIdx(0);

    setTimeout(() => {
      setCallState('connected');
    }, 1000);
  };

  const endCall = () => {
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      setTurns([]);
      setActiveTurnIdx(0);
    }, 2800);
  };

  const speakNextTurn = () => {
    if (callState !== 'connected') return;
    if (activeTurnIdx >= DEMO_TURNS.length) {
      setTurns((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          speaker: 'user',
          text: "Can you send the delivery confirmation to dispatch@apex.com?",
        },
      ]);
      setTimeout(() => {
        setCurrentSpeaker('agent');
        setTurns((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            speaker: 'agent',
            text: "Confirmation dispatched with carrier rate sheet attached. Anything else?",
            latencyMs: 275,
          },
        ]);
      }, 1200);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl bg-zinc-900/95 border border-zinc-800/90 p-5 shadow-2xl backdrop-blur-2xl relative overflow-hidden font-sans">
      {/* Dynamic Ambient Background Glow */}
      <div
        className={`absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          callState === 'connected'
            ? 'bg-blue-500/25 scale-125'
            : callState === 'calling'
            ? 'bg-amber-500/20 animate-pulse'
            : 'bg-blue-500/10'
        }`}
      />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5 mb-3.5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white text-lg shadow-md shadow-blue-500/20 border border-blue-400/20">
              🤖
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                callState === 'connected'
                  ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'
                  : callState === 'calling'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-zinc-500'
              }`}
            />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 tracking-tight">
              Aarav AI Support
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Hosted Voice (India)
              </span>
            </div>
            <div className="text-xs text-zinc-400 font-medium font-mono">
              +91 80 4567 8901 • Indian English &amp; Hindi
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-bold text-zinc-200 tabular-nums">
            {callState === 'connected'
              ? `00:${duration < 10 ? '0' : ''}${duration}`
              : callState === 'calling'
              ? 'Connecting'
              : 'Ready'}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
            {callState === 'connected' ? 'Bi-Directional' : 'Standby'}
          </div>
        </div>
      </div>

      {/* Interactive Terminal Screen */}
      <div
        ref={scrollRef}
        className="min-h-[175px] max-h-[175px] bg-zinc-950/80 rounded-2xl p-3.5 border border-zinc-800/80 overflow-y-auto space-y-2.5 relative flex flex-col justify-start"
      >
        {callState === 'idle' && (
          <div className="my-auto flex flex-col items-center justify-center py-6 text-center text-zinc-400">
            <div className="w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mb-2">
              <Phone className="size-4" />
            </div>
            <p className="text-xs font-medium text-zinc-300">
              Click <span className="text-blue-400 font-semibold">"Start Interactive Call"</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Simulate live speech synthesis, low latency STT, and barge-in turns.
            </p>
          </div>
        )}

        {callState === 'calling' && (
          <div className="my-auto flex flex-col items-center justify-center py-6 text-center text-blue-400">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-2 animate-bounce">
              <PhoneCall className="size-4 text-blue-400" />
            </div>
            <p className="text-xs font-semibold">Establishing WebRTC SIP Trunk...</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Negotiating Opus audio stream at 48kHz</p>
          </div>
        )}

        {callState === 'connected' && (
          <>
            {turns.map((turn) => (
              <div
                key={turn.id}
                className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[88%] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                  turn.speaker === 'agent'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-100 ml-0 mr-auto'
                    : 'bg-zinc-800/90 border border-zinc-700/70 text-zinc-200 ml-auto mr-0'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">
                  <span className={turn.speaker === 'agent' ? 'text-blue-400' : 'text-zinc-400'}>
                    {turn.speaker === 'agent' ? 'Apex AI' : 'Caller'}
                  </span>
                  {turn.latencyMs && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                      ⚡ {turn.latencyMs}ms
                    </span>
                  )}
                </div>
                {turn.text}
              </div>
            ))}
          </>
        )}

        {callState === 'ended' && (
          <div className="my-auto flex flex-col items-center justify-center py-6 text-center text-zinc-300">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2 text-emerald-400">
              <Sparkles className="size-4" />
            </div>
            <p className="text-xs font-semibold text-white">Call Finalized & Transcribed</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Audio archived. Summary generated and dispatched to webhook.
            </p>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 relative z-10">
        <AudioWaveform
          isPlaying={callState === 'connected'}
          speaker={currentSpeaker}
        />

        <div className="flex items-center gap-2">
          {callState === 'idle' && (
            <button
              onClick={startCall}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs transition shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <Phone className="size-3.5" />
              Start Interactive Call
            </button>
          )}

          {callState === 'connected' && (
            <>
              <button
                onClick={speakNextTurn}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-medium text-xs border border-zinc-700 transition cursor-pointer"
              >
                <Mic className="size-3.5 text-emerald-400" />
                Speak Turn
              </button>
              <button
                onClick={endCall}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-red-500/20"
              >
                <PhoneOff className="size-3.5" />
                End
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
