import React from 'react';
import { prisma } from '@talkie/database';
import { ApiKeysManager } from '@/components/settings/api-keys-manager';

export const dynamic = 'force-dynamic';

export default async function ApiKeysPage() {
  const workspaceId = 'ws_default_talkie_01';

  let keys: any[] = [];
  try {
    keys = await prisma.apiKey.findMany({
      where: { workspaceId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        keyHint: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  } catch (err) {
    console.error('Failed to load API keys:', err);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">API Keys & Tokens</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Manage API keys used for authenticating Talkie REST APIs, MCP server integrations, and SDKs.
        </p>
      </div>

      <ApiKeysManager initialKeys={keys} />
    </div>
  );
}
