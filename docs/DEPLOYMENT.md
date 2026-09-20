# Talkie — Deployment & Operations Guide

Talkie is a cloud-native, carrier-grade AI telephony and omnichannel messaging platform. This guide covers containerized deployment, production environment variables, database configuration, infrastructure scaling, and monitoring.

---

## 1. Architecture Overview

- **Core Web & API:** Next.js 14 App Router, REST API v1 (`/api/v1/*`), Server-Sent Events real-time pubsub (`/api/v1/realtime`), interactive Swagger docs (`/docs`).
- **Database Layer:** Prisma ORM with SQLite for edge / local dev or PostgreSQL / MySQL for clustered multi-region enterprise deployments.
- **Engines & SDKs:**
  - `@talkie/telephony`: Multi-provider carrier adapter (Twilio, Telnyx, Mock).
  - `@talkie/voice`: STT / LLM / TTS orchestration with turn-taking and interruption handling.
  - `@talkie/webhook-engine`: HMAC-SHA256 signed event delivery with exponential backoff & dead-lettering.
  - `@talkie/billing`: Real-time consumption metering and Stripe automated ledger.
  - `@talkie/mcp-server`: Model Context Protocol server for Claude / AI coding assistants.
  - `@talkie/sdk` & `talkie-sdk`: TypeScript and Python client SDKs.

---

## 2. Environment Configuration

Create a `.env.production` file with the following variables:

```bash
# General
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-a-strong-random-32-byte-hex-string

# Database
DATABASE_URL="file:./prod.db" # or "postgresql://user:pass@host:5432/talkie"

# Telephony (Twilio / Carrier)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Voice AI Stack
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_API_KEY=your_elevenlabs_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# Billing & Payments
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxx

# Feature Flags
TALKIE_DEMO_MODE=false # Set true to fallback gracefully without live carrier credentials
```

---

## 3. Docker Deployment

### 3.1 Local Container Run

```bash
# Build the multi-stage image
docker build -t talkie-platform:latest .

# Run container with volume mount for persistent database
docker run -d \
  -p 3000:3000 \
  --name talkie-app \
  -e NEXTAUTH_SECRET="super-secret-key-at-least-32-characters" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e TALKIE_DEMO_MODE="true" \
  -v $(pwd)/packages/database/prisma:/app/packages/database/prisma \
  talkie-platform:latest
```

### 3.2 Production Docker Compose

```bash
# Start container cluster in detached mode
docker-compose -f docker-compose.prod.yml up -d

# View container logs
docker-compose -f docker-compose.prod.yml logs -f

# Check health check status
docker-compose -f docker-compose.prod.yml ps
```

---

## 4. Kubernetes Deployment

### Manifest (`k8s-deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: talkie-platform
  labels:
    app: talkie
spec:
  replicas: 3
  selector:
    matchLabels:
      app: talkie
  template:
    metadata:
      labels:
        app: talkie
    spec:
      containers:
      - name: web
        image: talkie-platform:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
          requests:
            cpu: "500m"
            memory: "512Mi"
```

---

## 5. Observability & Health Monitoring

Talkie exposes zero-auth standardized health check endpoints for load balancers and orchestrators:

- **Liveness Probe:** `GET /api/health`
  - Returns `200 OK` with `{ status: "healthy", timestamp, uptime, version }`
- **Readiness Probe:** `GET /api/ready`
  - Performs active database ping and system check before returning `200 OK` or `503 Service Unavailable`.
- **Request Tracing:** All incoming HTTP requests are assigned a unique `X-Request-Id` correlation header, propagated across logs, API responses, and webhook dispatches.
