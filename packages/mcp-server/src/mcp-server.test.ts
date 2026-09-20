import { describe, it, expect, beforeAll } from 'vitest';
import { TalkieMcpServer } from './index';
import { WorkspaceService } from '@talkie/database';

describe('@talkie/mcp-server (Model Context Protocol)', () => {
  let workspaceId: string;
  let server: TalkieMcpServer;

  beforeAll(async () => {
    const ws = await WorkspaceService.create({
      name: 'MCP Server Test Workspace',
      slug: `mcp-test-${Date.now()}`,
    });
    workspaceId = ws.id;
    server = new TalkieMcpServer({ workspaceId });
  });

  it('lists all registered MCP tools with JSON schemas', () => {
    const tools = server.listTools();
    expect(tools.length).toBeGreaterThanOrEqual(10);
    const names = tools.map((t) => t.name);
    expect(names).toContain('talkie_list_agents');
    expect(names).toContain('talkie_create_agent');
    expect(names).toContain('talkie_list_numbers');
    expect(names).toContain('talkie_provision_number');
    expect(names).toContain('talkie_make_call');
    expect(names).toContain('talkie_send_message');
    expect(names).toContain('talkie_create_contact');
  });

  it('executes talkie_create_agent and talkie_list_agents tools', async () => {
    const createResult = await server.callTool({
      name: 'talkie_create_agent',
      arguments: {
        name: 'MCP Concierge Agent',
        systemPrompt: 'You are an AI concierge assistant.',
        voiceProvider: 'elevenlabs',
      },
    });

    expect(createResult.isError).toBeFalsy();
    expect(createResult.content[0].text).toContain('MCP Concierge Agent');

    const listResult = await server.callTool({
      name: 'talkie_list_agents',
      arguments: {},
    });

    expect(listResult.isError).toBeFalsy();
    expect(listResult.content[0].text).toContain('MCP Concierge Agent');
  });

  it('handles JSON-RPC 2.0 handshake and tool dispatch', async () => {
    const initResponse = await server.handleJsonRpc({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {},
    });

    expect(initResponse.result.serverInfo.name).toBe('talkie-mcp-server');

    const listResponse = await server.handleJsonRpc({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {},
    });

    expect(listResponse.result.tools.length).toBeGreaterThan(0);
  });
});
