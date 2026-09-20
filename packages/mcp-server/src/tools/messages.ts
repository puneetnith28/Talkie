import { MessageService, NumberService } from '@talkie/database';
import type { McpToolDefinition, McpToolCallResult } from '../types';

export const messageToolDefinitions: McpToolDefinition[] = [
  {
    name: 'talkie_send_message',
    description: 'Send an outbound SMS message from a provisioned Talkie number.',
    inputSchema: {
      type: 'object',
      properties: {
        fromNumber: { type: 'string', description: 'Sender provisioned phone number' },
        toNumber: { type: 'string', description: 'Recipient phone number' },
        body: { type: 'string', description: 'SMS message text content' },
      },
      required: ['fromNumber', 'toNumber', 'body'],
    },
  },
  {
    name: 'talkie_list_messages',
    description: 'List SMS messages for a given phone number or conversation.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Limit number of messages' },
      },
    },
  },
];

export async function handleMessageTool(
  workspaceId: string,
  name: string,
  args: any = {}
): Promise<McpToolCallResult | null> {
  switch (name) {
    case 'talkie_send_message': {
      const number = await NumberService.getByPhoneNumber(args.fromNumber);
      if (!number) {
        return {
          content: [{ type: 'text', text: `Phone number ${args.fromNumber} not found in workspace.` }],
          isError: true,
        };
      }

      const msg = await MessageService.createMessage(workspaceId, {
        phoneNumberId: number.id,
        direction: 'outbound',
        senderNumber: args.fromNumber,
        recipientNumber: args.toNumber,
        body: args.body,
        status: 'delivered',
      });

      return {
        content: [{ type: 'text', text: JSON.stringify(msg, null, 2) }],
      };
    }
    case 'talkie_list_messages': {
      const messages = await MessageService.listConversations(workspaceId, { limit: args.limit || 20 });
      return {
        content: [{ type: 'text', text: JSON.stringify(messages, null, 2) }],
      };
    }
    default:
      return null;
  }
}
