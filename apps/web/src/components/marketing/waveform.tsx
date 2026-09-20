'use client';

import React from 'react';

export function AudioWaveform({
  isPlaying,
  speaker = 'agent',
}: {
  isPlaying: boolean;
  speaker?: 'agent' | 'user';
}) {
  const barHeights = [12, 22, 16, 28, 14, 26, 18, 24, 15, 20];

  return (
    <div className="flex items-center gap-1 h-8 px-2 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
      {barHeights.map((h, i) => (
        <span
          key={i}
          style={{
            height: isPlaying ? `${Math.max(6, h + ((i % 3) * 4))}px` : '4px',
            animationDuration: `${0.4 + (i * 0.08)}s`,
          }}
          className={`w-1 rounded-full transition-all duration-200 ${
            isPlaying
              ? speaker === 'agent'
                ? 'bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]'
                : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
              : 'bg-zinc-700 opacity-40'
          }`}
        />
      ))}
    </div>
  );
}
