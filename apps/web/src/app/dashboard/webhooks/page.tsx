import React from 'react';
import { WebhookService } from '@talkie/database';
import { WebhookList } from '@/components/webhooks/webhook-list';

export const dynamic = 'force-dynamic';

export default async function WebhooksPage() {
  const workspaceId = 'ws_default_talkie_01';

  let webhooks: any[] = [];
  try {
    webhooks = await WebhookService.listWebhooks(workspaceId);
  } catch (err) {
    console.error('Failed to load webhooks:', err);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Webhooks & Event Subscriptions</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Configure secure HTTP endpoints to receive real-time JSON event payloads signed with HMAC-SHA256.
        </p>
      </div>

      <WebhookList initialWebhooks={webhooks} />
    </div>
  );
}
