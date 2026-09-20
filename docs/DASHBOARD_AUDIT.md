# Talkie Console: Dashboard & Truthfulness Audit (Workflow 3)

## 1. Executive Summary
This document provides a comprehensive technical and visual truthfulness inventory of the Talkie Console and platform services. Every metric, label, status badge, action button, and card is cataloged against its authoritative database model, API endpoint, and provider integration.

---

## 2. Component & Metric Truthfulness Matrix

| Dashboard Component | Visible Label / Metric | Authoritative Data Source | Endpoint / Service | Status & Hardcode Audit | Action Required |
|---|---|---|---|---|---|
| **Workspace Header** | Workspace Name | Prisma `Workspace.name` | `GET /api/v1/auth/me` / `GET /api/v1/dashboard/stats` | Dynamic via DB | Ensure fallback uses honest workspace identifier. |
| **Workspace Header** | Description | Static / Config | Static markup | Generic claim | Keep factual and concise. |
| **Top Right Actions** | Create Agent button | Navigation | `/dashboard/agents` (modal / page) | Functional | Preserved. |
| **Top Right Actions** | Get Phone Number button | Navigation | `/dashboard/numbers` (provisioning flow) | Functional | Preserved. |
| **Refresh Button** | Live Telemetry Refresher | Trigger | `loadStats(true)` | Functional with loading spinner | Preserved. |
| **Card 1: AI Agents** | Agent Count | Prisma `Agent.count({ where: { workspaceId } })` | `GET /api/v1/dashboard/stats` | Dynamic | Replace misleading "voice bots" copy with factual "configured agents". |
| **Card 2: Phone Numbers** | Number Count | Prisma `PhoneNumber.count({ where: { workspaceId } })` | `GET /api/v1/dashboard/stats` | Dynamic | Replace "carrier lines" with "assigned numbers". |
| **Card 3: Calls** | Total Calls | Prisma `Call.count({ where: { workspaceId } })` | `GET /api/v1/dashboard/stats` | Dynamic | Prevent "100% success rate" when zero calls exist. Show "No calls yet". |
| **Card 4: Credit Balance** | Balance in Dollars | Prisma `Workspace.balanceCents` | `GET /api/v1/dashboard/stats` | Dynamic via ledger | Show dynamic balance ledger value. |
| **Onboarding Checklist** | Agent Created (Step 1) | `stats.agentCount > 0` | `GET /api/v1/dashboard/stats` | Dynamic | Retain. |
| **Onboarding Checklist** | Number Claimed (Step 2) | `stats.numberCount > 0` | `GET /api/v1/dashboard/stats` | Dynamic | Retain. |
| **Onboarding Checklist** | First Call (Step 3) | `stats.totalCalls > 0` | `GET /api/v1/dashboard/stats` | Dynamic | Retain. |
| **Onboarding Checklist** | API Key Generated (Step 4) | Prisma `ApiKey.count > 0` | `GET /api/v1/dashboard/stats` | Was hardcoded `done: true` | **Fix in Step 2/3**: Derive dynamically from `stats.hasApiKeys`. |
| **Recent Activity Stream**| Event timeline | Prisma `Call`, `Message`, `ActivityEvent` | `GET /api/v1/dashboard/stats` | Dynamic | Ensure empty state renders cleanly when 0 events exist. |
| **Developer Quickstart** | Links & MCP info | Static navigation | `/docs`, `/dashboard/settings/api-keys`, `/dashboard/webhooks` | Functional | Keep minimal and remove fluff. |

---

## 3. Data Ownership & Source of Truth Matrix

| Domain Entity | Primary Source of Truth | Synchronization / Cache Strategy | Failure / Disconnected State |
|---|---|---|---|
| **Agents** | Prisma `Agent` table | Direct PostgreSQL query | Empty list state (`No agents created yet`) |
| **Phone Numbers** | Provider carrier inventory + Prisma `PhoneNumber` | Webhook sync / Provider polling | Honest provider error / unassigned state |
| **Voice Calls** | Provider Call Session + Prisma `Call` & `Transcript` | Real-time SSE / Webhook ingestion | Logged with failed status code |
| **SMS Messages** | Carrier Webhooks + Prisma `Message` | Idempotent DB record | Failed delivery status |
| **WhatsApp Messages** | Meta WhatsApp Cloud API + Prisma `Message` | Inbound webhook verification & state tracking | Disconnected / unverified banner |
| **Telegram Messages** | Telegram Bot API + Prisma `Message` | Inbound webhook updates | Disconnected / invalid token banner |
| **Usage & Credits** | Prisma `UsageRecord` & `BillingLedger` | Atomic ledger transactions | `$0.00` with top-up prompt |
| **Webhooks** | Prisma `WebhookEndpoint` & `WebhookDelivery` | In-memory retry queue + DB log | Exhausted retry state with replay action |

---

## 4. Hardcoded Value Classifications & Remediation

1. **Onboarding Checklist Step 4 (`done: true`)**:
   - *Classification*: Invalid production hardcode.
   - *Remediation*: Query `prisma.apiKey.count({ where: { workspaceId } })` in `/api/v1/dashboard/stats` and pass `hasApiKey`.
2. **Success Rate for 0 Calls (`100%`)**:
   - *Classification*: Misleading aggregate.
   - *Remediation*: Render `No calls yet` when `totalCalls === 0` instead of a fabricated `100%`.
3. **Card Microcopy ("active voice bots")**:
   - *Classification*: Inaccurate marketing copy.
   - *Remediation*: Factual dynamic copy: `X agents configured`.
