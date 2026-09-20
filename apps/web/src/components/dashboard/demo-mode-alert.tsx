'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, X, ArrowRight, ExternalLink } from 'lucide-react';

export function DemoModeAlert() {
  const [dismissed, setDismissed] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check session demo status
    fetch('/api/v1/auth/me')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.isDemoMode) {
          setIsDemo(true);
          const hasDismissed = sessionStorage.getItem('talkie_demo_alert_dismissed');
          if (!hasDismissed) {
            setDismissed(false);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('talkie_demo_alert_dismissed', 'true');
  };

  if (!isDemo || dismissed) return null;

  return (
    <div className="relative z-20 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-200 backdrop-blur-md flex items-center justify-between gap-4 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <ShieldAlert className="w-3.5 h-3.5" />
        </div>
        <div className="truncate">
          <span className="font-semibold text-amber-300">Development Demo Mode Active: </span>
          <span className="text-amber-200/80">
            Console operating with local demo credentials. Add Clerk keys in <code className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-[10px] text-amber-300">.env</code> for production multi-tenant auth.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/docs"
          className="hidden sm:inline-flex items-center gap-1 text-amber-300 hover:text-white font-medium transition text-[11px]"
        >
          <span>Setup Guide</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss demo alert"
          className="p-1 rounded text-amber-400/80 hover:text-white hover:bg-amber-500/20 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
