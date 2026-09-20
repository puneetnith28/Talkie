import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { Button } from './button';
import { Card } from './card';

describe('Interactive UI State Transitions', () => {
  describe('Button interactive states', () => {
    it('renders with active scale and focus visible styles', () => {
      const html = renderToString(
        <Button variant="primary" size="lg">
          Click Me
        </Button>
      );
      expect(html).toContain('active:scale-[0.97]');
      expect(html).toContain('focus-visible:ring-emerald-500/80');
      expect(html).toContain('cursor-pointer');
    });

    it('renders loading spinner and disabled state', () => {
      const html = renderToString(
        <Button variant="secondary" loading disabled>
          Processing
        </Button>
      );
      expect(html).toContain('animate-spin');
      expect(html).toContain('disabled:pointer-events-none');
    });
  });

  describe('Card interactive states', () => {
    it('applies interactive hover and elevation classes when prop is true', () => {
      const html = renderToString(
        <Card interactive>
          <div>Interactive Card Content</div>
        </Card>
      );
      expect(html).toContain('hover:border-white/[0.18]');
      expect(html).toContain('hover:-translate-y-0.5');
      expect(html).toContain('cursor-pointer');
    });
  });
});
