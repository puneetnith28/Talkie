'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Button } from '@talkie/ui';
import { Terminal, Menu } from 'lucide-react';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open & handle Escape key
  useEffect(() => {
    if (!mobileDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileDrawerOpen]);

  return (
    <div className="flex h-screen bg-[#08090b] text-white overflow-hidden font-sans">
      {/* Desktop Sidebar (visible on md+) */}
      <div className="hidden md:flex h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer (visible on < md when open) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Sidebar Panel */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar
              onClose={() => setMobileDrawerOpen(false)}
              showCloseButton={true}
              className="w-full h-full shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-white/[0.08] bg-[#0a0c10]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden p-2 -ml-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[140px] sm:max-w-none">Workspace: Talkie AI Labs</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
              <span>Credits: $50.00</span>
            </div>

            <Link href="/docs">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs">
                <Terminal className="w-3.5 h-3.5" />
                <span>API Docs</span>
              </Button>
            </Link>

            <div
              title="Demo User (AR)"
              className="w-8 h-8 rounded-full bg-neutral-800 border border-white/[0.1] flex items-center justify-center text-xs font-medium text-neutral-200 select-none cursor-pointer"
            >
              AR
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
