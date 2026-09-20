// Talkie Design System Tokens

export const tokens = {
  fonts: {
    sans: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
    heading: 'var(--font-heading, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    mono: 'var(--font-mono, "JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace)',
  },

  typography: {
    fontSizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
    lineHeights: {
      none: '1',
      tight: '1.15',
      snug: '1.3',
      normal: '1.5',
      relaxed: '1.65',
    },
    letterSpacings: {
      tighter: '-0.03em',
      tight: '-0.015em',
      normal: '0em',
      wide: '0.025em',
      widest: '0.08em',
    },
  },

  colors: {
    background: '#08090b',
    backgroundElevated: '#111215',
    backgroundSubtle: '#16171b',
    backgroundCard: 'rgba(255, 255, 255, 0.04)',
    backgroundCardHover: 'rgba(255, 255, 255, 0.07)',
    
    foreground: '#ffffff',
    foregroundMuted: 'rgba(255, 255, 255, 0.70)',
    foregroundSubtle: 'rgba(255, 255, 255, 0.45)',
    foregroundDisabled: 'rgba(255, 255, 255, 0.25)',

    // Accents
    primary: '#26b65a',
    primaryHover: '#22c55e',
    primaryGlow: 'rgba(38, 182, 90, 0.25)',
    primaryLight: 'rgba(38, 182, 90, 0.12)',

    destructive: '#fa3532',
    destructiveHover: '#ef4444',
    destructiveGlow: 'rgba(250, 53, 50, 0.25)',
    destructiveLight: 'rgba(250, 53, 50, 0.12)',

    warning: '#f59e0b',
    warningLight: 'rgba(245, 158, 11, 0.12)',

    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.04)',
    borderHover: 'rgba(255, 255, 255, 0.16)',
    borderHigh: 'rgba(255, 255, 255, 0.22)',
    borderFocus: 'rgba(38, 182, 90, 0.6)',

    // Surface Elevation Tokens
    surface: {
      base: '#08090b',
      elevated: '#111215',
      overlay: '#16171c',
      card: 'rgba(255, 255, 255, 0.035)',
      cardHover: 'rgba(255, 255, 255, 0.065)',
      active: 'rgba(255, 255, 255, 0.09)',
    },

    // Contrast Utility Tokens
    contrast: {
      high: 'rgba(255, 255, 255, 0.95)',
      medium: 'rgba(255, 255, 255, 0.70)',
      subtle: 'rgba(255, 255, 255, 0.45)',
      faint: 'rgba(255, 255, 255, 0.25)',
      borderHigh: 'rgba(255, 255, 255, 0.20)',
      borderMedium: 'rgba(255, 255, 255, 0.12)',
      borderSubtle: 'rgba(255, 255, 255, 0.07)',
    },
  },

  radii: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glowButton: '0 0 0 1px rgba(255,255,255,0.12), 0 12px 28px rgba(5,20,11,0.32)',
    glowButtonHover: '0 0 0 1px rgba(255,255,255,0.16), 0 18px 38px rgba(5,20,11,0.40)',
    glass: '0 0 2.5vw rgba(0,0,0,0.15)',
    waveform: '0 0 1.667vw rgba(38,182,90,0.25), inset 0 0 0.556vw rgba(221,248,231,0.35)',
  },

  spacing: {
    containerMax: '1280px',
    containerWide: '1440px',
  },

  animationDurations: {
    instant: '50ms',
    fast: '150ms',
    normal: '250ms',
    deliberate: '350ms',
    slow: '500ms',
    ambient: '1200ms',
  },

  animationEasings: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    accelerate: 'cubic-bezier(0.3, 0.0, 1.0, 1.0)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1.0)',
  },

  transitions: {
    default: 'all 250ms cubic-bezier(0.2, 0.0, 0, 1.0)',
    fast: 'all 150ms cubic-bezier(0.2, 0.0, 0, 1.0)',
    transform: 'transform 250ms cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    opacity: 'opacity 200ms cubic-bezier(0.2, 0.0, 0, 1.0)',
  },
} as const;

export type DesignTokens = typeof tokens;
