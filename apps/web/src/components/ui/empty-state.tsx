'use client';

import React from 'react';
import { Button } from '@talkie/ui';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon = '✨',
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 animate-in fade-in">
      <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-2xl mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">{description}</p>
      
      {(actionLabel || secondaryLabel) && (
        <div className="flex items-center gap-3">
          {actionLabel && (
            <Button variant="primary" onClick={onAction} className="shadow-lg shadow-blue-500/20">
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
