import * as React from 'react';
import { cn } from '../../utils';

export interface DotBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  dotSize?: number; // Size in px (default: 1.5)
  spacing?: number; // Distance between dots in px (default: 24)
  variant?: 'subtle' | 'default' | 'glow' | 'accent' | 'telephony';
  mask?: 'none' | 'radial' | 'top' | 'bottom' | 'sides' | 'center-glow';
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
}

export function DotBackground({
  dotSize = 1.5,
  spacing = 24,
  variant = 'default',
  mask = 'radial',
  opacity,
  className,
  children,
  ...props
}: DotBackgroundProps) {
  const getDotColor = () => {
    switch (variant) {
      case 'subtle':
        return 'rgba(255, 255, 255, 0.06)';
      case 'glow':
        return 'rgba(38, 182, 90, 0.20)';
      case 'accent':
        return 'rgba(38, 182, 90, 0.35)';
      case 'telephony':
        return 'rgba(56, 189, 248, 0.18)';
      case 'default':
      default:
        return 'rgba(255, 255, 255, 0.12)';
    }
  };

  const getMaskStyle = (): React.CSSProperties => {
    switch (mask) {
      case 'radial':
        return {
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)',
        };
      case 'center-glow':
        return {
          maskImage: 'radial-gradient(circle at center, black 15%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 15%, transparent 70%)',
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

  const dotColor = getDotColor();

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
    backgroundSize: `${spacing}px ${spacing}px`,
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
