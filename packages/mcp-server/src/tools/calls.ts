import { CallService, NumberService } from '@talkie/database';
import type { McpToolDefinition, McpToolCallResult } from '../types';

export const callToolDefinitions: McpToolDefinition[] = [
  {
    name: 'talkie_list_calls',
    description: 'List recent phone calls and their duration, status, and transcripts.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Limit number of calls' },
      },
    },
  },
  {
    name: 'talkie_make_call',
    description: 'Trigger an outbound AI voice call from a provisioned Talkie number to a customer.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: { type: 'string', description: 'The AI agent responsible for conversation' },
        fromNumber: { type: 'string', description: 'Provisioned phone number to call from' },
        toNumber: { type: 'string', description: 'Destination E.164 phone number' },
      },
      required: ['agentId', 'fromNumber', 'toNumber'],
    },
  },
  {
    name: 'talkie_get_call',
    description: 'Retrieve full details, audio recording, and full transcript turns of a call.',
    inputSchema: {
      type: 'object',
      properties: {
        callId: { type: 'string', description: 'The unique Call ID' },
      },
      required: ['callId'],
    },
  },
];

export async function handleCallTool(
  workspaceId: string,
  name: string,
  args: any = {}
): Promise<McpToolCallResult | null> {
  switch (name) {
    case 'talkie_list_calls': {
      const calls = await CallService.list(workspaceId, { limit: args.limit || 20 });
      return {
        content: [{ type: 'text', text: JSON.stringify(calls, null, 2) }],
      };
    }
    case 'talkie_make_call': {
      const number = await NumberService.getByPhoneNumber(args.fromNumber);
      if (!number) {
        return {
          content: [{ type: 'text', text: `From number ${args.fromNumber} is not provisioned in workspace.` }],
          isError: true,
        };
      }

      const call = await CallService.create(workspaceId, {
        agentId: args.agentId,
        phoneNumberId: number.id,
        direction: 'outbound',
        callerNumber: args.fromNumber,
        calleeNumber: args.toNumber,
        status: 'initiated',
      });

      return {
        content: [{ type: 'text', text: JSON.stringify(call, null, 2) }],
      };
    }
    case 'talkie_get_call': {
      const call = await CallService.getById(workspaceId, args.callId);
      if (!call) {
        return {
          content: [{ type: 'text', text: `Call with ID ${args.callId} not found.` }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(call, null, 2) }],
      };
    }
    default:
      return null;
  }
}
