'use client';

import React, { useEffect } from 'react';
import { Button } from '@talkie/ui';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-2xl mb-4">
        ⚠️
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-xs text-zinc-400 max-w-md mb-6">
        {error.message || 'An unexpected error occurred while rendering the dashboard.'}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
          Return to Overview
        </Button>
        <Button variant="primary" onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
