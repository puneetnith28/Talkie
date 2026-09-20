import { describe, it, expect } from 'vitest';
import { tokens } from './tokens';

describe('Design Tokens Typography System', () => {
  it('contains valid sans-serif font stack', () => {
    expect(tokens.fonts.sans).toContain('Inter');
    expect(tokens.fonts.heading).toContain('Inter');
    expect(tokens.fonts.mono).toContain('JetBrains Mono');
  });

  it('defines structured geometric font size scale', () => {
    expect(tokens.typography.fontSizes.xs).toBe('0.75rem');
    expect(tokens.typography.fontSizes.base).toBe('1rem');
    expect(tokens.typography.fontSizes['6xl']).toBe('3.75rem');
  });

  it('defines consistent font weights and line heights', () => {
    expect(tokens.typography.fontWeights.normal).toBe(400);
    expect(tokens.typography.fontWeights.bold).toBe(700);
    expect(tokens.typography.fontWeights.black).toBe(900);
    expect(tokens.typography.lineHeights.tight).toBe('1.15');
    expect(tokens.typography.letterSpacings.tight).toBe('-0.015em');
  });

  it('defines structured surface elevation and contrast tokens', () => {
    expect(tokens.colors.surface.base).toBe('#08090b');
    expect(tokens.colors.surface.elevated).toBe('#111215');
    expect(tokens.colors.borderHigh).toBe('rgba(255, 255, 255, 0.22)');
    expect(tokens.colors.contrast.borderMedium).toBe('rgba(255, 255, 255, 0.12)');
  });

  it('defines standardized animation durations and easing tokens', () => {
    expect(tokens.animationDurations.instant).toBe('50ms');
    expect(tokens.animationDurations.fast).toBe('150ms');
    expect(tokens.animationDurations.normal).toBe('250ms');
    expect(tokens.animationDurations.slow).toBe('500ms');
    expect(tokens.animationEasings.standard).toBe('cubic-bezier(0.2, 0.0, 0, 1.0)');
    expect(tokens.animationEasings.emphasized).toBe('cubic-bezier(0.05, 0.7, 0.1, 1.0)');
    expect(tokens.animationEasings.spring).toBe('cubic-bezier(0.34, 1.56, 0.64, 1.0)');
  });
});
