'use client';

import React from 'react';

// Cute hand-drawn styled SVG robot mascots in varied poses
export function RobotCoffee({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="25" y="25" width="50" height="42" rx="14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 12V25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="10" r="4" fill="currentColor" />
      {/* Eyes */}
      <rect x="36" y="38" width="6" height="10" rx="3" fill="currentColor" />
      <rect x="58" y="38" width="6" height="10" rx="3" fill="currentColor" />
      {/* Smile */}
      <path d="M44 54C47 57 53 57 56 54" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      {/* Coffee Cup */}
      <rect x="62" y="58" width="16" height="18" rx="4" stroke="currentColor" strokeWidth="3" />
      <path d="M78 62C82 62 84 65 84 69C84 73 82 76 78 76" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Steam */}
      <path d="M66 52C66 50 68 49 68 47" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M72 53C72 51 74 50 74 48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Body */}
      <path d="M30 67C22 73 20 85 24 92C32 96 68 96 76 92C80 85 78 73 70 67" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function RobotReading({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="25" y="22" width="50" height="42" rx="14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 9V22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="7" r="4" fill="currentColor" />
      {/* Eyes looking down */}
      <rect x="36" y="38" width="6" height="8" rx="3" fill="currentColor" />
      <rect x="58" y="38" width="6" height="8" rx="3" fill="currentColor" />
      <path d="M45 52C48 54 52 54 55 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Book */}
      <path d="M30 68C38 65 48 67 50 72C52 67 62 65 70 68V88C62 85 52 87 50 92C48 87 38 85 30 88V68Z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M50 72V92" stroke="currentColor" strokeWidth="3" />
      {/* Arms */}
      <path d="M26 64C28 72 30 76 34 76" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M74 64C72 72 70 76 66 76" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function RobotSleeping({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="25" y="25" width="50" height="42" rx="14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 12V25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="10" r="4" fill="currentColor" />
      {/* Sleeping curved eyes */}
      <path d="M35 44C37 47 41 47 43 44" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M57 44C59 47 63 47 65 44" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      {/* Snoozing smile */}
      <ellipse cx="50" cy="54" rx="3" ry="4" fill="currentColor" />
      {/* Z z Z */}
      <text x="6" y="32" fill="currentColor" fontSize="13" fontWeight="bold" fontFamily="monospace">z</text>
      <text x="14" y="22" fill="currentColor" fontSize="16" fontWeight="bold" fontFamily="monospace">Z</text>
      <text x="2" y="44" fill="currentColor" fontSize="11" fontWeight="bold" fontFamily="monospace">z</text>
      {/* Body */}
      <path d="M28 67C20 74 18 86 22 92C30 96 70 96 78 92C82 86 80 74 72 67" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function RobotLaptop({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="25" y="20" width="50" height="42" rx="14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 7V20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="5" r="4" fill="currentColor" />
      {/* Focused eyes */}
      <rect x="36" y="34" width="6" height="10" rx="3" fill="currentColor" />
      <rect x="58" y="34" width="6" height="10" rx="3" fill="currentColor" />
      <path d="M44 50H56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Laptop Screen & Base */}
      <path d="M36 68L44 56H72L64 68" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M30 78H78L72 68H36L30 78Z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="54" cy="62" r="2.5" fill="currentColor" />
      {/* Body */}
      <path d="M28 66C22 74 20 86 24 92C32 96 68 96 76 92C80 86 78 74 72 66" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function RobotThumbsUp({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="25" y="25" width="50" height="42" rx="14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 12V25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="10" r="4" fill="currentColor" />
      {/* Cheerful Eyes */}
      <rect x="36" y="38" width="6" height="10" rx="3" fill="currentColor" />
      <rect x="58" y="38" width="6" height="10" rx="3" fill="currentColor" />
      <path d="M43 54C47 58 53 58 57 54" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      {/* Thumbs Up Hand */}
      <path d="M76 56C76 50 82 48 83 54V64H76" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="74" y="60" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="3" />
      {/* Body */}
      <path d="M28 67C20 74 18 86 22 92C30 96 70 96 78 92C82 86 80 74 72 67" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function RobotThinking({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="25" y="25" width="50" height="42" rx="14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 12V25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="10" r="4" fill="currentColor" />
      {/* Eyes looking up */}
      <rect x="36" y="34" width="6" height="8" rx="3" fill="currentColor" />
      <rect x="58" y="34" width="6" height="8" rx="3" fill="currentColor" />
      <path d="M44 54C47 52 53 52 56 54" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      {/* Hand on chin */}
      <path d="M30 68C26 64 26 56 32 54C36 52 40 56 38 64" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      {/* Body */}
      <path d="M28 67C20 74 18 86 22 92C30 96 70 96 78 92C82 86 80 74 72 67" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function FloatingMascots() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Top Left Mascot: Thinking */}
      <div className="absolute top-10 left-4 sm:left-12 w-20 h-20 sm:w-28 sm:h-28 text-pink-400/[0.14] transition-transform duration-1000 animate-pulse">
        <RobotThinking className="w-full h-full" />
      </div>

      {/* Top Right Mascot: Coffee */}
      <div className="absolute top-8 right-4 sm:right-12 w-24 h-24 sm:w-32 sm:h-32 text-rose-400/[0.16] transition-transform duration-1000">
        <RobotCoffee className="w-full h-full" />
      </div>

      {/* Mid Left Mascot: Sleeping with Zzz */}
      <div className="absolute top-[32%] -left-2 sm:left-10 w-28 h-28 sm:w-36 sm:h-36 text-pink-400/[0.13]">
        <RobotSleeping className="w-full h-full" />
      </div>

      {/* Mid Right Mascot: Thumbs Up */}
      <div className="absolute top-[30%] right-2 sm:right-16 w-24 h-24 sm:w-32 sm:h-32 text-rose-400/[0.15]">
        <RobotThumbsUp className="w-full h-full" />
      </div>

      {/* Lower Left Mascot: Reading */}
      <div className="absolute top-[58%] left-4 sm:left-20 w-28 h-28 sm:w-36 sm:h-36 text-pink-400/[0.14]">
        <RobotReading className="w-full h-full" />
      </div>

      {/* Lower Right Mascot: Laptop / Coding */}
      <div className="absolute top-[56%] right-4 sm:right-16 w-28 h-28 sm:w-36 sm:h-36 text-rose-400/[0.15]">
        <RobotLaptop className="w-full h-full" />
      </div>
    </div>
  );
}
