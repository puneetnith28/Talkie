import * as React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-white/[0.08] text-white/90 border border-white/[0.08]',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    destructive: 'bg-red-500/15 text-red-400 border border-red-500/25',
    outline: 'border border-white/20 text-white/80',
    neutral: 'bg-white/[0.04] text-white/60 border border-white/[0.04]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 font-medium rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 leading-none transition-colors select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
