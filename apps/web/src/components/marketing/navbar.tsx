'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0709]/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo: Talkie */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-400 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-pink-500/25 group-hover:scale-105 transition">
            T
          </div>
          <span className="font-bold text-xl sm:text-2xl text-white tracking-tight">Talkie</span>
        </Link>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition flex items-center gap-1.5"
            >
              <span>Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: 'w-8 h-8 rounded-full border border-white/[0.1] hover:border-pink-500/40 transition',
                  userButtonPopoverCard: 'bg-[#0a0c10] border border-white/[0.1] shadow-2xl text-white',
                  userButtonPopoverActionButton: 'text-neutral-300 hover:text-white hover:bg-white/[0.05]',
                  userButtonPopoverActionButtonText: 'text-xs text-neutral-300 font-medium',
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <Link
              href="/sign-in"
              className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-lg shadow-pink-500/25 active:scale-95 transition"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
