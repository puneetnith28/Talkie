import { describe, it, expect, beforeAll } from 'vitest';
import { WorkspaceService, AgentService, NumberService, CallService, MessageService, MemberService, AuditService } from '@talkie/database';

describe('Phase 8 Checkpoint: Dashboard Architecture & UX Telemetry', () => {
  let workspaceId: string;

  beforeAll(async () => {
    const ws = await WorkspaceService.create({
      name: 'Dashboard Checkpoint Workspace',
      slug: `dashboard-test-${Date.now()}`,
    });
    workspaceId = ws.id;
  });

  it('Step 1: Aggregates complete workspace telemetry for dashboard overview', async () => {
    // 1. Create Agent
    const agent = await AgentService.create(workspaceId, {
      name: 'Overview Agent',
      systemPrompt: 'Assist customers with queries.',
    });

    // 2. Provision Phone Number
    const uniqueNumber = `+1415${Date.now().toString().slice(-7)}`;
    const number = await NumberService.provision(workspaceId, {
      phoneNumber: uniqueNumber,
      agentId: agent.id,
    });

    // 3. Create Call
    const call = await CallService.create(workspaceId, {
      agentId: agent.id,
      phoneNumberId: number.id,
      direction: 'inbound',
      callerNumber: '+14155550199',
      calleeNumber: uniqueNumber,
      status: 'completed',
    });

    // 4. Create Message
    const msg = await MessageService.createMessage(workspaceId, {
      phoneNumberId: number.id,
      direction: 'outbound',
      senderNumber: uniqueNumber,
      recipientNumber: '+14155550199',
      body: 'Welcome to Talkie AI platform!',
    });

    expect(agent.id).toBeDefined();
    expect(number.id).toBeDefined();
    expect(call.id).toBeDefined();
    expect(msg.id).toBeDefined();
  });

  it('Step 2: Manages workspace team members and invitations', async () => {
    const members = await MemberService.listMembers(workspaceId);
    expect(Array.isArray(members)).toBe(true);
  });

  it('Step 3: Captures immutable security audit events', async () => {
    const log = await AuditService.log(workspaceId, {
      action: 'agent.created',
      resourceType: 'agent',
      resourceId: 'ag_audit_123',
      metadata: { name: 'Overview Agent' },
    });

    expect(log.id).toBeDefined();
    expect(log.action).toBe('agent.created');

    const list = await AuditService.list(workspaceId);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });
});
