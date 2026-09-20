# Environment Configuration Reference

Talkie uses type-safe Zod schema validation (`@talkie/config`) to validate all environment variables at startup.

---

## 1. Environment Master Template

```env
# ==============================================================================
# APP CORE & RUNTIME
# ==============================================================================
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:3000/api
DEMO_MODE=false
AUTH_SECRET=your_32_character_long_auth_secret_key

# ==============================================================================
# DATABASE (PostgreSQL / SQLite)
# ==============================================================================
DATABASE_URL="file:./dev.db"
# Production example:
# DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"

# ==============================================================================
# CLERK AUTHENTICATION
# ==============================================================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=whsec_...

# ==============================================================================
# TELEPHONY & CARRIER PROVIDERS
# ==============================================================================
TELEPHONY_PROVIDER=mock       # mock | twilio | telnyx
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TELNYX_API_KEY=KEY...

# ==============================================================================
# VOICE AI & SPEECH SERVICES
# ==============================================================================
VOICE_AI_PROVIDER=mock        # mock | live
DEEPGRAM_API_KEY=...          # Real-time Speech-to-Text
ELEVENLABS_API_KEY=...        # Real-time Text-to-Speech
OPENAI_API_KEY=...            # LLM & Whisper

# ==============================================================================
# BILLING & STRIPE
# ==============================================================================
BILLING_PROVIDER=mock         # mock | stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 2. Variable Definitions & Descriptions

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `DATABASE_URL` | Yes | `"file:./dev.db"` | Prisma connection string for PostgreSQL or SQLite |
| `AUTH_SECRET` | Yes | - | Secret key (min 32 chars) for JWT and cookie signing |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | - | Clerk frontend publishable key |
| `CLERK_SECRET_KEY` | Yes | - | Clerk backend secret key |
| `TELEPHONY_PROVIDER` | No | `"mock"` | Carrier adapter (`"mock"`, `"twilio"`, `"telnyx"`) |
| `VOICE_AI_PROVIDER` | No | `"mock"` | AI speech pipeline mode (`"mock"`, `"live"`) |
| `DEEPGRAM_API_KEY` | No | - | API key for Deepgram Nova-2 streaming STT |
| `ELEVENLABS_API_KEY` | No | - | API key for ElevenLabs streaming TTS |
| `OPENAI_API_KEY` | No | - | API key for OpenAI GPT-4o voice inference |
| `STRIPE_SECRET_KEY` | No | - | API key for Stripe checkout & automated usage top-ups |
