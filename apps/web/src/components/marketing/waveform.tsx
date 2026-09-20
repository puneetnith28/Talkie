import React from 'react';

export function AudioWaveform({ isPlaying }: { isPlaying: boolean }) {
  const bars = [
    { height: '14px', delay: '0.1s' },
    { height: '24px', delay: '0.3s' },
    { height: '18px', delay: '0.15s' },
    { height: '28px', delay: '0.4s' },
    { height: '12px', delay: '0.25s' },
    { height: '26px', delay: '0.35s' },
    { height: '16px', delay: '0.1s' },
  ];

  return (
    <div className="flex items-center gap-1 h-8 px-2">
      {bars.map((bar, i) => (
        <span
          key={i}
          style={{
            height: isPlaying ? undefined : '6px',
            animationDelay: bar.delay,
          }}
          className={`w-1 rounded-full bg-blue-400 transition-all duration-300 ${
            isPlaying ? 'animate-pulse' : 'opacity-40'
          }`}
        />
      ))}
    </div>
  );
}
