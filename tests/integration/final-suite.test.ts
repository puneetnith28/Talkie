import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  prisma,
  WorkspaceService,
  AgentService,
  NumberService,
  CallService,
  MessageService,
  ContactService,
  UsageService,
} from '@talkie/database';
import { MockTelephonyProvider, MockMessagingProvider } from '@talkie/telephony';
import { SessionCoordinator, MockCallProvider, LLMConversationEngine } from '@talkie/voice';
import { WebhookDispatcher, WebhookEventBuilder, WebhookSigner } from '@talkie/webhook-engine';
import { UsageMeter, MockBillingProvider } from '@talkie/billing';

describe('Talkie End-to-End Enterprise Acceptance Suite (Step 98/100)', () => {
  let workspaceId: string;
  let agentId: string;
  let phoneNumberId: string;
  let provisionedNumber: string;
  let telephonyProvider: MockTelephonyProvider;
  let messagingProvider: MockMessagingProvider;

  beforeAll(async () => {
    telephonyProvider = new MockTelephonyProvider();
    messagingProvider = new MockMessagingProvider();
    // 1. Workspace Provisioning
    const ws = await WorkspaceService.create({
      name: 'Final Verification Corp',
      slug: `final-corp-${Date.now()}`,
    });
    workspaceId = ws.id;
  });

  afterAll(async () => {
    await prisma.workspace.delete({ where: { id: workspaceId } }).catch(() => {});
  });

  it('1. should create AI voice agent with custom instructions and voice mode', async () => {
    const agent = await AgentService.create(workspaceId, {
      name: 'Enterprise Support Agent',
      systemPrompt: 'You are an enterprise AI support agent.',
      beginMessage: 'Hello, thank you for calling Talkie Enterprise.',
      voice: 'aura-asteria-en',
      voiceSpeed: 1.0,
      interruptionSensitivity: 0.6,
      maxSilenceMs: 1800,
    });

    expect(agent).toBeDefined();
    expect(agent.id).toBeDefined();
    expect(agent.name).toBe('Enterprise Support Agent');
    expect(agent.voice).toBe('aura-asteria-en');
    agentId = agent.id;
  });

  it('2. should search and provision phone numbers with carrier capabilities', async () => {
    const searchResults = await telephonyProvider.searchNumbers({
      country: 'US',
      areaCode: '415',
      limit: 3,
    });

    expect(searchResults.length).toBeGreaterThan(0);
    const chosenNumber = searchResults[0].phoneNumber;

    const provisioned = await NumberService.provision(workspaceId, {
      phoneNumber: chosenNumber,
      provider: 'mock',
      country: 'US',
      countryCode: '+1',
      areaCode: '415',
      capabilities: { voice: true, sms: true, mms: false },
    });

    expect(provisioned.id).toBeDefined();
    expect(provisioned.phoneNumber).toBe(chosenNumber);
    expect(provisioned.status).toBe('active');
    phoneNumberId = provisioned.id;
    provisionedNumber = provisioned.phoneNumber;
  });

  it('3. should attach phone number to agent and verify routing', async () => {
    const updatedNumber = await NumberService.attachToAgent(workspaceId, phoneNumberId, agentId);
    expect(updatedNumber.agentId).toBe(agentId);

    const agentNumbers = await NumberService.list(workspaceId);
    const matched = agentNumbers.find((n) => n.id === phoneNumberId);
    expect(matched?.agentId).toBe(agentId);
  });

  it('4. should execute simulated voice call with STT, LLM, TTS and state machine', async () => {
    const callProvider = new MockCallProvider();
    const llm = new LLMConversationEngine();
    const coordinator = new SessionCoordinator(
      {
        callId: 'call-e2e-final',
        workspaceId,
        agentId,
        agentName: 'Enterprise Support Agent',
        systemPrompt: 'You are an AI assistant.',
        beginMessage: 'Welcome to Talkie AI.',
        voice: 'aura-asteria-en',
        language: 'en-US',
        voiceSpeed: 1.0,
        interruptionSensitivity: 0.5,
        enableBackchannel: true,
        maxSilenceMs: 2000,
        callerNumber: '+14155550199',
        calleeNumber: provisionedNumber,
        direction: 'inbound',
      },
      { callProvider, llm }
    );

    await coordinator.start();
    expect(coordinator.getState()).toBe('listening');

    await coordinator.handleUserSpeech('I would like to check my enterprise quota.');
    const transcript = coordinator.getTranscript();
    expect(transcript.length).toBeGreaterThanOrEqual(2);

    const endResult = await coordinator.end();
    expect(endResult.summary).toBeDefined();
    expect(coordinator.getState()).toBe('ended');
  });

  it('5. should handle omnichannel SMS threads and conversations', async () => {
    const contact = await ContactService.create(workspaceId, {
      name: 'Test Customer',
      phoneNumber: '+14155550999',
    });

    const msg = await MessageService.createMessage(workspaceId, {
      phoneNumberId,
      contactId: contact.id,
      agentId,
      channel: 'sms',
      direction: 'outbound',
      senderNumber: provisionedNumber,
      recipientNumber: contact.phoneNumber,
      body: 'Hello from Talkie Omnichannel API!',
      status: 'sent',
    });

    expect(msg.id).toBeDefined();
    expect(msg.body).toBe('Hello from Talkie Omnichannel API!');
    expect(msg.conversationId).toBeDefined();

    const messages = await MessageService.getConversationMessages(workspaceId, msg.conversationId);
    expect(messages.length).toBe(1);
    expect(messages[0].body).toBe('Hello from Talkie Omnichannel API!');
  });

  it('6. should construct and sign webhook events with HMAC-SHA256', async () => {
    const secret = 'whsec_e2e_super_secret_test_key_12345';
    const event = WebhookEventBuilder.createEvent(workspaceId, 'call.ended', {
      callId: 'call_test_123',
      durationSeconds: 42,
      status: 'completed',
    });

    expect(event.event).toBe('call.ended');
    expect(event.data.durationSeconds).toBe(42);

    let capturedSignature = '';
    let capturedBody = '';
    const mockFetch: typeof fetch = async (url, init) => {
      capturedSignature = (init?.headers as Record<string, string>)['X-Talkie-Signature'];
      capturedBody = init?.body as string;
      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    };

    const dispatcher = new WebhookDispatcher({ fetchFn: mockFetch });
    const dispatchResult = await dispatcher.dispatch(
      {
        id: 'wh_test_1',
        workspaceId,
        url: 'https://example.com/webhook',
        secret,
        events: ['call.ended'],
        status: 'active',
      },
      event
    );

    expect(dispatchResult.status).toBe('success');
    expect(WebhookSigner.verify(capturedBody, capturedSignature, secret)).toBe(true);
  });

  it('7. should record and compute real-time billing metrics and usage records', async () => {
    const meter = new UsageMeter();
    const voiceCost = meter.calculateVoiceCallCost(300); // 5 mins
    expect(voiceCost).toBeGreaterThan(0);

    const smsCost = meter.calculateSmsCost(150); // 1 segment
    expect(smsCost).toBeGreaterThan(0);

    const initialBalance = await UsageService.getBalance(workspaceId);
    const usage = await UsageService.recordUsage(workspaceId, {
      type: 'voice_minutes',
      quantity: 5,
      costCents: voiceCost,
      description: 'End-to-end call test usage',
    });

    expect(usage.id).toBeDefined();
    expect(usage.costCents).toBe(voiceCost);

    const newBalance = await UsageService.getBalance(workspaceId);
    expect(newBalance).toBe(initialBalance - voiceCost);
  });
});
