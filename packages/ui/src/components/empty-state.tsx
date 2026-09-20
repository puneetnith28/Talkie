import * as React from 'react';
import { cn } from '../utils';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-white/[0.08] bg-white/[0.01] backdrop-blur-sm',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-300 mb-4 shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-white tracking-tight mb-1.5">{title}</h3>
      <p className="text-xs text-neutral-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {(action || secondaryAction || children) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              size="sm"
              onClick={action.onClick}
              className="text-xs flex items-center gap-1.5"
            >
              {action.icon}
              <span>{action.label}</span>
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
              className="text-xs"
            >
              {secondaryAction.label}
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
