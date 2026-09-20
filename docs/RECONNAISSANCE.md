# Reference & Product Reconnaissance

## 1. Product Overview & Core Value Proposition
- **Product Name**: Talkie
- **Tagline**: "Phone numbers for AI Agents"
- **Mission**: Give AI agents a real telecom identity (voice calls & SMS) with unified webhook routing, instant US/Canada number provisioning, real-time live transcription, MCP support, and hosted vs webhook voice modes.
- **Target Audience**: AI developers, agent builders, autonomous workflow engineers, and developer teams.

---

## 2. Public Pages & Information Architecture

### Public Routes:
1. `/` — Landing Page (Hero with live call demo, ecosystem proof, how it works, number search demo, messaging showcase, live transcription demo, SDK/MCP code tabs, use cases, FAQ, final CTA, footer)
2. `/docs` — Developer Documentation & API Reference
3. `/pricing` — Usage-based pricing breakdown (phone numbers, minutes, SMS, tokens)
4. `/terms` — Terms of Service
5. `/privacy` — Privacy Policy
6. `/login` — User authentication (login)
7. `/signup` — Account registration & workspace creation

### Authenticated Dashboard Routes:
1. `/dashboard` — Overview (Metrics: active agents, active numbers, calls today, balance; onboarding checklist; recent activity)
2. `/dashboard/agents` — AI Agents inventory & management
3. `/dashboard/agents/new` — Multi-step wizard to create an Agent
4. `/dashboard/agents/[id]` — Agent detail with tabs (Overview, Calls, Messages, Configuration, Webhooks)
5. `/dashboard/numbers` — Phone Numbers inventory, search, provisioning modal, and agent assignment
6. `/dashboard/calls` — Call logs, direction/status filters, duration, and audio preview
7. `/dashboard/calls/[id]` — Call detail with real-time transcript streaming, audio player, AI summary
8. `/dashboard/messages` — 3-column messaging hub (conversations, active thread, contact card)
9. `/dashboard/contacts` — Contact directory with message/call actions
10. `/dashboard/webhooks` — Webhook subscriptions, HMAC signing secrets (`X-Talkie-Signature`), delivery logs, test event dispatcher
11. `/dashboard/settings` — Workspace configuration, team members, audit logs
12. `/dashboard/settings/api-keys` — API key creation (`tk_live_...`), revocation, hashing
13. `/dashboard/usage` — Usage analytics, ledger, balances, and Stripe/Mock billing top-ups

---

## 3. Visual Design System & Tokens

### Typography:
- **Heading Font**: `Alte Haas Grotesk`, sans-serif (Weights: Bold 700, Regular 400)
- **Body Font**: `Inter`, sans-serif (Weights: 300, 400, 500, 600, 700)
- **Monospace Font**: `JetBrains Mono`, monospace (Weights: 400, 500, 600)
- **Scale**:
  - Hero Display: `clamp(2.5rem, 5.556vw, 5rem)`, tracking `[-0.06em]`, leading `[0.95]`
  - H1: `2.25rem` (36px), leading `[1.1]`
  - H2: `1.75rem` (28px), leading `[1.2]`
  - H3: `1.25rem` (20px), leading `[1.3]`
  - Body Base: `1rem` (16px), leading `[1.5]`
  - Body Small / Captions: `0.875rem` (14px) / `0.75rem` (12px)
  - Monospace Code: `0.8125rem` (13px)

### Color Palette:
- **Backgrounds**:
  - App Background: `#08090b` (Deep dark neutral)
  - Card/Surface: `rgba(255, 255, 255, 0.04)` to `rgba(255, 255, 255, 0.07)`
  - Surface Elevated: `#121316`
  - Popover / Dropdown: `#16171b`
- **Primary / Accents**:
  - Emerald Green: `#26b65a` / `#22c55e` (active call waveforms, success states, primary CTAs)
  - Bright Red: `#fa3532` / `#ef4444` (hangup, destructive actions, error badges)
  - Amber / Warning: `#f59e0b`
- **Borders & Separators**:
  - Default Border: `rgba(255, 255, 255, 0.08)`
  - Subtle Border: `rgba(255, 255, 255, 0.04)`
  - Focus Ring: `rgba(38, 182, 90, 0.6)`
- **Text & Foreground**:
  - Primary Text: `#ffffff`
  - Muted Text: `rgba(255, 255, 255, 0.70)`
  - Subtle Text: `rgba(255, 255, 255, 0.45)`

### Spacing, Radii & Shadows:
- **Radii**:
  - `sm`: `4px`
  - `md`: `8px`
  - `lg`: `12px`
  - `xl`: `16px`
  - `2xl`: `24px`
  - `full`: `9999px` (pills, badges, action buttons)
- **Shadows**:
  - Button Glow: `0 0 0 1px rgba(255,255,255,0.12), 0 12px 28px rgba(5,20,11,0.32)`
  - Glass Float: `0 0 2.5vw rgba(0,0,0,0.15)`
  - Waveform Glow: `0 0 1.667vw rgba(38,182,90,0.25)`

---

## 4. Key Interactive Components & Behaviors

1. **Navbar**: Fixed/sticky with translucent blur (`backdrop-blur-md`), responsive hamburger drawer on mobile (<768px).
2. **Hero Voice Waveform Card**:
   - Floating dark glass container with active caller number, call timer, and mute/hangup controls.
   - Dynamic animated green equalizer bars with randomized or speech-driven height transitions.
   - Floating conversation speech bubble with blur-in and typewriter effects.
3. **Install / Prompt Selector**:
   - Radio pill switcher between `Agent`, `MCP`, `NPM` with copy button and visual "Copied" feedback.
4. **Interactive Number Search**:
   - Filter by US (+1) and Canada (+1).
   - Area code search input with instant matching.
   - Provisioning action.
5. **Real-time Live Transcript Viewer**:
   - SSE streaming turns, distinct colors for Caller (`user`), Agent (`agent`), and System (`system`).
   - Synced waveform and audio duration scrubber.
6. **3-Column Messages Layout**:
   - Conversation search, conversation list with unread counter, chat bubbles with delivery receipts (`sent`, `delivered`, `failed`), and composer with `Cmd+Enter` shortcut.
7. **Webhook Inspector & Test Dispatcher**:
   - Instant HMAC SHA-256 test event delivery to provided URL with HTTP status code and latency display.

---

## 5. Telephony & AI Engine Architecture Specs

- **Telephony Abstraction**: Unified provider interface supporting `searchNumbers`, `provisionNumber`, `releaseNumber`, `makeCall`, `hangupCall`, `sendMessage`, and webhook routing.
- **Voice Session States**: `idle` -> `ringing` -> `connected` -> `listening` -> `thinking` -> `speaking` -> `interrupted` -> `ending` -> `ended` / `failed`.
- **Interruption Support**: Caller speech triggers barge-in event, immediately cancels TTS stream, and transitions state back to `listening`.
- **Developer Extensibility**: REST API v1 (`/api/v1`), TypeScript SDK, Python SDK, Model Context Protocol (MCP) server.
