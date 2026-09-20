'use client';

import React from 'react';
import Link from 'next/link';

export function TalkToTeamBadge() {
  return (
    <Link
      href="/dashboard"
      aria-label="Talk to the team"
      className="fixed bottom-6 right-6 z-40 group flex items-center justify-center cursor-pointer transition transform hover:scale-105 active:scale-95"
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-[#13090e]/95 border border-pink-500/30 shadow-[0_0_25px_rgba(244,63,94,0.25)] backdrop-blur-xl">
        {/* Rotating Circular Text */}
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite] pointer-events-none"
          viewBox="0 0 100 100"
        >
          <path
            id="textPath"
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
          />
          <text className="text-[7.5px] uppercase font-mono font-bold tracking-[0.24em] fill-neutral-300 group-hover:fill-pink-400 transition-colors">
            <textPath href="#textPath" startOffset="0%">
              • TALK TO THE TEAM • TALK TO THE TEAM
            </textPath>
          </text>
        </svg>

        {/* Center Mascot Avatar */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 text-sm sm:text-base shadow-inner">
          🤖
        </div>
      </div>
    </Link>
  );
}
