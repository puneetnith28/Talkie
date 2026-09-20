import { NumberService } from '@talkie/database';
import { MockTelephonyProvider } from '@talkie/telephony';
import type { McpToolDefinition, McpToolCallResult } from '../types';

const telephonyProvider = new MockTelephonyProvider();

export const numberToolDefinitions: McpToolDefinition[] = [
  {
    name: 'talkie_list_numbers',
    description: 'List all phone numbers currently provisioned in the workspace.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'talkie_search_available_numbers',
    description: 'Search available carrier phone numbers to provision by country code and area code.',
    inputSchema: {
      type: 'object',
      properties: {
        country: { type: 'string', description: 'ISO country code (default US)' },
        areaCode: { type: 'string', description: '3-digit area code (e.g. 415, 212)' },
        limit: { type: 'number', description: 'Number of results to return' },
      },
    },
  },
  {
    name: 'talkie_provision_number',
    description: 'Provision a new phone number and optionally assign it to an AI voice agent.',
    inputSchema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string', description: 'E.164 phone number to provision (e.g. +14155550199)' },
        agentId: { type: 'string', description: 'Optional agent ID to assign immediately' },
        friendlyName: { type: 'string', description: 'Friendly label for the number' },
      },
      required: ['phoneNumber'],
    },
  },
];

export async function handleNumberTool(
  workspaceId: string,
  name: string,
  args: any = {}
): Promise<McpToolCallResult | null> {
  switch (name) {
    case 'talkie_list_numbers': {
      const numbers = await NumberService.list(workspaceId);
      return {
        content: [{ type: 'text', text: JSON.stringify(numbers, null, 2) }],
      };
    }
    case 'talkie_search_available_numbers': {
      const available = await telephonyProvider.searchNumbers({
        country: args.country || 'US',
        areaCode: args.areaCode,
        limit: args.limit || 5,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(available, null, 2) }],
      };
    }
    case 'talkie_provision_number': {
      const number = await NumberService.provision(workspaceId, {
        phoneNumber: args.phoneNumber,
        agentId: args.agentId,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(number, null, 2) }],
      };
    }
    default:
      return null;
  }
}
