import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { GridBackground, PageBackground, DotBackground, GlowBackground, SectionBackdrop } from './index';

describe('Background Components', () => {
  describe('GridBackground', () => {
    it('renders with default props and attributes', () => {
      const html = renderToString(<GridBackground size={48} variant="glow" mask="radial" />);
      expect(html).toContain('background-size:48px 48px');
      expect(html).toContain('pointer-events-none');
      expect(html).toContain('aria-hidden="true"');
    });

    it('applies custom variants and masks', () => {
      const html = renderToString(<GridBackground variant="telephony" mask="top" />);
      expect(html).toContain('mask-image:linear-gradient(to bottom, black 20%, transparent 95%)');
    });
  });

  describe('PageBackground', () => {
    it('renders page background with noise overlay', () => {
      const html = renderToString(<PageBackground variant="radial" noise />);
      expect(html).toContain('pointer-events-none');
      expect(html).toContain('mix-blend-overlay');
      expect(html).toContain('bg-[radial-gradient');
    });

    it('supports fixed and elevated configurations', () => {
      const html = renderToString(<PageBackground variant="elevated" fixed />);
      expect(html).toContain('fixed');
      expect(html).toContain('bg-gradient-to-b');
    });
  });

  describe('DotBackground', () => {
    it('renders with custom spacing and dot radius', () => {
      const html = renderToString(<DotBackground dotSize={2} spacing={32} variant="accent" mask="center-glow" />);
      expect(html).toContain('background-size:32px 32px');
      expect(html).toContain('pointer-events-none');
      expect(html).toContain('rgba(38, 182, 90, 0.35)');
    });
  });

  describe('GlowBackground', () => {
    it('renders ambient glow with custom size and blur', () => {
      const html = renderToString(<GlowBackground position="top-right" variant="cyan" size={700} blur={150} />);
      expect(html).toContain('width:700px');
      expect(html).toContain('height:700px');
      expect(html).toContain('blur(150px)');
      expect(html).toContain('-top-40 -right-40');
    });
  });

  describe('SectionBackdrop', () => {
    it('composes multiple layers into single backdrop', () => {
      const html = renderToString(
        <SectionBackdrop
          gradient="radial"
          grid={{ variant: 'glow' }}
          dots={{ variant: 'subtle' }}
          glow={{ variant: 'primary', position: 'top-center' }}
          noise
        />
      );
      expect(html).toContain('pointer-events-none');
      expect(html).toContain('mix-blend-overlay');
      expect(html).toContain('bg-[radial-gradient');
    });
  });
});
