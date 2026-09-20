# Talkie System Architecture

## 1. System Overview & Monorepo Topology

Talkie is structured as a high-performance TypeScript monorepo managed with `pnpm` workspaces and `turbo`.

```
Talkie/
├── apps/
│   ├── web/                     # Next.js 15 App Router (Marketing site, Dashboard, API routes v1)
│   └── docs/                    # Developer documentation portal & OpenAPI specification
│
├── packages/
│   ├── database/                # Prisma ORM, PostgreSQL schema, tenant isolation repository layer, seeds
│   ├── ui/                      # Design tokens, Tailwind base config, shared UI primitives (shadcn-aligned)
│   ├── config/                  # Type-safe Zod environment schemas and configuration profiles
│   ├── types/                   # Shared TypeScript domain types, DTOs, and event contracts
│   ├── telephony/               # Telecom provider abstraction (Mock provider, Twilio adapter)
│   ├── voice/                   # Voice AI state machine, STT, LLM context builder, TTS pipeline
│   ├── webhook-engine/          # Webhook dispatcher, HMAC SHA-256 signing, retry schedule, dead-lettering
│   ├── billing/                 # Usage metering engine, ledger, balance accounting, Stripe adapter
│   ├── sdk-js/                  # TypeScript/JavaScript SDK for npm distribution (`@talkie/sdk`)
│   ├── sdk-python/              # Python client library (`talkie-sdk`)
│   └── mcp-server/              # Model Context Protocol server (stdio and streamable HTTP transports)
│
├── tests/
│   ├── unit/                    # Fast isolated domain logic unit tests (Vitest)
│   ├── integration/             # Multi-service & API integration workflows
│   └── e2e/                     # Browser end-to-end user journeys (Playwright)
│
├── docs/                        # Architecture, API, Decisions, Deployment, Visual QA reports
├── docker-compose.yml           # Local multi-container development environment
└── package.json                 # Monorepo root orchestration
```

---

## 2. Core Architectural Subsystems

### A. Multi-Tenant Data & Authorization Layer
- Every resource (`Agent`, `PhoneNumber`, `Call`, `Conversation`, `Message`, `Contact`, `Webhook`, `UsageRecord`, `ApiKey`, `AuditLog`) is strictly partitioned by `workspaceId`.
- Authentication supports secure session cookies (web dashboard) and `Bearer tk_live_...` API keys (programmatic API & SDK).
- Authorization middleware evaluates tenant access before any service execution:
  `Request` -> `Authentication Guard` -> `Workspace Membership Check` -> `Role Permission Check` -> `Tenant-Scoped Query Execution`.

### B. Telephony & Messaging Layer
- Provider-agnostic abstraction: `TelephonyProvider` and `MessagingProvider` interfaces decouple core business logic from carrier APIs.
- **Demo Mode (`DEMO_MODE=true`)**: High-fidelity in-memory/simulated telecom engine generating realistic US/Canada E.164 numbers, simulated message delivery, and simulated audio turns.
- **Production Mode (`DEMO_MODE=false`)**: Adapters for Twilio, Telnyx, or standard SIP trunks.

### C. AI Voice Conversation Engine
- Finite State Machine:
  `idle` -> `ringing` -> `connected` -> `listening` -> `thinking` -> `speaking` -> `interrupted` -> `ending` -> `ended`.
- **Pipeline**:
  Caller Speech -> STT (Deepgram/Whisper/Mock) -> Prompt Builder (System Prompt + Agent Persona + Call/Contact Memory + Guardrails) -> LLM Completion (Streaming) -> TTS (ElevenLabs/OpenAI/Mock) -> Audio Output Stream.
- **Barge-in / Interruption**: Caller voice activity during `speaking` cancels active audio synthesis immediately and transitions state back to `listening`.

### D. Real-Time Streaming & Webhook Engine
- **Server-Sent Events (SSE)**: Delivers live call state, streaming partial/final transcript turns, and instant message updates to dashboard clients without aggressive polling.
- **Webhook Subscriptions**: Signs JSON payloads with HMAC SHA-256 (`X-Talkie-Signature`, `X-Talkie-Timestamp`, `X-Talkie-Event`) and delivers events via background retry workers with exponential backoff (1m, 5m, 15m, 1h, 6h).

### E. Developer Platform & Extensibility
- **REST API v1**: Uniform REST envelope `{ data, error, requestId }` across all endpoints with input validation via Zod.
- **MCP Server**: Exposes rich agent/number/call/message tool suite allowing Claude Desktop, Cursor, and autonomous agent clients to provision numbers and orchestrate phone communication.
- **SDKs**: TypeScript/JavaScript and Python packages wrapping the v1 API.

---

## 3. Data Flow Diagrams

### Inbound Voice Call Flow:
```
Caller
  │
  ▼
Telephony Webhook (/api/webhooks/telephony/inbound-call)
  │
  ├─► Lookup PhoneNumber & Assigned Agent (Tenant Scoped)
  ├─► Create Call Record (status: 'ringing' -> 'connected')
  ├─► Start Voice AI Session & Emit 'call.started' Webhook
  │
  ▼
Voice AI State Machine (Listening)
  │
  ├─► Speech Detected -> STT Transcription Turn -> Live SSE Stream
  ├─► Prompt Builder Context Assembly -> LLM Stream -> TTS Synthesis
  ├─► Audio Streamed to Telephony Provider -> Caller
  │
  ▼ (Caller Interrupts)
Cancel TTS -> Transition State to 'listening'
  │
  ▼ (Call Ends)
Summarize Call with LLM -> Persist Transcript & Usage -> Emit 'call.ended' Webhook
```

### Inbound & Outbound SMS Flow:
```
Inbound SMS Webhook (/api/webhooks/telephony/inbound-sms)
  │
  ├─► Verify Carrier Signature
  ├─► Match PhoneNumber to Agent & Workspace
  ├─► Find or Create Contact & Conversation Thread
  ├─► Persist Message (direction: 'inbound')
  ├─► Emit Realtime Event (SSE) & 'message.received' Webhook
  └─► If Hosted Agent Auto-Reply enabled:
        Generate AI Response -> Send Outbound Message -> Persist -> Dispatch
```
