import { describe, it, expect, beforeAll } from 'vitest';
import { WorkspaceService, AgentService, NumberService } from '@talkie/database';

describe('Security & Multi-Tenant Isolation Audit', () => {
  let workspaceA: string;
  let workspaceB: string;
  let agentAId: string;

  beforeAll(async () => {
    const wsA = await WorkspaceService.create({
      name: 'Tenant Alpha',
      slug: `tenant-a-${Date.now()}`,
    });
    workspaceA = wsA.id;

    const wsB = await WorkspaceService.create({
      name: 'Tenant Beta',
      slug: `tenant-b-${Date.now()}`,
    });
    workspaceB = wsB.id;

    const agentA = await AgentService.create(workspaceA, {
      name: 'Alpha Secret Agent',
      systemPrompt: 'Classified instructions for Tenant A only.',
    });
    agentAId = agentA.id;
  });

  it('prohibits cross-tenant retrieval of agents', async () => {
    // Workspace A can retrieve its own agent
    const agentA = await AgentService.getById(workspaceA, agentAId);
    expect(agentA).toBeDefined();
    expect(agentA?.name).toBe('Alpha Secret Agent');

    // Workspace B cannot retrieve Workspace A agent
    const crossTenantAgent = await AgentService.getById(workspaceB, agentAId);
    expect(crossTenantAgent).toBeNull();
  });

  it('prohibits cross-tenant deletion or modification of agents', async () => {
    // Attempting to update or delete agent from Workspace B must fail
    await expect(
      AgentService.update(workspaceB, agentAId, { name: 'Compromised Name' })
    ).rejects.toThrow();

    await expect(
      AgentService.delete(workspaceB, agentAId)
    ).rejects.toThrow();
  });

  it('strictly partitions phone numbers by tenant boundary', async () => {
    const uniqueNumber = `+1917${Date.now().toString().slice(-7)}`;
    const numA = await NumberService.provision(workspaceA, {
      phoneNumber: uniqueNumber,
    });

    // Number belongs to workspaceA
    const foundA = await NumberService.getById(workspaceA, numA.id);
    expect(foundA).toBeDefined();

    // Querying from workspaceB returns null
    const foundB = await NumberService.getById(workspaceB, numA.id);
    expect(foundB).toBeNull();
  });
});
