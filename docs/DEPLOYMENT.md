# Deployment & Cloud Topology

Talkie supports enterprise deployments on **Vercel (Serverless)**, **Docker Containers**, **Kubernetes**, and **Fly.io**.

---

## 1. Cloud Production Topology

```mermaid
flowchart TD
    subgraph Edge["Edge / CDN Network"]
        DNS["Custom Domain / Route53"] --> CDN["Cloudflare / Vercel Edge"]
    end

    subgraph AppTier["Application Layer"]
        CDN --> NextApp["Next.js Web & API Server\n(Vercel Serverless / Docker)"]
    end

    subgraph ServiceMesh["Managed Cloud Services"]
        NextApp <--> Clerk["Clerk Authentication"]
        NextApp <--> Database[("PostgreSQL Database\n(Neon / Supabase / AWS RDS)")]
        NextApp <--> Redis[("Redis Pub/Sub & Cache\n(Upstash / AWS ElastiCache)")]
        NextApp <--> AIProviders["AI Speech & LLM APIs\n(Deepgram / OpenAI / ElevenLabs)"]
        NextApp <--> Carriers["Telephony Carriers\n(Twilio / Telnyx)"]
    end
```

---

## 2. Deploying on Vercel (Next.js Monorepo)

### Project Configuration
- **Framework Preset:** `Next.js`
- **Root Directory:** `./`
- **Build Command:** `pnpm --filter @talkie/database db:generate && pnpm --filter @talkie/web build`
- **Output Directory:** Default (`.next`)
- **Install Command:** `pnpm install`

### Required Environment Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
AUTH_SECRET=your_32_char_secret_key
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
APP_URL=https://your-domain.vercel.app
API_URL=https://your-domain.vercel.app/api
```

---

## 3. Docker Multi-Stage Build

```dockerfile
# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate
RUN pnpm --filter @talkie/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```
