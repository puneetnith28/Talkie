# Clerk Authentication & Multi-Tenant Security Audit

## Overview
This audit establishes the transition plan from standalone password/JWT session utilities to official **Clerk Authentication** (`@clerk/nextjs`), ensuring seamless user synchronization, robust multi-tenant workspace isolation, and zero production auth bypass.

---

## 1. Authentication Architecture Mapping

```
                               ┌────────────────────────┐
                               │   Clerk Auth Server    │
                               │  (Sign-in / Sign-up)   │
                               └───────────┬────────────┘
                                           │ Session Token / JWT
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Talkie Next.js App                                     │
│                                                                                        │
│   ┌────────────────────────┐                   ┌───────────────────────────────────┐   │
│   │    Clerk Middleware    │ ────────────────► │        ClerkProvider Layout       │   │
│   │ (Protects /dashboard/*)│                   │   (UserButton, SignIn, SignUp)   │   │
│   └───────────┬────────────┘                   └─────────────────┬─────────────────┘   │
│               │                                                  │                     │
│               ▼                                                  ▼                     │
│   ┌────────────────────────┐                   ┌───────────────────────────────────┐   │
│   │ Clerk Webhook Handler  │                   │      User Synchronization         │   │
│   │ (/api/webhooks/clerk)  │ ────────────────► │  (Clerk User -> DB User + WS)     │   │
│   └────────────────────────┘                   └─────────────────┬─────────────────┘   │
│                                                                  │                     │
│                                                ┌─────────────────▼─────────────────┐   │
│                                                │     Tenant Isolation Guard        │   │
│                                                │ (Validates workspaceId ownership) │   │
│                                                └───────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Environment Configuration Requirements

The following environment variables are required in `.env.example` and runtime configuration:

```env
# Clerk Public & Secret Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Route Redirection
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## 3. Key Integration Guidelines (from workflow2.md)

1. **Root Provider:** Wrap root layout with `<ClerkProvider>` supporting modern dark theme appearance matching Talkie brand tokens.
2. **Middleware Protection:** Enforce authentication on all `/dashboard/*` and `/settings/*` routes using `clerkMiddleware()`.
3. **Database Synchronization:**
   - Add `clerkUserId String? @unique` on Prisma `User` model.
   - On first authenticated access or via Clerk Webhook (`user.created`), create matching `User`, personal `Workspace`, and `WorkspaceMember` with `role: "owner"`.
   - Ensure synchronization is strictly idempotent so subsequent logins never duplicate records.
4. **API Authentication:** Protected `/api/v1/*` routes derive identity from Clerk session auth or API key authorization (`Bearer ap_live_...`).
5. **Demo Mode Fallback:** When `DEMO_MODE=true` is explicitly set in development, provide clear console feedback; in production, missing Clerk keys fail safely with descriptive configuration warnings.
