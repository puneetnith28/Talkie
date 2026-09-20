import { ContactService } from '@talkie/database';
import type { McpToolDefinition, McpToolCallResult } from '../types';

export const contactToolDefinitions: McpToolDefinition[] = [
  {
    name: 'talkie_list_contacts',
    description: 'List CRM customer contacts.',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term for name or phone number' },
      },
    },
  },
  {
    name: 'talkie_create_contact',
    description: 'Create a new CRM contact record with name, phone number, and custom metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string', description: 'Contact phone number' },
        name: { type: 'string', description: 'Contact name' },
        email: { type: 'string', description: 'Contact email' },
      },
      required: ['phoneNumber'],
    },
  },
];

export async function handleContactTool(
  workspaceId: string,
  name: string,
  args: any = {}
): Promise<McpToolCallResult | null> {
  switch (name) {
    case 'talkie_list_contacts': {
      const contacts = await ContactService.list(workspaceId, { query: args.search });
      return {
        content: [{ type: 'text', text: JSON.stringify(contacts, null, 2) }],
      };
    }
    case 'talkie_create_contact': {
      const contact = await ContactService.create(workspaceId, {
        phoneNumber: args.phoneNumber,
        name: args.name,
        email: args.email,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(contact, null, 2) }],
      };
    }
    default:
      return null;
  }
}
