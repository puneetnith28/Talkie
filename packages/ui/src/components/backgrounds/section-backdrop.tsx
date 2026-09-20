import * as React from 'react';
import { cn } from '../../utils';
import { GridBackground, type GridBackgroundProps } from './grid-background';
import { DotBackground, type DotBackgroundProps } from './dot-background';
import { GlowBackground, type GlowBackgroundProps } from './glow-background';

export interface SectionBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  grid?: boolean | GridBackgroundProps;
  dots?: boolean | DotBackgroundProps;
  glow?: boolean | GlowBackgroundProps | GlowBackgroundProps[];
  gradient?: 'none' | 'subtle' | 'radial' | 'elevated' | 'mesh';
  noise?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function SectionBackdrop({
  grid,
  dots,
  glow,
  gradient = 'none',
  noise = false,
  className,
  children,
  ...props
}: SectionBackdropProps) {
  const getGradientClass = () => {
    switch (gradient) {
      case 'subtle':
        return 'bg-gradient-to-b from-[#101116] via-[#090a0d] to-[#08090b]';
      case 'radial':
        return 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(38,182,90,0.08),rgba(8,9,11,0.98))]';
      case 'elevated':
        return 'bg-gradient-to-b from-[#12141a] via-[#0b0c0f] to-[#08090b]';
      case 'mesh':
        return 'bg-[radial-gradient(at_0%_0%,rgba(38,182,90,0.06)_0,transparent_50%),radial-gradient(at_100%_100%,rgba(56,189,248,0.05)_0,transparent_50%)]';
      case 'none':
      default:
        return '';
    }
  };

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden z-0', getGradientClass(), className)}
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

      {grid && (typeof grid === 'boolean' ? <GridBackground /> : <GridBackground {...grid} />)}

      {dots && (typeof dots === 'boolean' ? <DotBackground /> : <DotBackground {...dots} />)}

      {glow && (
        Array.isArray(glow) ? (
          glow.map((glowProps, index) => <GlowBackground key={index} {...glowProps} />)
        ) : typeof glow === 'boolean' ? (
          <GlowBackground />
        ) : (
          <GlowBackground {...glow} />
        )
      )}

      {children}
    </div>
  );
}
