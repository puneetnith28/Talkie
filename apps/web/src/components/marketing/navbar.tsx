'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@talkie/ui';
import { Menu, X } from 'lucide-react';

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
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#08090b]/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition duration-200">
            T
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Talkie</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            v1.0
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
          <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#code" className="hover:text-white transition">SDK & MCP</a>
          <a href="#use-cases" className="hover:text-white transition">Use Cases</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <Link href="/docs" className="hover:text-white transition">Docs</Link>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" className="text-xs py-1.5 px-3">
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" className="text-xs py-1.5 px-3.5 shadow-md shadow-emerald-500/20">
              Start Free Trial →
            </Button>
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

      {/* Mobile Drawer Overlay with Backdrop Blur & Scroll Lock */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#08090b]/98 backdrop-blur-2xl p-5 space-y-1 animate-in slide-in-from-top-3 fade-in duration-250 ease-out shadow-2xl">
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition active:bg-white/[0.1]"
          >
            How It Works
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition active:bg-white/[0.1]"
          >
            Features
          </a>
          <a
            href="#code"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition active:bg-white/[0.1]"
          >
            SDK & MCP
          </a>
          <a
            href="#use-cases"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition active:bg-white/[0.1]"
          >
            Use Cases
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition active:bg-white/[0.1]"
          >
            Pricing
          </a>
          <Link
            href="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center h-11 px-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition active:bg-white/[0.1]"
          >
            Docs
          </Link>

          <div className="pt-4 mt-2 border-t border-white/[0.08] flex flex-col gap-2.5">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="primary" className="w-full h-11 text-xs font-bold shadow-lg shadow-emerald-500/20">
                Start Free Trial →
              </Button>
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="outline" className="w-full h-11 text-xs font-semibold">
                Console Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
