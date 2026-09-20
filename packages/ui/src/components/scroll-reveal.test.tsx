import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { ScrollReveal } from './scroll-reveal';

describe('ScrollReveal Component', () => {
  it('renders content with initial opacity transition styles', () => {
    const html = renderToString(
      <ScrollReveal delay={150} direction="up" distance={30}>
        <div>Test Content</div>
      </ScrollReveal>
    );

    expect(html).toContain('Test Content');
    expect(html).toContain('transition:opacity');
    expect(html).toContain('150ms');
  });

  it('supports custom directions and durations', () => {
    const html = renderToString(
      <ScrollReveal direction="left" duration={800}>
        <span>Left Slide</span>
      </ScrollReveal>
    );

    expect(html).toContain('Left Slide');
    expect(html).toContain('800ms');
  });
});
