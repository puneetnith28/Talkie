import { describe, it, expect, beforeAll } from 'vitest';
import {
  WorkspaceService,
  WebhookService,
  ChannelAccountService,
  UsageService,
  prisma,
} from '@talkie/database';
import { generateApiKey, hashApiKey, verifyApiKey } from '@talkie/auth';
import { WebhookDispatcher, WebhookEventBuilder, WebhookSigner, WebhookRetryManager } from '@talkie/webhook-engine';
import { UsageMeter } from '@talkie/billing';

describe('Workflow 3 Phase 2: Production Developer Platform, Webhooks, Billing & Security Suite', () => {
  let workspaceA: any;
  let workspaceB: any;

  beforeAll(async () => {
    workspaceA = await WorkspaceService.create({
      name: 'Phase 2 Tenant Alpha',
      slug: `tenant-alpha-${Date.now()}`,
    });

    workspaceB = await WorkspaceService.create({
      name: 'Phase 2 Tenant Beta',
      slug: `tenant-beta-${Date.now()}`,
    });
  });

  describe('Step 11 & 12: Normalized Webhook Ingestion Engine & Delivery Inspector', () => {
    let webhookA: any;

    it('creates a webhook endpoint with secure secret and subscribed events', async () => {
      webhookA = await WebhookService.createWebhook(workspaceA.id, {
        url: 'https://api.tenant-alpha.io/events/talkie',
        events: ['call.started', 'call.ended', 'message.received'],
      });

      expect(webhookA).toBeDefined();
      expect(webhookA.secret).toMatch(/^whsec_[a-f0-9]{48}$/);
      expect(webhookA.status).toBe('active');
    });

    it('evaluates retry policy correctly for retryable vs dead-letter status codes', () => {
      const retryManager = new WebhookRetryManager({ maxAttempts: 3 });

      expect(retryManager.isRetryable(500)).toBe(true);
      expect(retryManager.isRetryable(503)).toBe(true);
      expect(retryManager.isRetryable(429)).toBe(true);
      expect(retryManager.isRetryable(404)).toBe(false);
      expect(retryManager.isRetryable(401)).toBe(false);

      const retry1 = retryManager.getNextRetry(1, 500);
      expect(retry1.shouldRetry).toBe(true);
      expect(retry1.isDeadLetter).toBe(false);
      expect(retry1.nextRetryAt).toBeInstanceOf(Date);

      const deadLetter = retryManager.getNextRetry(3, 500);
      expect(deadLetter.shouldRetry).toBe(false);
      expect(deadLetter.isDeadLetter).toBe(true);
    });

    it('dispatches event, signs with HMAC-SHA256, and logs delivery attempt with payload', async () => {
      let receivedSignature = '';
      let receivedPayload = '';

      const mockFetch: typeof fetch = async (url, init) => {
        receivedSignature = (init?.headers as Record<string, string>)['X-Talkie-Signature'];
        receivedPayload = init?.body as string;
        return new Response(JSON.stringify({ acknowledged: true }), { status: 200 });
      };

      const dispatcher = new WebhookDispatcher({ fetchFn: mockFetch });
      const event = WebhookEventBuilder.createEvent(workspaceA.id, 'message.received', {
        messageId: 'msg_999',
        channel: 'whatsapp',
        from: '+15551234567',
        text: 'Hello Talkie Webhook',
      });

      const attempt = await dispatcher.dispatch(
        {
          id: webhookA.id,
          workspaceId: workspaceA.id,
          url: webhookA.url,
          secret: webhookA.secret,
          events: ['message.received'],
          status: 'active',
        },
        event
      );

      expect(attempt.status).toBe('success');
      expect(attempt.statusCode).toBe(200);
      expect(WebhookSigner.verify(receivedPayload, receivedSignature, webhookA.secret)).toBe(true);

      const deliveryRecord = await WebhookService.recordDelivery(webhookA.id, {
        event: event.event,
        payload: event,
        statusCode: attempt.statusCode,
        responseBody: attempt.responseBody,
        latencyMs: attempt.latencyMs,
        attempt: 1,
        status: 'success',
      });

      expect(deliveryRecord.id).toBeDefined();
      expect(deliveryRecord.event).toBe('message.received');

      const deliveries = await WebhookService.getWebhookDeliveries(webhookA.id);
      expect(deliveries.length).toBeGreaterThan(0);
      expect(deliveries[0].id).toBe(deliveryRecord.id);
    });
  });

  describe('Step 13: Secure API Key Management & Hashing', () => {
    let generatedKey: any;
    let apiKeyRecord: any;

    it('generates cryptographic SHA-256 API key with prefix tk_live_', async () => {
      generatedKey = generateApiKey('tk_live');

      expect(generatedKey.rawKey).toMatch(/^tk_live_[a-f0-9]{48}$/);
      expect(generatedKey.keyHash).toHaveLength(64); // SHA-256 hex length
      expect(generatedKey.keyHint).toContain('tk_live_...');

      apiKeyRecord = await prisma.apiKey.create({
        data: {
          workspaceId: workspaceA.id,
          name: 'Production SDK Service Key',
          keyHash: generatedKey.keyHash,
          keyHint: generatedKey.keyHint,
        },
      });

      expect(apiKeyRecord.id).toBeDefined();
      expect(apiKeyRecord.revokedAt).toBeNull();
    });

    it('validates raw key hash in constant time and rejects invalid keys', () => {
      expect(verifyApiKey(generatedKey.rawKey, generatedKey.keyHash)).toBe(true);
      expect(verifyApiKey('tk_live_invalid_fake_key_1234567890', generatedKey.keyHash)).toBe(false);
    });

    it('revokes API key and verifies revocation status', async () => {
      await prisma.apiKey.update({
        where: { id: apiKeyRecord.id },
        data: { revokedAt: new Date() },
      });

      const updated = await prisma.apiKey.findUnique({
        where: { id: apiKeyRecord.id },
      });

      expect(updated?.revokedAt).not.toBeNull();
    });
  });

  describe('Step 14: Billing Ledger & Usage Aggregator', () => {
    const meter = new UsageMeter();

    it('accurately calculates voice, SMS, and TTS rates', () => {
      // 120s voice = 2 mins * (5 + 0.5) = 11 cents
      const voiceCost = meter.calculateVoiceCallCost(120);
      expect(voiceCost).toBe(11);

      // 320 chars SMS = 2 segments * 1.5 cents = 3 cents
      const smsCost = meter.calculateSmsCost(320);
      expect(smsCost).toBe(3);

      // 5000 chars TTS = 5k * 1.5 cents = 8 cents
      const ttsCost = meter.calculateTtsCost(5000);
      expect(ttsCost).toBe(8);
    });

    it('records debit usage transactions and credits top-up transactions with ledger reconciliation', async () => {
      const initialBalance = await UsageService.getBalance(workspaceA.id);

      // Top up $20.00 (2000 cents)
      const afterTopUp = await UsageService.topUpBalance(workspaceA.id, 2000, 'Test Credit Topup');
      expect(afterTopUp.balanceCents).toBe(initialBalance + 2000);

      // Record voice usage (5 mins = 28 cents)
      await UsageService.recordUsage(workspaceA.id, {
        type: 'voice_minute',
        quantity: 5,
        unit: 'minutes',
        costCents: 28,
        description: 'Outbound AI Voice Call (5 mins)',
      });

      const finalBalance = await UsageService.getBalance(workspaceA.id);
      expect(finalBalance).toBe(initialBalance + 2000 - 28);

      const summary = await UsageService.getUsageSummary(workspaceA.id);
      expect(summary.recordsCount).toBeGreaterThanOrEqual(2);
      expect(summary.byType['voice_minute'].quantity).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Step 15: Omnichannel Channel Connection Hub & Safe Disconnect', () => {
    let waAccount: any;
    let tgAccount: any;

    it('connects and securely persists WhatsApp Business account credentials', async () => {
      waAccount = await ChannelAccountService.upsertAccount(workspaceA.id, {
        type: 'whatsapp',
        name: 'Talkie Global Support WhatsApp',
        identifier: '109876543210',
        credentials: {
          phoneNumberId: '109876543210',
          accessToken: 'EAAG_test_system_user_token',
          appSecret: 'test_meta_app_secret_123',
          verifyToken: 'talkie_wa_verify_token',
        },
        webhookUrl: '/api/v1/channels/whatsapp/webhook',
      });

      expect(waAccount).toBeDefined();
      expect(waAccount.status).toBe('active');
      expect(waAccount.identifier).toBe('109876543210');

      const waAccounts = await ChannelAccountService.listAccounts(workspaceA.id, 'whatsapp');
      expect(waAccounts.some((a) => a.id === waAccount.id)).toBe(true);
    });

    it('connects and securely persists Telegram Bot account', async () => {
      tgAccount = await ChannelAccountService.upsertAccount(workspaceA.id, {
        type: 'telegram',
        name: 'Talkie AI Support Bot',
        identifier: 'talkie_prod_bot',
        credentials: {
          botToken: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
          botUsername: 'talkie_prod_bot',
        },
        webhookUrl: '/api/v1/channels/telegram/webhook',
      });

      expect(tgAccount).toBeDefined();
      expect(tgAccount.status).toBe('active');
      expect(tgAccount.identifier).toBe('talkie_prod_bot');
    });

    it('safely disconnects channel account while maintaining workspace integrity', async () => {
      await ChannelAccountService.disconnectAccount(workspaceA.id, waAccount.id);

      const updated = await prisma.channelAccount.findUnique({
        where: { id: waAccount.id },
      });

      expect(updated?.status).toBe('disconnected');
    });
  });

  describe('Step 19: Multi-Tenant Workspace Barrier Hardening', () => {
    it('strictly isolates webhooks and prevents cross-tenant access', async () => {
      const tenantAWebhooks = await WebhookService.listWebhooks(workspaceA.id);
      const tenantBWebhooks = await WebhookService.listWebhooks(workspaceB.id);

      expect(tenantAWebhooks.every((w) => w.workspaceId === workspaceA.id)).toBe(true);
      expect(tenantBWebhooks.every((w) => w.workspaceId === workspaceB.id)).toBe(true);

      if (tenantAWebhooks.length > 0) {
        // Attempting to query Tenant A's webhook with Tenant B's workspace ID should return null
        const crossAccess = await WebhookService.getWebhookById(workspaceB.id, tenantAWebhooks[0].id);
        expect(crossAccess).toBeNull();
      }
    });

    it('strictly isolates channel accounts between separate tenants', async () => {
      const tenantAChannels = await ChannelAccountService.listAccounts(workspaceA.id);
      const tenantBChannels = await ChannelAccountService.listAccounts(workspaceB.id);

      expect(tenantAChannels.every((c) => c.workspaceId === workspaceA.id)).toBe(true);
      expect(tenantBChannels.every((c) => c.workspaceId === workspaceB.id)).toBe(true);
      expect(tenantBChannels.some((c) => c.workspaceId === workspaceA.id)).toBe(false);
    });
  });
});
