'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, PhoneCall, Sparkles, Bot } from 'lucide-react';

interface Turn {
  speaker: 'agent' | 'user';
  text: string;
  time: string;
}

const CONVERSATION_FLOW: Turn[] = [
  { speaker: 'agent', text: "Namaste! Talkie AI assistant online. How can I direct your call today?", time: "13:13" },
  { speaker: 'user', text: "Hi, I'd like to book an enterprise voice demo for our support team in Bengaluru.", time: "13:14" },
  { speaker: 'agent', text: "Wonderful! I've reserved Thursday at 3:00 PM IST. Confirmation sent via WhatsApp & SMS.", time: "13:15" },
];

export function HeroCallPill() {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [seconds, setSeconds] = useState(793); // 13:13 start
  const [activeTurn, setActiveTurn] = useState(0);
  const [isCalling, setIsCalling] = useState(true);

  // Duration timer
  useEffect(() => {
    if (!isCalling) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCalling]);

  // Turn rotator
  useEffect(() => {
    if (!isCalling) return;
    const turnInterval = setInterval(() => {
      setActiveTurn((prev) => (prev + 1) % CONVERSATION_FLOW.length);
    }, 3600);
    return () => clearInterval(turnInterval);
  }, [isCalling]);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleToggleCall = () => {
    if (isCalling) {
      setIsCalling(false);
    } else {
      setIsCalling(true);
      setSeconds(0);
    }
  };

  const waveformBars = [14, 28, 44, 22, 56, 36, 68, 48, 80, 52, 92, 60, 78, 42, 66, 34, 52, 28, 40, 18, 30, 12];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Floating Active Call Pill Bar */}
      <div className="relative z-20 flex items-center justify-between gap-4 sm:gap-6 px-5 sm:px-7 py-3 rounded-full bg-[#120b0f]/95 border border-white/[0.15] shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
        {/* Phone Number */}
        <div className="font-mono text-sm sm:text-base font-semibold text-white tracking-wide">
          +91 80 4567 8901
        </div>

        {/* Timer */}
        <div className="font-mono text-sm sm:text-base text-neutral-300">
          {isCalling ? formatDuration(seconds) : 'Ended'}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mute Mic Button */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute' : 'Mute'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 ${
              isMuted ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.08] hover:bg-white/[0.15] text-white'
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Speaker Volume Button */}
          <button
            type="button"
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 ${
              isSpeakerMuted ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.08] hover:bg-white/[0.15] text-white'
            }`}
          >
            {isSpeakerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Hangup / Reconnect Button */}
          <button
            type="button"
            onClick={handleToggleCall}
            title={isCalling ? 'End Call' : 'Start Call'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-lg active:scale-95 ${
              isCalling
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-pink-500/30'
            }`}
          >
            {isCalling ? <PhoneOff className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Terminal Platform with Live Waveform & Real-Time AI Transcript */}
      <div className="w-full -mt-5 pt-10 pb-8 px-6 sm:px-10 rounded-t-[2.5rem] bg-gradient-to-b from-[#13080e]/90 via-[#0d060a]/95 to-[#080407] border-t border-x border-pink-500/25 shadow-[0_-20px_60px_rgba(244,63,94,0.12)] backdrop-blur-3xl relative overflow-hidden">
        {/* Subtle Inner Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ec4899 1px, transparent 1px), linear-gradient(to bottom, #ec4899 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-pink-500/15 blur-2xl rounded-full pointer-events-none" />

        {/* Animated Audio Waveform */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 h-20 sm:h-24 my-3">
          {waveformBars.map((height, idx) => (
            <span
              key={idx}
              style={{
                height: isCalling
                  ? `${Math.max(12, height * (0.6 + Math.sin((idx + seconds * 2) * 0.7) * 0.4))}px`
                  : '8px',
                transition: 'height 0.15s ease',
              }}
              className={`w-1.5 sm:w-2 rounded-full ${
                isCalling
                  ? idx % 2 === 0
                    ? 'bg-gradient-to-t from-pink-600 via-rose-400 to-white shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                    : 'bg-pink-500/70 shadow-[0_0_8px_rgba(236,72,153,0.5)]'
                  : 'bg-neutral-800'
              }`}
            />
          ))}
        </div>

        {/* Live Conversation Subtitle Turn */}
        <div className="relative z-10 max-w-lg mx-auto mt-4 p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] backdrop-blur-md transition-all duration-300">
          <div className="flex items-center gap-2 text-xs font-semibold mb-1">
            {CONVERSATION_FLOW[activeTurn].speaker === 'agent' ? (
              <span className="flex items-center gap-1 text-pink-400">
                <Bot className="w-3.5 h-3.5" /> Talkie AI (Voice Pipeline)
              </span>
            ) : (
              <span className="text-rose-300">Caller (Inbound Phone Session)</span>
            )}
            <span className="text-[10px] text-neutral-500 font-mono ml-auto">
              Latency: &lt;240ms
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
            &ldquo;{CONVERSATION_FLOW[activeTurn].text}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
