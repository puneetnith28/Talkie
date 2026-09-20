import * as React from 'react';
import { cn } from '../../utils';

export interface PageBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle' | 'radial' | 'mesh';
  noise?: boolean;
  fixed?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PageBackground({
  variant = 'default',
  noise = false,
  fixed = false,
  className,
  children,
  ...props
}: PageBackgroundProps) {
  const getGradientClass = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-gradient-to-b from-[#12141a] via-[#0b0c0f] to-[#08090b]';
      case 'subtle':
        return 'bg-gradient-to-b from-[#101116] via-[#090a0d] to-[#08090b]';
      case 'radial':
        return 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(38,182,90,0.12),rgba(8,9,11,0.98))]';
      case 'mesh':
        return 'bg-[radial-gradient(at_0%_0%,rgba(38,182,90,0.08)_0,transparent_50%),radial-gradient(at_100%_100%,rgba(56,189,248,0.06)_0,transparent_50%),radial-gradient(at_50%_50%,rgba(16,17,22,1)_0,rgba(8,9,11,1)_100%)]';
      case 'default':
      default:
        return 'bg-[#08090b]';
    }
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none inset-0 z-0 overflow-hidden',
        fixed ? 'fixed' : 'absolute',
        getGradientClass(),
        className
      )}
      {...props}
    >
      {noise && (
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
      {children}
    </div>
  );
}
