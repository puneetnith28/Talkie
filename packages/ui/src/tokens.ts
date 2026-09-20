// Talkie Design System Tokens

export const tokens = {
  fonts: {
    heading: 'var(--font-heading, "Alte Haas Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    sans: 'var(--font-sans, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    mono: 'var(--font-mono, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)',
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
    borderFocus: 'rgba(38, 182, 90, 0.6)',
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
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
} as const;

export type DesignTokens = typeof tokens;
