import type { McpToolDefinition, McpToolCallRequest, McpToolCallResult, McpServerConfig } from './types';
import { agentToolDefinitions, handleAgentTool } from './tools/agents';
import { numberToolDefinitions, handleNumberTool } from './tools/numbers';
import { callToolDefinitions, handleCallTool } from './tools/calls';
import { messageToolDefinitions, handleMessageTool } from './tools/messages';
import { contactToolDefinitions, handleContactTool } from './tools/contacts';

export class TalkieMcpServer {
  private config: McpServerConfig;
  private tools: McpToolDefinition[] = [];

  constructor(config: McpServerConfig) {
    this.config = config;
    this.tools = [
      ...agentToolDefinitions,
      ...numberToolDefinitions,
      ...callToolDefinitions,
      ...messageToolDefinitions,
      ...contactToolDefinitions,
    ];
  }

  /**
   * List all available tools exposed by the Talkie MCP Server
   */
  public listTools(): McpToolDefinition[] {
    return this.tools;
  }

  /**
   * Execute an MCP tool call request
   */
  public async callTool(request: McpToolCallRequest): Promise<McpToolCallResult> {
    const { name, arguments: args = {} } = request;
    const workspaceId = this.config.workspaceId;

    try {
      // 1. Agent tools
      let result = await handleAgentTool(workspaceId, name, args);
      if (result) return result;

      // 2. Number tools
      result = await handleNumberTool(workspaceId, name, args);
      if (result) return result;

      // 3. Call tools
      result = await handleCallTool(workspaceId, name, args);
      if (result) return result;

      // 4. Message tools
      result = await handleMessageTool(workspaceId, name, args);
      if (result) return result;

      // 5. Contact tools
      result = await handleContactTool(workspaceId, name, args);
      if (result) return result;

      return {
        content: [{ type: 'text', text: `Unknown MCP tool: ${name}` }],
        isError: true,
      };
    } catch (err: any) {
      return {
        content: [{ type: 'text', text: `Error executing tool ${name}: ${err.message}` }],
        isError: true,
      };
    }
  }

  /**
   * JSON-RPC 2.0 message handler for standard MCP stdio / SSE clients
   */
  public async handleJsonRpc(message: any): Promise<any> {
    const { id, method, params } = message;

    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: this.listTools(),
        },
      };
    }

    if (method === 'tools/call') {
      const toolResult = await this.callTool({
        name: params.name,
        arguments: params.arguments,
      });

      return {
        jsonrpc: '2.0',
        id,
        result: toolResult,
      };
    }

    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'talkie-mcp-server',
            version: '1.0.0',
          },
        },
      };
    }

    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method '${method}' not found`,
      },
    };
  }
}
