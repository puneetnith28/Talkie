import React from 'react';
import { NumberService, AgentService } from '@talkie/database';
import { Button, Card, Badge } from '@talkie/ui';
import { Phone, Plus, Sparkles, ShieldCheck } from 'lucide-react';
import { NumbersTable } from '@/components/numbers/numbers-table';
import { NumbersClientWrapper } from '@/components/numbers/numbers-client-wrapper';

export const dynamic = 'force-dynamic';

export default async function NumbersPage() {
  const workspaceId = 'ws_default_talkie_01';

  let numbers: any[] = [];
  let agents: any[] = [];

  try {
    const [fetchedNumbers, fetchedAgents] = await Promise.all([
      NumberService.list(workspaceId, { status: 'active' }),
      AgentService.list(workspaceId),
    ]);
    numbers = fetchedNumbers;
    agents = fetchedAgents;
  } catch (err) {
    console.error('Failed to load numbers or agents:', err);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header with Client Wrapper */}
      <NumbersClientWrapper initialNumbers={numbers} agents={agents} />
    </div>
  );
}
