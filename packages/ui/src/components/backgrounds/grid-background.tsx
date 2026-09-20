import * as React from 'react';
import { cn } from '../../utils';

export interface GridBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number; // Size in px (default: 32)
  strokeWidth?: number; // Stroke width in px (default: 1)
  variant?: 'subtle' | 'default' | 'glow' | 'accent' | 'telephony';
  mask?: 'none' | 'radial' | 'top' | 'bottom' | 'sides';
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
}

export function GridBackground({
  size = 32,
  strokeWidth = 1,
  variant = 'default',
  mask = 'radial',
  opacity,
  className,
  children,
  ...props
}: GridBackgroundProps) {
  const getGridColor = () => {
    switch (variant) {
      case 'subtle':
        return 'rgba(255, 255, 255, 0.03)';
      case 'glow':
        return 'rgba(38, 182, 90, 0.08)';
      case 'accent':
        return 'rgba(38, 182, 90, 0.15)';
      case 'telephony':
        return 'rgba(56, 189, 248, 0.07)';
      case 'default':
      default:
        return 'rgba(255, 255, 255, 0.05)';
    }
  };

  const getMaskStyle = (): React.CSSProperties => {
    switch (mask) {
      case 'radial':
        return {
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)',
        };
      case 'top':
        return {
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 95%)',
        };
      case 'bottom':
        return {
          maskImage: 'linear-gradient(to top, black 20%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 95%)',
        };
      case 'sides':
        return {
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        };
      case 'none':
      default:
        return {};
    }
  };

  const gridColor = getGridColor();

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, ${gridColor} ${strokeWidth}px, transparent ${strokeWidth}px), linear-gradient(to bottom, ${gridColor} ${strokeWidth}px, transparent ${strokeWidth}px)`,
    backgroundSize: `${size}px ${size}px`,
    opacity: opacity !== undefined ? opacity : 1,
    ...getMaskStyle(),
  };

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={backgroundStyle}
      {...props}
    >
      {children}
    </div>
  );
}
