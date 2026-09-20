# Hard-Code & Data State Audit

## Overview
This audit inspects all data sources, mock implementations, and state handling across the Talkie repository to classify what is legitimate static content versus what must be dynamically queried from the Prisma database/API layer.

---

## 1. Classification Matrix

| Component / Path | Current Data Type | Classification | Action / Remediation |
|---|---|---|---|
| `apps/web/src/components/marketing/hero.tsx` | Static Marketing Copy | `MARKETING_COPY` | Retain static copy; add dynamic live status indicators. |
| `apps/web/src/components/marketing/hero-call-demo.tsx` | Simulated Multi-Turn Audio | `DEMO_ONLY` | Keep interactive demo simulation self-contained for unauthenticated visitors. |
| `apps/web/src/components/marketing/how-it-works.tsx` | SDK Code Samples & Steps | `LEGITIMATE_STATIC` | Retain static code snippets. |
| `apps/web/src/components/marketing/transcription-demo.tsx` | Sample Transcript Stream | `DEMO_ONLY` | Keep interactive demo; real calls use DB transcripts at `/dashboard/calls/[id]`. |
| `apps/web/src/components/marketing/messaging-demo.tsx` | Sample SMS Thread | `DEMO_ONLY` | Keep interactive demo; real conversations use DB at `/dashboard/messages`. |
| `apps/web/src/components/marketing/code-showcase.tsx` | Developer Code Blocks | `LEGITIMATE_STATIC` | Retain code snippets with copy feedback. |
| `apps/web/src/components/marketing/use-cases.tsx` | Enterprise Solution Cards | `MARKETING_COPY` | Retain static cards. |
| `apps/web/src/components/marketing/faq-accordion.tsx` | FAQ Questions & Answers | `MARKETING_COPY` | Retain static FAQ. |
| `apps/web/src/components/dashboard/stats-cards.tsx` | Aggregated Telemetry Cards | `SHOULD_BE_DYNAMIC` | Dynamically fetch from `GET /api/v1/dashboard/stats` via `WorkspaceService`. |
| `apps/web/src/components/dashboard/recent-activity.tsx` | Recent Calls & Messages Feed | `SHOULD_BE_DYNAMIC` | Dynamically fetch from `CallService` and `MessageService`. |
| `apps/web/src/app/dashboard/agents/page.tsx` | Agent Studio Grid & Status | `SHOULD_BE_DYNAMIC` | Dynamically query `GET /api/v1/agents` and persist edits to DB. |
| `apps/web/src/app/dashboard/numbers/page.tsx` | Phone Numbers List & Search | `SHOULD_BE_DYNAMIC` | Dynamically query `GET /api/v1/numbers` and carrier search endpoints. |
| `apps/web/src/app/dashboard/calls/page.tsx` | Call Logs & Direction Filters | `SHOULD_BE_DYNAMIC` | Dynamically query `GET /api/v1/calls` with duration formatting and status badges. |
| `apps/web/src/app/dashboard/calls/[id]/page.tsx` | Call Detail & Live Transcripts | `SHOULD_BE_DYNAMIC` | Load Prisma `Transcript` records and subscribe to SSE `/api/v1/realtime`. |
| `apps/web/src/app/dashboard/messages/page.tsx` | Omnichannel Chat Threads | `SHOULD_BE_DYNAMIC` | Query `GET /api/v1/conversations` and post to `POST /api/v1/messages`. |
| `apps/web/src/app/dashboard/contacts/page.tsx` | Customer Directory | `SHOULD_BE_DYNAMIC` | Query `GET /api/v1/contacts` with Prisma search filters. |
| `apps/web/src/app/dashboard/webhooks/page.tsx` | Webhook Subscriptions & Logs | `SHOULD_BE_DYNAMIC` | Query `GET /api/v1/webhooks` and `WebhookDelivery` log records. |
| `apps/web/src/app/dashboard/usage/page.tsx` | Metering Ledger & Top-Up | `SHOULD_BE_DYNAMIC` | Query `UsageRecord` aggregations and workspace balance from DB. |

---

## 2. Dynamic Data Rule Compliance

1. **No Fake Dashboard Counts:** All dashboard telemetry (active agents, numbers, calls today, messages today, balance) must be calculated on the fly by querying Prisma models scoped by `workspaceId`.
2. **Provider Isolation:** In `DEMO_MODE=true`, telephony actions (search numbers, voice turns, SMS sends) utilize `@talkie/telephony` mock adapters but write real records to the database.
3. **Optimistic Updates:** Safe UI actions (like adding a local message to thread) update immediately while dispatching the background API request with rollback on error.
