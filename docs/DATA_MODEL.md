# Data Model & State Machines

Talkie utilizes Prisma ORM with strict multi-tenant isolation across all data models. Every resource is partitioned by `workspaceId` and scoped to its parent organization.

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    Workspace ||--o{ WorkspaceMember : contains
    User ||--o{ WorkspaceMember : belongs_to
    Workspace ||--o{ ApiKey : owns
    Workspace ||--o{ Agent : configures
    Workspace ||--o{ PhoneNumber : provisions
    Workspace ||--o{ Call : logs
    Workspace ||--o{ Conversation : tracks
    Workspace ||--o{ Contact : stores
    Workspace ||--o{ ChannelAccount : connects
    Workspace ||--o{ Webhook : registers
    Workspace ||--o{ UsageRecord : meters
    Workspace ||--o{ AuditLog : records

    Agent ||--o{ PhoneNumber : assigned_to
    Agent ||--o{ Call : handles
    Agent ||--o{ Conversation : participates

    PhoneNumber ||--o{ Call : routes
    PhoneNumber ||--o{ Conversation : binds

    Call ||--o{ Transcript : produces
    Conversation ||--o{ Message : contains
    Contact ||--o{ Conversation : associates
    Webhook ||--o{ WebhookDelivery : dispatches

    Workspace {
        string id PK
        string name
        string slug UK
        int balanceCents
        datetime createdAt
    }

    User {
        string id PK
        string email UK
        string name
        string clerkUserId UK
    }

    Agent {
        string id PK
        string workspaceId FK
        string name
        string voiceMode
        string systemPrompt
        string voice
        string language
        string status
    }

    PhoneNumber {
        string id PK
        string workspaceId FK
        string agentId FK
        string phoneNumber UK
        string country
        string status
    }

    Call {
        string id PK
        string workspaceId FK
        string agentId FK
        string phoneNumberId FK
        string direction
        string fromNumber
        string toNumber
        string status
        int durationSeconds
    }

    Conversation {
        string id PK
        string workspaceId FK
        string channel
        string contactId FK
        datetime lastMessageAt
    }

    Message {
        string id PK
        string conversationId FK
        string direction
        string body
        string status
        datetime sentAt
    }
```

---

## 2. Call Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Queued : Call Initiated
    Queued --> Ringing : Provider Dialing
    Ringing --> InProgress : Caller Answers
    Ringing --> Busy : Busy Signal
    Ringing --> NoAnswer : Timeout
    
    InProgress --> Completed : Normal Termination
    InProgress --> Failed : Network / Audio Failure
    Queued --> Cancelled : User Aborts Before Ringing
    
    Completed --> [*]
    Failed --> [*]
    Busy --> [*]
    NoAnswer --> [*]
    Cancelled --> [*]
```

---

## 3. Webhook Delivery State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending : Event Triggered
    Pending --> Success : HTTP 2xx Received
    Pending --> Retrying : HTTP 4xx / 5xx / Timeout
    
    Retrying --> Success : Retry Succeeded
    Retrying --> Failed : Max Attempts (5) Exceeded (Dead-Letter)
    
    Success --> [*]
    Failed --> [*]
```

---

## 4. Multi-Tenant Scoping Rules

1. **Foreign Key Integrity:** All primary application entities (`Agent`, `PhoneNumber`, `Call`, `Conversation`, `Contact`, `Webhook`, `ApiKey`) have mandatory foreign keys to `Workspace` with `onDelete: Cascade`.
2. **Compound Indexes:** Critical lookup paths utilize compound indexes `[workspaceId, id]` or `[workspaceId, status]` to optimize multi-tenant query performance.
3. **Audit Logging:** Administrative operations write immutable records to the `AuditLog` table capturing `userId`, `action`, `resourceType`, `ip`, and timestamp.
