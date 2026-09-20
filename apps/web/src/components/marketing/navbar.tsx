'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

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

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
          <a href="#features" className="hover:text-white transition">
            Features
          </a>
          <Link href="/docs" className="hover:text-white transition">
            Docs
          </Link>
          <a href="#pricing" className="hover:text-white transition">
            Pricing
          </a>
          <a href="#blog" className="hover:text-white transition">
            Blog
          </a>
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/sign-up"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-lg shadow-pink-500/25 active:scale-95 transition"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          className="md:hidden text-zinc-300 hover:text-white p-2.5 rounded-xl hover:bg-white/[0.08] active:scale-95 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0a0709]/98 backdrop-blur-2xl p-5 space-y-2 animate-in slide-in-from-top-3 fade-in duration-200 shadow-2xl">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition"
          >
            Features
          </a>
          <Link
            href="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition"
          >
            Docs
          </Link>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition"
          >
            Pricing
          </a>
          <a
            href="#blog"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition"
          >
            Blog
          </a>

          <div className="pt-4 mt-2 border-t border-white/[0.08] flex flex-col gap-2.5">
            <Link
              href="/sign-up"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center h-11 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20"
            >
              Get Started →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
