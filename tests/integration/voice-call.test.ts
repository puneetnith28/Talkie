import { describe, it, expect, beforeAll } from 'vitest';
import {
  WorkspaceService,
  AgentService,
  NumberService,
  ContactService,
  CallService,
  UsageService,
} from '@talkie/database';
import {
  VoiceStateMachine,
  SessionCoordinator,
  MockCallProvider,
  LLMConversationEngine,
  TTSService,
  STTService,
} from '@talkie/voice';

describe('Phase 5 Checkpoint: Voice Calling & AI Engine Integration', () => {
  let workspaceId: string;
  let agent: any;
  let phoneNumber: any;
  let contact: any;

  beforeAll(async () => {
    // 1. Setup workspace
    const ws = await WorkspaceService.create({
      name: 'Voice AI Integration Test Workspace',
      slug: `voice-test-${Date.now()}`,
    });
    workspaceId = ws.id;

    // 2. Create voice agent
    agent = await AgentService.create(workspaceId, {
      name: 'Elena - Receptionist AI',
      description: 'Front desk AI voice receptionist',
      systemPrompt: 'You are Elena, a professional and welcoming dental clinic receptionist.',
      beginMessage: 'Thank you for calling Dental Care. This is Elena. How may I help you today?',
      voice: 'aura-asteria-en',
      voiceSpeed: 1.0,
      interruptionSensitivity: 0.7,
    });

    // 3. Provision number
    const uniqueNumber = `+1917${Date.now().toString().slice(-7)}`;
    phoneNumber = await NumberService.provision(workspaceId, {
      phoneNumber: uniqueNumber,
      agentId: agent.id,
      capabilities: { voice: true, sms: true, mms: false },
    });

    // 4. Create contact
    contact = await ContactService.create(workspaceId, {
      name: 'Mark Johnson',
      phoneNumber: '+14155551234',
      company: 'Acme',
    });
  });

  it('Step 1: Tests finite state machine transitions and invalid transition rejections', () => {
    const sm = new VoiceStateMachine('idle');
    expect(sm.state).toBe('idle');

    sm.transition('ringing');
    expect(sm.state).toBe('ringing');

    sm.transition('connected');
    expect(sm.state).toBe('connected');

    sm.transition('speaking');
    expect(sm.state).toBe('speaking');

    sm.transition('interrupted');
    expect(sm.state).toBe('interrupted');

    sm.transition('listening');
    expect(sm.state).toBe('listening');

    sm.transition('thinking');
    expect(sm.state).toBe('thinking');

    sm.transition('speaking');
    expect(sm.state).toBe('speaking');

    sm.transition('ending');
    expect(sm.state).toBe('ending');

    sm.transition('ended');
    expect(sm.state).toBe('ended');
    expect(sm.isTerminal()).toBe(true);

    // Invalid transition from terminal state
    expect(() => sm.transition('speaking')).toThrow(/Invalid state transition/);
  });

  it('Step 2: Simulates full voice call session with turns, interruption, and AI response', async () => {
    const callProvider = new MockCallProvider();
    const llm = new LLMConversationEngine();

    const coordinator = new SessionCoordinator(
      {
        callId: 'call_test_01',
        workspaceId,
        agentId: agent.id,
        agentName: agent.name,
        systemPrompt: agent.systemPrompt,
        beginMessage: agent.beginMessage,
        voice: agent.voice,
        language: agent.language,
        voiceSpeed: agent.voiceSpeed,
        interruptionSensitivity: agent.interruptionSensitivity,
        enableBackchannel: agent.enableBackchannel,
        maxSilenceMs: agent.maxSilenceMs,
        callerNumber: contact.phoneNumber,
        calleeNumber: phoneNumber.phoneNumber,
        direction: 'inbound',
      },
      { callProvider, llm }
    );

    // Start session -> answers and speaks greeting
    await coordinator.start();

    const initialTranscript = coordinator.getTranscript();
    expect(initialTranscript.length).toBe(1);
    expect(initialTranscript[0].speaker).toBe('agent');
    expect(initialTranscript[0].text).toContain('Thank you for calling Dental Care');

    // Caller speaks: "I would like to schedule an appointment"
    await coordinator.handleUserSpeech('I would like to schedule an appointment');

    const updatedTranscript = coordinator.getTranscript();
    expect(updatedTranscript.length).toBe(3); // [greeting, user_speech, agent_response]
    expect(updatedTranscript[1].speaker).toBe('user');
    expect(updatedTranscript[1].text).toBe('I would like to schedule an appointment');
    expect(updatedTranscript[2].speaker).toBe('agent');
    expect(updatedTranscript[2].text.toLowerCase()).toContain('appointment');

    // Caller interrupts with another speech turn
    await coordinator.handleUserSpeech('Actually what are your office hours?');

    const finalTranscript = coordinator.getTranscript();
    expect(finalTranscript.length).toBe(5); // [greeting, user, agent, user_hours, agent_hours]
    expect(finalTranscript[4].speaker).toBe('agent');
    expect(finalTranscript[4].text.toLowerCase()).toContain('monday');

    // End session and verify AI intelligence summary
    const endResult = await coordinator.end();
    expect(endResult.summary).toBeDefined();
    expect(endResult.summary.durationSeconds).toBeGreaterThan(0);
    expect(endResult.summary.keyPoints.length).toBeGreaterThan(0);
    expect(coordinator.getState()).toBe('ended');
  });

  it('Step 3: Persists call record, transcript turns, and billing usage to database', async () => {
    // 1. Create DB call
    const call = await CallService.create(workspaceId, {
      agentId: agent.id,
      phoneNumberId: phoneNumber.id,
      contactId: contact.id,
      direction: 'inbound',
      callerNumber: contact.phoneNumber,
      calleeNumber: phoneNumber.phoneNumber,
      status: 'in-progress',
    });

    expect(call).toBeDefined();
    expect(call.id).toBeDefined();

    // 2. Log turns
    await CallService.logTurn(call.id, {
      speaker: 'agent',
      text: 'Hello, how can I help you today?',
      startTimeOffsetMs: 0,
    });

    await CallService.logTurn(call.id, {
      speaker: 'user',
      text: 'Can I check my dental appointment time?',
      startTimeOffsetMs: 3200,
    });

    // 3. Finalize call
    const finalized = await CallService.finalizeCall(call.id, {
      durationSeconds: 45,
      summary: 'Caller inquired about appointment schedule.',
      sentiment: 'positive',
    });

    expect(finalized.status).toBe('completed');
    expect(finalized.durationSeconds).toBe(45);
    expect(finalized.summary).toContain('appointment');

    // 4. Verify call details & transcripts from DB
    const fetched = await CallService.getById(workspaceId, call.id);
    expect(fetched).toBeDefined();
    expect(fetched?.transcripts.length).toBe(2);

    // 5. Debit voice usage
    const usage = await UsageService.recordUsage(workspaceId, {
      type: 'voice_minutes',
      quantity: 1,
      costCents: 2,
      description: 'Inbound AI voice call (45s)',
    });

    expect(usage.costCents).toBe(2);
  });
});
