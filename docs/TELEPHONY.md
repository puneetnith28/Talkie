# Telephony & Omnichannel Messaging

Talkie provides an enterprise-grade telephony abstraction layer (`@talkie/telephony`) supporting instant E.164 phone number provisioning, inbound/outbound voice routing, and omnichannel messaging across SMS, MMS, WhatsApp, and Telegram.

---

## 1. Telephony Provider Architecture

```mermaid
flowchart TD
    subgraph AppCore["Talkie Platform Core"]
        AgentRouter["Agent & Call Routing Engine"]
        MessageDispatcher["Omnichannel Message Router"]
    end

    subgraph Abstraction["Telephony Abstraction Interface"]
        ITelephony["TelephonyProvider Interface\n• searchNumbers()\n• buyNumber()\n• initiateCall()\n• terminateCall()\n• sendSms()"]
    end

    subgraph Providers["Carrier & Channel Adapters"]
        MockAdapter["Mock Telephony Simulator\n(Local Dev & Demo Mode)"]
        TwilioAdapter["Twilio Adapter\n(Voice & Messaging APIs)"]
        TelnyxAdapter["Telnyx Adapter\n(SIP Trunk & Programmable Voice)"]
        WhatsAppAdapter["WhatsApp Cloud API Adapter"]
        TelegramAdapter["Telegram Bot API Adapter"]
    end

    AppCore --> ITelephony
    ITelephony --> MockAdapter
    ITelephony --> TwilioAdapter
    ITelephony --> TelnyxAdapter
    ITelephony --> WhatsAppAdapter
    ITelephony --> TelegramAdapter
```

---

## 2. Inbound & Outbound SMS Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Mobile User
    participant Carrier as SMS Carrier Gateway
    participant InboundEndpoint as /api/webhooks/telephony/inbound-sms
    participant DB as Prisma Database
    participant SSE as Dashboard SSE Stream
    participant WebhookEngine as Webhook Dispatcher
    participant Agent as AI Agent Engine

    Customer->>Carrier: Sends SMS to E.164 Number
    Carrier->>InboundEndpoint: POST Incoming Message Payload
    InboundEndpoint->>InboundEndpoint: Verify Carrier Signature
    InboundEndpoint->>DB: Match E.164 Number to Workspace & Agent
    InboundEndpoint->>DB: Find or Create Contact & Conversation Thread
    InboundEndpoint->>DB: Save Message (direction: 'inbound')
    InboundEndpoint->>SSE: Emit 'message.received' Event
    InboundEndpoint->>WebhookEngine: Dispatch Customer Webhook

    opt Agent Auto-Reply Enabled
        InboundEndpoint->>Agent: Generate AI Reply
        Agent->>DB: Save Message (direction: 'outbound')
        Agent->>Carrier: POST Outbound SMS to Customer
        Carrier-->>Customer: Delivers SMS Response
    end
```

---

## 3. Phone Number Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Available : Carrier Inventory Search
    Available --> Provisioning : Purchase Request
    Provisioning --> Active : Carrier Allocation & Webhook Setup
    Active --> Active : Inbound Calls & Messages Routed to Agent
    Active --> Released : Number Release / Deallocation
    Released --> [*]
```

### Number Capabilities:
- **Voice Inbound & Outbound:** Bidirectional speech streaming via WebRTC/SIP.
- **SMS & MMS Messaging:** Text and multimedia content routing with automated conversation threading.
- **Agent Binding:** Dynamic assignment to conversational AI agents with zero carrier reprovisioning downtime.

---

## 4. Omnichannel Channels & Identifiers

| Channel | Identifier Format | Inbound Webhook Route |
|---|---|---|
| **SMS / MMS** | E.164 Phone (`+14155550142`) | `/api/webhooks/telephony/inbound-sms` |
| **Voice Calls** | E.164 Phone (`+14155550142`) | `/api/webhooks/telephony/inbound-call` |
| **WhatsApp** | Phone Number ID (`whatsapp:+14155550142`) | `/api/v1/channels/whatsapp/webhook` |
| **Telegram** | Bot Username / Chat ID (`@TalkieAssistantBot`) | `/api/v1/channels/telegram/webhook` |
