'use client';

import React, { useState, useEffect } from 'react';
import { AudioWaveform } from './waveform';

export function HeroCallDemo() {
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [currentSpeaker, setCurrentSpeaker] = useState<'agent' | 'user'>('agent');
  const [transcript, setTranscript] = useState<Array<{ speaker: 'agent' | 'user'; text: string }>>([]);
  const [duration, setDuration] = useState(0);

  const startDemoCall = () => {
    setCallState('calling');
    setTranscript([]);
    setDuration(0);

    setTimeout(() => {
      setCallState('connected');
      setCurrentSpeaker('agent');
      setTranscript([
        { speaker: 'agent', text: "Hello! Thank you for calling Apex Logistics. How can I assist with your shipment today?" },
      ]);
    }, 1200);
  };

  const simulateUserResponse = () => {
    if (callState !== 'connected') return;

    setCurrentSpeaker('user');
    setTranscript((prev) => [
      ...prev,
      { speaker: 'user', text: "Hi, I need to check the delivery ETA for tracking number TK-9842." },
    ]);

    setTimeout(() => {
      setCurrentSpeaker('agent');
      setTranscript((prev) => [
        ...prev,
        { speaker: 'agent', text: "Looking up TK-9842 right now. Your freight is currently in transit through Chicago and scheduled for delivery tomorrow by 2:00 PM." },
      ]);
    }, 1400);
  };

  const endDemoCall = () => {
    setCallState('ended');
    setTimeout(() => setCallState('idle'), 3000);
  };

  useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      interval = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            🤖
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              Apex Logistics AI
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xs text-zinc-400">+1 (415) 555-0199 • ElevenLabs Ultra</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-bold text-zinc-300">
            {callState === 'connected' ? `00:${duration < 10 ? '0' : ''}${duration}` : 'Ready'}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
            {callState === 'connected' ? 'Live Stream' : 'Standby'}
          </div>
        </div>
      </div>

      {/* Call visualization screen */}
      <div className="min-h-[160px] bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800/80 flex flex-col justify-between mb-4">
        {callState === 'idle' && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-500 text-xs">
            <div className="text-3xl mb-2">📞</div>
            Click "Start Interactive Call" to test live voice turn latency and transcription.
          </div>
        )}

        {callState === 'calling' && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-blue-400 text-xs animate-pulse">
            <div className="text-3xl mb-2 animate-bounce">📱</div>
            Routing call through SIP trunk to AI Voice Agent...
          </div>
        )}

        {callState === 'connected' && (
          <div className="space-y-2.5 overflow-y-auto max-h-[180px] pr-1">
            {transcript.map((t, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                  t.speaker === 'agent'
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 ml-0 mr-auto'
                    : 'bg-zinc-800 border border-zinc-700/80 text-zinc-200 ml-auto mr-0'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-70">
                  {t.speaker === 'agent' ? 'AI Voice Agent' : 'Caller'}
                </div>
                {t.text}
              </div>
            ))}
          </div>
        )}

        {callState === 'ended' && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-400 text-xs">
            <div className="text-2xl mb-1">🏁</div>
            Call completed. Audio recorded and transcript exported.
          </div>
        )}
      </div>

      {/* Live waveform & controls */}
      <div className="flex items-center justify-between pt-2">
        <AudioWaveform isPlaying={callState === 'connected' && currentSpeaker === 'agent'} />

        <div className="flex gap-2">
          {callState === 'idle' && (
            <button
              onClick={startDemoCall}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-500/20"
            >
              Start Interactive Call
            </button>
          )}

          {callState === 'connected' && (
            <>
              <button
                onClick={simulateUserResponse}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition"
              >
                🗣️ Speak as Caller
              </button>
              <button
                onClick={endDemoCall}
                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition"
              >
                Hang Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
