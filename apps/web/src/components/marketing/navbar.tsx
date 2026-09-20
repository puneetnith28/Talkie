'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@talkie/ui';

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
            T
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Talkie</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
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
            <Button variant="primary" className="text-xs py-1.5 px-3.5 shadow-md shadow-blue-500/20">
              Start Free Trial →
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-zinc-400 hover:text-white p-2"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 p-4 space-y-3 animate-in slide-in-from-top-2">
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white py-1">How It Works</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white py-1">Features</a>
          <a href="#code" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white py-1">SDK & MCP</a>
          <a href="#use-cases" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white py-1">Use Cases</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white py-1">Pricing</a>
          <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-400 hover:text-white py-1">Docs</Link>
          <div className="pt-2 flex gap-2">
            <Link href="/dashboard" className="flex-1">
              <Button variant="primary" className="w-full text-xs">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
