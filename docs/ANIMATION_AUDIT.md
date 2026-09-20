# Animation & Motion Design System Audit

## Overview
This audit establishes standardized animation tokens, easing curves, and accessibility constraints (including `@media (prefers-reduced-motion: reduce)`) across the marketing and dashboard interfaces.

---

## 1. Standardized Motion Tokens

| Token Name | Value | Purpose / Usage |
|---|---|---|
| `--motion-fast` | `150ms` | Micro-interactions, button active states, tooltip fade-ins, icon hover shifts. |
| `--motion-normal` | `250ms` | Modal zoom, dropdown menus, tab active slider transitions, card hover elevation. |
| `--motion-slow` | `400ms` | Mobile drawer slide-in, accordion expansion, section viewport reveal. |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | General UI element transitions. |
| `--ease-emphasized` | `cubic-bezier(0.05, 0.7, 0.1, 1.0)` | Modal entrances, high-impact CTA reveals. |
| `--ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Popover badge reveals, live audio turn indicators. |

---

## 2. Accessibility & Reduced Motion Support

All continuous and high-displacement animations adhere to the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- In reduced motion mode:
  - Audio waveforms switch from pulsing heights to clean static amplitude indicators.
  - Background radial glows stay static without scale oscillation.
  - Transcript streamer displays text turns immediately without typing cursor delays.
