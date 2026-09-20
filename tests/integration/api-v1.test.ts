import { describe, it, expect, beforeAll } from 'vitest';
import { prisma, WorkspaceService, AgentService, NumberService, MessageService, CallService } from '@talkie/database';
import { generateApiKey, verifyApiKey } from '@talkie/auth';
import { realtimePubSub } from '../../apps/web/src/lib/realtime/pubsub';

describe('Phase 6 Checkpoint: Developer API v1, Auth & Real-Time Events', () => {
  let workspaceId: string;
  let rawApiKey: string;
  let apiKeyRecord: any;

  beforeAll(async () => {
    const ws = await WorkspaceService.create({
      name: 'API v1 Integration Test Workspace',
      slug: `api-test-${Date.now()}`,
    });
    workspaceId = ws.id;

    // Generate API Key
    const generated = generateApiKey();
    rawApiKey = generated.rawKey;

    apiKeyRecord = await prisma.apiKey.create({
      data: {
        workspaceId,
        name: 'Test Key',
        keyHash: generated.keyHash,
        keyHint: generated.keyHint,
      },
    });
  });

  it('Step 1: Authenticates API requests via Bearer API Key hash verification', async () => {
    expect(rawApiKey).toMatch(/^tk_live_[a-f0-9]{48}$/);
    expect(apiKeyRecord.keyHint).toMatch(/^tk_live_\.\.\.[a-f0-9]{4}$/);

    // Verify key hash matches
    const isValid = verifyApiKey(rawApiKey, apiKeyRecord.keyHash);
    expect(isValid).toBe(true);

    const isTampered = verifyApiKey(rawApiKey + 'invalid', apiKeyRecord.keyHash);
    expect(isTampered).toBe(false);
  });

  it('Step 2: Delivers real-time PubSub events across workspace subscribers', async () => {
    let receivedEvent: any = null;

    const unsubscribe = realtimePubSub.subscribe(workspaceId, (msg) => {
      receivedEvent = msg;
    });

    realtimePubSub.publish(workspaceId, 'call.started', {
      callId: 'call_pubsub_123',
      callerNumber: '+14155550100',
    });

    expect(receivedEvent).toBeDefined();
    expect(receivedEvent.eventName).toBe('call.started');
    expect(receivedEvent.data.callId).toBe('call_pubsub_123');

    unsubscribe();
  });

  it('Step 3: Streams live call transcript turns via dedicated call channel', async () => {
    let receivedTurn: any = null;
    const testCallId = 'call_stream_turn_777';

    const unsubscribe = realtimePubSub.subscribeCallTranscript(testCallId, (turn) => {
      receivedTurn = turn;
    });

    realtimePubSub.publishCallTranscript(testCallId, {
      speaker: 'agent',
      text: 'Good morning, thank you for calling Talkie.',
      timestamp: 1200,
    });

    expect(receivedTurn).toBeDefined();
    expect(receivedTurn.speaker).toBe('agent');
    expect(receivedTurn.text).toContain('Good morning');

    unsubscribe();
  });

  it('Step 4: Executes complete unified REST domain lifecycle', async () => {
    // 1. Agent
    const agent = await AgentService.create(workspaceId, {
      name: 'API Agent',
      systemPrompt: 'Assist customers via API',
    });
    expect(agent.id).toBeDefined();

    // 2. Number
    const uniqueNumber = `+1917${Date.now().toString().slice(-7)}`;
    const number = await NumberService.provision(workspaceId, {
      phoneNumber: uniqueNumber,
      agentId: agent.id,
    });
    expect(number.phoneNumber).toBe(uniqueNumber);

    // 3. Message
    const msg = await MessageService.createMessage(workspaceId, {
      phoneNumberId: number.id,
      direction: 'outbound',
      senderNumber: uniqueNumber,
      recipientNumber: '+14155550199',
      body: 'Automated test message from API',
    });
    expect(msg.id).toBeDefined();

    // 4. Call
    const call = await CallService.create(workspaceId, {
      agentId: agent.id,
      phoneNumberId: number.id,
      direction: 'outbound',
      callerNumber: uniqueNumber,
      calleeNumber: '+14155550199',
      status: 'in-progress',
    });
    expect(call.id).toBeDefined();
  });
});
