import { AgentService } from '@talkie/database';
import type { McpToolDefinition, McpToolCallResult } from '../types';

export const agentToolDefinitions: McpToolDefinition[] = [
  {
    name: 'talkie_list_agents',
    description: 'List all conversational AI voice agents configured in the current Talkie workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of agents to return' },
      },
    },
  },
  {
    name: 'talkie_create_agent',
    description: 'Create a new AI voice & telephony agent with a custom system prompt and voice model settings.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the agent' },
        systemPrompt: { type: 'string', description: 'Instructions and persona prompt for the agent' },
        voiceProvider: { type: 'string', description: 'Voice provider (e.g. elevenlabs, deepgram)' },
        voiceId: { type: 'string', description: 'Voice ID identifier' },
        firstSentence: { type: 'string', description: 'First greeting spoken by agent when call is answered' },
        temperature: { type: 'number', description: 'LLM sampling temperature (0.0 - 1.0)' },
      },
      required: ['name', 'systemPrompt'],
    },
  },
  {
    name: 'talkie_get_agent',
    description: 'Get details and attached phone numbers of a specific agent by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: { type: 'string', description: 'The unique ID of the agent' },
      },
      required: ['agentId'],
    },
  },
];

export async function handleAgentTool(
  workspaceId: string,
  name: string,
  args: any = {}
): Promise<McpToolCallResult | null> {
  switch (name) {
    case 'talkie_list_agents': {
      const agents = await AgentService.list(workspaceId);
      return {
        content: [{ type: 'text', text: JSON.stringify(agents, null, 2) }],
      };
    }
    case 'talkie_create_agent': {
      const agent = await AgentService.create(workspaceId, {
        name: args.name,
        systemPrompt: args.systemPrompt,
        voice: args.voice || args.voiceId,
        beginMessage: args.firstSentence || args.beginMessage,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(agent, null, 2) }],
      };
    }
    case 'talkie_get_agent': {
      const agent = await AgentService.getById(workspaceId, args.agentId);
      if (!agent) {
        return {
          content: [{ type: 'text', text: `Agent with ID ${args.agentId} not found.` }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(agent, null, 2) }],
      };
    }
    default:
      return null;
  }
}
