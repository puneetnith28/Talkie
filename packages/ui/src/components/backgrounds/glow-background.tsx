import * as React from 'react';
import { cn } from '../../utils';

export interface GlowBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'top-center' | 'top-left' | 'top-right' | 'center' | 'bottom-center' | 'custom';
  variant?: 'primary' | 'cyan' | 'amber' | 'multi' | 'subtle';
  size?: number; // Size in px (default: 600)
  blur?: number; // Blur in px (default: 120)
  opacity?: number;
  className?: string;
}

export function GlowBackground({
  position = 'top-center',
  variant = 'primary',
  size = 600,
  blur = 120,
  opacity = 0.2,
  className,
  ...props
}: GlowBackgroundProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return '-top-40 -left-40';
      case 'top-right':
        return '-top-40 -right-40';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom-center':
        return '-bottom-40 left-1/2 -translate-x-1/2';
      case 'top-center':
      default:
        return '-top-40 left-1/2 -translate-x-1/2';
    }
  };

  const getGradient = () => {
    switch (variant) {
      case 'cyan':
        return 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(14, 165, 233, 0.1) 50%, transparent 75%)';
      case 'amber':
        return 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.1) 50%, transparent 75%)';
      case 'multi':
        return 'radial-gradient(circle at 30% 30%, rgba(38, 182, 90, 0.4) 0%, rgba(56, 189, 248, 0.25) 45%, transparent 70%)';
      case 'subtle':
        return 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 50%, transparent 70%)';
      case 'primary':
      default:
        return 'radial-gradient(circle, rgba(38, 182, 90, 0.35) 0%, rgba(34, 197, 94, 0.12) 50%, transparent 75%)';
    }
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute rounded-full overflow-hidden will-change-transform',
        position !== 'custom' && getPositionClasses(),
        className
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: getGradient(),
        filter: `blur(${blur}px)`,
        opacity,
      }}
      {...props}
    />
  );
}
