import { describe, it, expect, beforeAll } from 'vitest';
import {
  WorkspaceService,
  AgentService,
  NumberService,
  ContactService,
  MessageService,
  UsageService,
  IdempotencyService,
  WebhookService,
} from '@talkie/database';
import { MockMessagingProvider, MessageDeliveryManager } from '@talkie/telephony';

describe('Phase 4 Checkpoint: End-to-End Messaging & Conversations Integration', () => {
  let workspaceId: string;
  let provider: MockMessagingProvider;
  let deliveryManager: MessageDeliveryManager;
  let phoneNumber: any;
  let agent: any;
  let contact: any;

  beforeAll(async () => {
    // 1. Setup workspace
    const ws = await WorkspaceService.create({
      name: 'Messaging Integration Test Workspace',
      slug: `msg-test-${Date.now()}`,
    });
    workspaceId = ws.id;
    provider = new MockMessagingProvider();
    deliveryManager = new MessageDeliveryManager();

    // 2. Create agent
    agent = await AgentService.create(workspaceId, {
      name: 'SMS Assistant Agent',
      systemPrompt: 'You are an SMS AI assistant.',
    });

    // 3. Provision number and attach agent
    const testNumber = `+1917${Date.now().toString().slice(-7)}`;
    phoneNumber = await NumberService.provision(workspaceId, {
      phoneNumber: testNumber,
      agentId: agent.id,
      capabilities: { voice: true, sms: true, mms: true },
    });

    // 4. Create initial contact
    contact = await ContactService.create(workspaceId, {
      name: 'Alice Customer',
      phoneNumber: '+14155559876',
      company: 'Alice Co',
    });
  });

  it('Step 1: Dispatches outbound SMS and tracks conversation auto-threading', async () => {
    // Send message via provider
    const dispatch = await provider.sendMessage({
      from: phoneNumber.phoneNumber,
      to: contact.phoneNumber,
      body: 'Hello Alice, your order #429 is ready for pickup!',
    });

    expect(dispatch.messageId).toMatch(/^msg_mock_/);
    expect(dispatch.status).toBe('sent');
    expect(dispatch.segmentCount).toBe(1);

    // Save to database
    const msg = await MessageService.createMessage(workspaceId, {
      phoneNumberId: phoneNumber.id,
      contactId: contact.id,
      agentId: agent.id,
      channel: 'sms',
      direction: 'outbound',
      senderNumber: phoneNumber.phoneNumber,
      recipientNumber: contact.phoneNumber,
      body: 'Hello Alice, your order #429 is ready for pickup!',
      providerMessageId: dispatch.messageId,
      status: dispatch.status,
    });

    expect(msg).toBeDefined();
    expect(msg.direction).toBe('outbound');
    expect(msg.conversationId).toBeDefined();

    // Check conversation thread
    const threads = await MessageService.listConversations(workspaceId);
    expect(threads.length).toBeGreaterThan(0);
    const targetThread = threads.find((t) => t.id === msg.conversationId);
    expect(targetThread).toBeDefined();
    expect(targetThread?.contactId).toBe(contact.id);
  });

  it('Step 2: Simulates inbound SMS and appends to same conversation thread', async () => {
    const inbound = await provider.simulateInboundMessage({
      from: contact.phoneNumber,
      to: phoneNumber.phoneNumber,
      body: 'Thanks! Can I pick it up tomorrow at 10am?',
    });

    expect(inbound.messageId).toMatch(/^in_msg_/);
    expect(inbound.from).toBe(contact.phoneNumber);

    const msg = await MessageService.createMessage(workspaceId, {
      phoneNumberId: phoneNumber.id,
      contactId: contact.id,
      agentId: agent.id,
      channel: 'sms',
      direction: 'inbound',
      senderNumber: contact.phoneNumber,
      recipientNumber: phoneNumber.phoneNumber,
      body: inbound.body,
      providerMessageId: inbound.messageId,
      status: 'delivered',
    });

    expect(msg.direction).toBe('inbound');

    // Verify messages list in conversation
    const conversationMessages = await MessageService.getConversationMessages(
      workspaceId,
      msg.conversationId
    );
    expect(conversationMessages.length).toBe(2);
    expect(conversationMessages[0].direction).toBe('outbound');
    expect(conversationMessages[1].direction).toBe('inbound');
  });

  it('Step 3: Verifies Idempotency caching on duplicate requests', async () => {
    const idempotencyKey = `idem_key_msg_${Date.now()}`;
    const payload = { success: true, messageId: 'msg_unique_101' };

    // Initial check -> null
    const firstCheck = await IdempotencyService.check(workspaceId, idempotencyKey);
    expect(firstCheck).toBeNull();

    // Save
    await IdempotencyService.save(
      workspaceId,
      idempotencyKey,
      '/api/v1/messages',
      200,
      payload
    );

    // Second check -> hit
    const secondCheck = await IdempotencyService.check(workspaceId, idempotencyKey);
    expect(secondCheck).toBeDefined();
    expect(JSON.parse(secondCheck!.responseJson)).toEqual(payload);
  });

  it('Step 4: Tests delivery manager retry backoff calculation and classification', () => {
    const delay0 = deliveryManager.calculateBackoff(0);
    const delay1 = deliveryManager.calculateBackoff(1);
    const delay2 = deliveryManager.calculateBackoff(2);

    expect(delay0).toBeGreaterThanOrEqual(1000);
    expect(delay1).toBeGreaterThanOrEqual(2000);
    expect(delay2).toBeGreaterThanOrEqual(4000);

    const transientResult = deliveryManager.evaluateReceipt({
      messageId: 'msg_1',
      status: 'failed',
      errorCode: 'NETWORK_TIMEOUT',
      timestamp: new Date(),
    });
    expect(transientResult.shouldRetry).toBe(true);

    const permanentResult = deliveryManager.evaluateReceipt({
      messageId: 'msg_2',
      status: 'undelivered',
      errorCode: 'INVALID_NUMBER',
      timestamp: new Date(),
    });
    expect(permanentResult.shouldRetry).toBe(false);
  });

  it('Step 5: Records billing usage accurately for SMS segments', async () => {
    const initialBalance = await UsageService.getBalance(workspaceId);
    expect(initialBalance).toBeDefined();

    const record = await UsageService.recordUsage(workspaceId, {
      type: 'sms',
      quantity: 3,
      costCents: 3,
      description: 'Multi-part outbound marketing SMS',
    });

    expect(record.costCents).toBe(3);
    const history = await UsageService.getUsageHistory(workspaceId);
    expect(history.some((h) => h.id === record.id)).toBe(true);
  });
});
