# Talkie REST API v1 Reference

Welcome to the Talkie Carrier & AI Voice Platform REST API documentation.

## Base URLs
- **Local / Self-Hosted:** `http://localhost:3000/api/v1`
- **Production Cloud:** `https://api.talkie.ai/v1`

## Authentication
All API endpoints require authentication via Bearer API keys generated in the Talkie Console:
```http
Authorization: Bearer tk_live_your_api_key_here
```

---

## 1. Agents API

### List Agents
```http
GET /api/v1/agents
```
**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/agents" \
  -H "Authorization: Bearer tk_live_..."
```

### Create Agent
```http
POST /api/v1/agents
Content-Type: application/json
```
```json
{
  "name": "Receptionist AI",
  "systemPrompt": "You are a friendly clinic receptionist.",
  "voice": "aura-asteria-en",
  "language": "en-US",
  "voiceSpeed": 1.0,
  "interruptionSensitivity": 0.6
}
```

---

## 2. Phone Numbers API

### Search Inventory
```http
GET /api/v1/numbers/search?country=US&areaCode=415
```

### Provision Number
```http
POST /api/v1/numbers
Content-Type: application/json
```
```json
{
  "phoneNumber": "+14155550199",
  "agentId": "agent_cuid_123"
}
```

---

## 3. Messages API

### Send Outbound SMS / MMS
```http
POST /api/v1/messages
Idempotency-Key: idem_unique_msg_101
Content-Type: application/json
```
```json
{
  "from": "+14155550100",
  "to": "+14155550199",
  "body": "Hello from Talkie AI! Your appointment is confirmed for 2:00 PM."
}
```

---

## 4. Voice Calls API

### Initiate Outbound AI Call
```http
POST /api/v1/calls
Content-Type: application/json
```
```json
{
  "agentId": "agent_cuid_123",
  "from": "+14155550100",
  "to": "+14155550199"
}
```

### Real-Time Call Controls
```http
POST /api/v1/calls/{id}/control
Content-Type: application/json
```
```json
{
  "action": "hangup"
}
```

---

## 5. Webhooks API

### Create Webhook Endpoint
```http
POST /api/v1/webhooks
Content-Type: application/json
```
```json
{
  "url": "https://api.yourdomain.com/webhooks/talkie",
  "events": ["call.started", "call.ended", "message.received"]
}
```

### Webhook Verification (HMAC-SHA256)
Every webhook delivery includes `X-Talkie-Signature` formatted as `t={timestamp},v1={hmac}`. Verify using:
```typescript
import { WebhookSigner } from '@talkie/webhook-engine';

const isValid = WebhookSigner.verify(rawBody, signatureHeader, webhookSecret);
```
