import React from 'react';
import { MessageService, NumberService } from '@talkie/database';
import { MessagesContainer } from '@/components/messages/messages-container';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const workspaceId = 'ws_default_talkie_01';

  let conversations: any[] = [];
  let numbers: any[] = [];

  try {
    const [fetchedConversations, fetchedNumbers] = await Promise.all([
      MessageService.listConversations(workspaceId),
      NumberService.list(workspaceId, { status: 'active' }),
    ]);
    conversations = fetchedConversations;
    numbers = fetchedNumbers;
  } catch (err) {
    console.error('Failed to load conversations:', err);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Conversations & Messages</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time SMS and omnichannel messaging threads across your assigned agents and contacts.
          </p>
        </div>
      </div>

      <MessagesContainer initialConversations={conversations} phoneNumbers={numbers} />
    </div>
  );
}
