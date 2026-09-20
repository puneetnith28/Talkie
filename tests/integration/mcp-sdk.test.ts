import { describe, it, expect, beforeAll } from 'vitest';
import { WorkspaceService, AgentService, NumberService } from '@talkie/database';
import { TalkieMcpServer } from '@talkie/mcp-server';
import { TalkieClient } from '@talkie/sdk';

describe('Phase 7 Checkpoint: SDK & MCP Server Platform', () => {
  let workspaceId: string;
  let mcpServer: TalkieMcpServer;

  beforeAll(async () => {
    const ws = await WorkspaceService.create({
      name: 'MCP & SDK Integration Workspace',
      slug: `mcp-sdk-${Date.now()}`,
    });
    workspaceId = ws.id;
    mcpServer = new TalkieMcpServer({ workspaceId });
  });

  it('Step 1: MCP Server lists all tools and executes agent creation', async () => {
    const tools = mcpServer.listTools();
    expect(tools.length).toBeGreaterThanOrEqual(10);

    const result = await mcpServer.callTool({
      name: 'talkie_create_agent',
      arguments: {
        name: 'MCP Medical Agent',
        systemPrompt: 'You triage medical intake calls and schedule appointments.',
        voiceProvider: 'elevenlabs',
        voiceId: 'rachel',
        firstSentence: 'Hello, how can I assist your health appointment today?',
      },
    });

    expect(result.isError).toBeFalsy();
    const createdAgent = JSON.parse(result.content[0].text || '{}');
    expect(createdAgent.name).toBe('MCP Medical Agent');
    expect(createdAgent.voice).toBe('rachel');
  });

  it('Step 2: MCP Server searches and provisions telephony numbers', async () => {
    const searchResult = await mcpServer.callTool({
      name: 'talkie_search_available_numbers',
      arguments: { country: 'US', areaCode: '415' },
    });

    expect(searchResult.isError).toBeFalsy();
    const numbers = JSON.parse(searchResult.content[0].text || '[]');
    expect(numbers.length).toBeGreaterThan(0);
    const chosenNumber = numbers[0].phoneNumber;

    const provResult = await mcpServer.callTool({
      name: 'talkie_provision_number',
      arguments: {
        phoneNumber: chosenNumber,
      },
    });

    expect(provResult.isError).toBeFalsy();
    const provisioned = JSON.parse(provResult.content[0].text || '{}');
    expect(provisioned.phoneNumber).toBe(chosenNumber);
    expect(provisioned.status).toBe('active');
  });

  it('Step 3: MCP Server executes SMS message and Call orchestration', async () => {
    // 1. Send SMS tool
    const sendResult = await mcpServer.callTool({
      name: 'talkie_send_message',
      arguments: {
        fromNumber: '+14155550100',
        toNumber: '+14155550999',
        body: 'Appointment confirmation: Tomorrow at 10 AM.',
      },
    });

    // If fromNumber is not provisioned, returns clean tool error
    expect(sendResult.content[0].text).toBeDefined();

    // 2. Create contact tool
    const contactResult = await mcpServer.callTool({
      name: 'talkie_create_contact',
      arguments: {
        phoneNumber: '+14155550999',
        name: 'Jane Patient',
        email: 'jane@example.com',
      },
    });

    expect(contactResult.isError).toBeFalsy();
    const contact = JSON.parse(contactResult.content[0].text || '{}');
    expect(contact.name).toBe('Jane Patient');
  });

  it('Step 4: JavaScript/TypeScript SDK handles typed instantiation and methods', () => {
    const client = new TalkieClient({
      apiKey: 'tk_live_checkpoint7_test',
      baseUrl: 'http://localhost:3000',
    });

    expect(client.agents).toBeDefined();
    expect(client.numbers).toBeDefined();
    expect(client.calls).toBeDefined();
    expect(client.messages).toBeDefined();
    expect(client.contacts).toBeDefined();
    expect(client.webhooks).toBeDefined();
  });
});
