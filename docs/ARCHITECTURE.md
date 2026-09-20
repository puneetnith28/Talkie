# Architecture & System Topology

Talkie is a carrier-grade AI telephony and omnichannel messaging platform built as a high-performance TypeScript monorepo managed with `pnpm` and `Turborepo`.

---

## 1. Monorepo Structure

```
Talkie/
├── apps/
│   └── web/                     # Next.js 15 (App Router, Tailwind CSS, API Routes v1, WebSockets/SSE)
│
├── packages/
│   ├── database/                # Prisma ORM, Schema, Tenant Services, Migrations, Seeds
│   ├── ui/                      # Shared design system, Glassmorphism primitives, Tailwind tokens
│   ├── config/                  # Zod environment validation schemas & configuration profiles
│   ├── types/                   # Shared TypeScript domain interfaces, DTOs, and event contracts
│   ├── telephony/               # Telephony provider abstractions (Twilio, Telnyx, Mock engine)
│   ├── voice/                   # Voice AI turn state machine, STT, LLM streaming, TTS, Barge-in
│   ├── webhook-engine/          # Webhook delivery queue, HMAC-SHA256 signing, exponential backoff
│   ├── billing/                 # Usage metering engine, per-second ledger, Stripe billing integration
│   ├── sdk-js/                  # Official TypeScript/JavaScript client library (`@talkie/sdk`)
│   ├── sdk-python/              # Official Python client library (`talkie-sdk`)
│   └── mcp-server/              # Model Context Protocol (MCP) server for Claude Code and Cursor
│
├── docs/                        # Complete technical documentation suite
├── tests/                       # Unit, integration, and E2E test suites
└── package.json                 # Monorepo root workspace orchestration
```

---

## 2. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Clients["Client Layer"]
        WebDashboard["Web Dashboard (Next.js 15)"]
        MobileUsers["Mobile & Inbound Callers"]
        AgentClients["Claude Code / Cursor (MCP)"]
        ExtApps["Third-Party Apps (SDK / REST API)"]
    end

    subgraph API_Edge["API Gateway & Web Layer (apps/web)"]
        NextServer["Next.js App Server"]
        ClerkAuth["Clerk Auth & Session Validator"]
        SSEHub["Real-time SSE Stream Hub"]
        RESTRouter["REST API v1 Controller"]
    end

    subgraph Core_Engines["Core Domain Engines (packages/*)"]
        VoiceEngine["Voice AI Engine\n(State Machine, STT, LLM, TTS)"]
        Telephony["Telephony Provider Adapter\n(Mock / Twilio / Telnyx)"]
        WebhookEng["Webhook Dispatch Engine\n(HMAC-SHA256, Retry Queue)"]
        BillingEng["Usage Metering & Billing\n(Per-second Ledger)"]
    end

    subgraph Persistence["Data & External Services"]
        PrismaDB[("Database (PostgreSQL / SQLite)\nPrisma ORM")]
        ExternalLLM["LLM Providers\n(OpenAI / Anthropic / Groq)"]
        SpeechServices["STT & TTS Providers\n(Deepgram / ElevenLabs)"]
        ClerkService["Clerk Authentication Cloud"]
    end

    WebDashboard --> NextServer
    MobileUsers <--> Telephony
    AgentClients --> NextServer
    ExtApps --> NextServer

    NextServer --> ClerkAuth
    ClerkAuth <--> ClerkService
    NextServer --> RESTRouter
    NextServer --> SSEHub

    RESTRouter --> VoiceEngine
    RESTRouter --> Telephony
    RESTRouter --> WebhookEng
    RESTRouter --> BillingEng

    VoiceEngine <--> SpeechServices
    VoiceEngine <--> ExternalLLM

    Telephony --> PrismaDB
    VoiceEngine --> PrismaDB
    WebhookEng --> PrismaDB
    BillingEng --> PrismaDB
    RESTRouter --> PrismaDB
```

---

## 3. Real-Time Inbound Call Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Caller as Inbound Caller
    participant Carrier as Telephony Carrier
    participant Gateway as Webhook Gateway (/api/webhooks/telephony)
    participant DB as Prisma Database
    participant Voice as Voice AI Engine
    participant LLM as LLM Stream
    participant TTS as TTS Engine
    participant Dashboard as Real-time Dashboard (SSE)

    Caller->>Carrier: Dials E.164 Phone Number
    Carrier->>Gateway: POST /inbound-call (Webhook)
    Gateway->>DB: Lookup PhoneNumber & Assigned Agent
    Gateway->>DB: Create Call Record (status: 'ringing')
    Gateway->>Gateway: Authenticate & Authorize Tenant
    Gateway->>Voice: Initialize Voice Session State Machine
    Voice->>Dashboard: SSE Emit 'call.started' & status: 'connected'

    loop Active Conversation Turn
        Caller->>Voice: Caller speaks audio stream
        Voice->>Voice: STT Transcription Turn (Speech-to-Text)
        Voice->>Dashboard: SSE Emit Partial/Final Transcript
        Voice->>LLM: Prompt Context + Transcript Stream
        LLM-->>Voice: Streaming AI Response Tokens
        Voice->>TTS: Synthesize Audio Chunks
        TTS-->>Carrier: Stream Audio to Caller
        Carrier-->>Caller: Plays AI Voice Audio
    end

    opt Caller Interrupts (Barge-In)
        Caller->>Voice: Caller speaks while AI is speaking
        Voice->>TTS: Cancel Audio Output Stream
        Voice->>Voice: Transition State: 'speaking' -> 'listening'
    end

    Caller->>Carrier: Hangs Up Call
    Carrier->>Gateway: POST /call-status (status: 'completed')
    Gateway->>Voice: Terminate Voice Session
    Voice->>DB: Save Final Transcripts & Duration
    Voice->>DB: Ledger Billing Deduction (UsageRecord)
    Gateway->>Dashboard: SSE Emit 'call.ended'
```

---

## 4. Multi-Tenant Request Isolation Pipeline

All internal database and service operations enforce strict multi-tenant boundary checks:

```mermaid
flowchart LR
    Req[Incoming HTTP Request] --> AuthCheck{Auth Method?}
    
    AuthCheck -- Clerk Session --> ClerkVerify[Verify Clerk JWT / Cookie]
    AuthCheck -- Bearer API Key --> KeyVerify[Hash Key & Verify in DB]
    AuthCheck -- Mock / Demo --> DemoVerify[Resolve Default Workspace]

    ClerkVerify --> ResolveWS[Resolve Workspace & Role]
    KeyVerify --> ResolveWS
    DemoVerify --> ResolveWS

    ResolveWS --> TenantGuard{Tenant Guard}
    TenantGuard -- Allowed --> ScopedQuery[Execute Scoped Prisma Query\nwhere: workspaceId]
    TenantGuard -- Denied --> Err403[403 Forbidden / 401 Unauthorized]
    
    ScopedQuery --> Response[200 OK Response Envelope]
```

---

## 5. Architectural Subsystems

### A. Telephony Abstraction Layer (`@talkie/telephony`)
Decouples upstream business logic from underlying carrier APIs. In development or demo mode, a high-fidelity simulator generates E.164 numbers, delivers simulated SMS, and orchestrates simulated audio turns. In production, adapters communicate with Twilio, Telnyx, or standard SIP trunks.

### B. Voice AI Pipeline (`@talkie/voice`)
Finite State Machine governing call flow:
`idle` → `ringing` → `connected` → `listening` → `thinking` → `speaking` → `interrupted` → `ending` → `ended`.
Includes voice activity detection (VAD), barge-in cancellation, and streaming LLM token buffers.

### C. Webhook Dispatch Engine (`@talkie/webhook-engine`)
Reliable delivery of events (`call.started`, `call.ended`, `message.received`, `transcript.chunk`) to customer endpoints. Payloads are signed with HMAC-SHA256 (`X-Talkie-Signature`) and retried using exponential backoff schedules.

### D. Model Context Protocol Server (`@talkie/mcp-server`)
Enables autonomous AI coding tools (Claude Code, Cursor) and external LLMs to directly search phone numbers, create agents, make outbound calls, and query transcripts via standard JSON-RPC tools.
