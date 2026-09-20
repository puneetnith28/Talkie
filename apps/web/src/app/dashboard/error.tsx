'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@talkie/ui';
import { AlertTriangle, RefreshCw, Home, Copy, Check } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  const copyDiagnostics = () => {
    const details = `Error: ${error.message}\nDigest: ${error.digest || 'N/A'}\nStack: ${error.stack || 'N/A'}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
      <Card className="max-w-md w-full p-8 bg-[#0a0c10] border-red-500/20 shadow-2xl flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h2 className="text-lg font-bold text-white mb-2">Unexpected Application State</h2>
        <p className="text-xs text-neutral-400 max-w-sm mb-6 leading-relaxed">
          {error.message || 'An error interrupted this view. You can reload this view or navigate back to the overview dashboard.'}
        </p>

        {error.digest && (
          <div className="w-full mb-6 p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-left flex items-center justify-between">
            <span className="text-[11px] font-mono text-neutral-500 truncate">
              ID: {error.digest}
            </span>
            <button
              type="button"
              onClick={copyDiagnostics}
              className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition ml-2 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reset()}
            className="flex-1 min-w-[130px] text-xs flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>

          <Link href="/dashboard" className="flex-1 min-w-[130px]">
            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Console Home</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
