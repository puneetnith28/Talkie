import { describe, it, expect, beforeAll } from 'vitest';
import { prisma, WorkspaceService, AgentService, NumberService } from '@talkie/database';
import { MockTelephonyProvider } from '@talkie/telephony';

describe('Phase 3 Checkpoint: Agent & Phone Number Lifecycle Integration', () => {
  let workspaceId: string;
  let provider: MockTelephonyProvider;

  beforeAll(async () => {
    // Create test workspace
    const ws = await WorkspaceService.create({
      name: 'Agent-Number Integration Test Workspace',
      slug: `test-agent-num-${Date.now()}`,
    });
    workspaceId = ws.id;
    provider = new MockTelephonyProvider();
  });

  it('Step 1: Creates an AI voice agent with custom LLM and voice prompt settings', async () => {
    const agent = await AgentService.create(workspaceId, {
      name: 'Customer Support Lead',
      description: 'Handles Tier 1 incoming support calls and routing',
      systemPrompt: 'You are Talkie Support Lead. Always be courteous and efficient.',
      voice: 'aura-asteria-en',
      voiceSpeed: 1.05,
      interruptionSensitivity: 0.6,
    });

    expect(agent).toBeDefined();
    expect(agent.id).toBeDefined();
    expect(agent.workspaceId).toBe(workspaceId);
    expect(agent.name).toBe('Customer Support Lead');
    expect(agent.systemPrompt).toContain('Talkie Support Lead');
    expect(agent.voice).toBe('aura-asteria-en');
    expect(agent.voiceSpeed).toBe(1.05);
  });

  it('Step 2: Searches available E.164 phone numbers across Indian telecom circles', async () => {
    const resultsSTD = await provider.searchNumbers({
      country: 'IN',
      areaCode: '80',
      limit: 5,
    });

    expect(resultsSTD.length).toBeGreaterThan(0);
    expect(resultsSTD[0].phoneNumber).toMatch(/^\+9180\d{7,8}$/);
    expect(resultsSTD[0].country).toBe('IN');
    expect(resultsSTD[0].countryCode).toBe('+91');
    expect(resultsSTD[0].capabilities.voice).toBe(true);
    expect(resultsSTD[0].capabilities.sms).toBe(true);

    const resultsMobile = await provider.searchNumbers({
      country: 'IN',
      areaCode: '98',
      limit: 3,
    });

    expect(resultsMobile.length).toBeGreaterThan(0);
    expect(resultsMobile[0].phoneNumber).toMatch(/^\+9198\d{8}$/);
    expect(resultsMobile[0].country).toBe('IN');
  });

  it('Step 3: Provisions a number and attaches it directly to the agent', async () => {
    const agent = await AgentService.create(workspaceId, {
      name: 'Sales Rep AI',
      systemPrompt: 'Handle sales inquiries',
    });

    const searchResults = await provider.searchNumbers({ country: 'IN', areaCode: '80' });
    const targetNumber = searchResults[0];

    const provisionedFromProvider = await provider.provisionNumber(targetNumber.phoneNumber);
    expect(provisionedFromProvider.status).toBe('active');

    const dbNumber = await NumberService.provision(workspaceId, {
      phoneNumber: targetNumber.phoneNumber,
      provider: 'mock',
      providerNumberId: provisionedFromProvider.providerNumberId,
      country: 'IN',
      countryCode: '+91',
      areaCode: '80',
      capabilities: targetNumber.capabilities,
      agentId: agent.id,
    });

    expect(dbNumber).toBeDefined();
    expect(dbNumber.phoneNumber).toBe(targetNumber.phoneNumber);
    expect(dbNumber.agentId).toBe(agent.id);
    expect(dbNumber.agent?.name).toBe('Sales Rep AI');
  });

  it('Step 4: Reassigns and detaches phone number from agent seamlessly', async () => {
    const agent1 = await AgentService.create(workspaceId, { name: 'Agent 1' });
    const agent2 = await AgentService.create(workspaceId, { name: 'Agent 2' });

    const uniqueNumber = `+9198${Date.now().toString().slice(-8)}`;
    const num = await NumberService.provision(workspaceId, {
      phoneNumber: uniqueNumber,
      country: 'IN',
      countryCode: '+91',
      agentId: agent1.id,
    });

    expect(num.agentId).toBe(agent1.id);

    // Reassign to agent 2
    const reassigned = await NumberService.attachToAgent(workspaceId, num.id, agent2.id);
    expect(reassigned.agentId).toBe(agent2.id);
    expect(reassigned.agent?.name).toBe('Agent 2');

    // Detach completely
    const detached = await NumberService.attachToAgent(workspaceId, num.id, null);
    expect(detached.agentId).toBeNull();
    expect(detached.agent).toBeNull();
  });

  it('Step 5: Releases phone number and marks status as released', async () => {
    const uniqueNumber = `+9199${(Date.now() + 1).toString().slice(-8)}`;
    const num = await NumberService.provision(workspaceId, {
      phoneNumber: uniqueNumber,
      country: 'IN',
      countryCode: '+91',
    });

    const released = await NumberService.release(workspaceId, num.id);
    expect(released.status).toBe('released');
    expect(released.agentId).toBeNull();

    // Verify lookup ignores or handles released numbers
    const activeList = await NumberService.list(workspaceId, { status: 'active' });
    expect(activeList.some((n) => n.id === num.id)).toBe(false);
  });
});
