import React from 'react';
import { CallService } from '@talkie/database';
import { CallsTable } from '@/components/calls/calls-table';

export const dynamic = 'force-dynamic';

export default async function CallsPage() {
  const workspaceId = 'ws_default_talkie_01';

  let calls: any[] = [];
  try {
    calls = await CallService.list(workspaceId);
  } catch (err) {
    console.error('Failed to load calls:', err);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Calls & Transcripts</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Review real-time telephony logs, caller audio turns, and AI-generated post-call summaries.
        </p>
      </div>

      <CallsTable initialCalls={calls} />
    </div>
  );
}
