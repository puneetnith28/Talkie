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
});
