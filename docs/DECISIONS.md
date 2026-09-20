# Architectural & Technical Decision Records (ADR)

## ADR-001: Product Naming & Unified Brand Identity
- **Status**: Accepted
- **Context**: The product platform is built as a complete AI phone, voice, and messaging infrastructure under the unified name **Talkie**.
- **Decision**: All packages, SDKs (`@talkie/sdk`, `talkie-sdk`), headers (`X-Talkie-Signature`), API key formats (`tk_live_...`), and UI branding will consistently use "Talkie".

## ADR-002: Monorepo Architecture with pnpm & Turborepo
- **Status**: Accepted
- **Context**: The project comprises a Next.js web application, backend services, database schema, shared UI components, telecom adapters, voice engine, webhook engine, billing engine, SDKs, and an MCP server.
- **Decision**: Use `pnpm` workspaces for dependency isolation and `turbo` for caching and build pipeline orchestration.

## ADR-003: Database ORM & Multi-Tenant Partitioning
- **Status**: Accepted
- **Context**: Need strong type-safety, relational integrity, migrations, and strict multi-tenant isolation.
- **Decision**: Use Prisma ORM with PostgreSQL in production and SQLite/in-memory compatibility for automated unit/integration test suites. All business entities enforce foreign key constraints with `workspaceId`.

## ADR-004: Telephony & Voice Provider Decoupling
- **Status**: Accepted
- **Context**: The system must run flawlessly in zero-credential demo environments while supporting production telecom networks (Twilio/Telnyx) and voice engines (OpenAI/Deepgram/ElevenLabs).
- **Decision**: Define clean TypeScript interfaces (`TelephonyProvider`, `VoiceAIProvider`, `BillingProvider`) and implement feature-complete mock providers as first-class citizens alongside production adapters.

## ADR-005: Real-Time Event Architecture (SSE over WebSockets)
- **Status**: Accepted
- **Context**: Need real-time streaming for live call status, audio transcripts, and messaging updates across edge and serverless environments.
- **Decision**: Use Server-Sent Events (SSE) for unidirectionally streaming server events to the browser with standard HTTP/2, reducing WebSocket stateful connection overhead on Next.js edge/serverless routes.

## ADR-006: Webhook Delivery & HMAC Signature Security
- **Status**: Accepted
- **Context**: Customer webhook delivery must be secure against tampering, spoofing, and replay attacks.
- **Decision**: Sign payloads with HMAC SHA-256 using headers `X-Talkie-Signature`, `X-Talkie-Timestamp`, and `X-Talkie-Event`. Reject requests older than 5 minutes. Implement exponential backoff retries (1m, 5m, 15m, 1h, 6h) with dead-letter queue logging.
