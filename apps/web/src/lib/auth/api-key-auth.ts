import { NextRequest } from 'next/server';
import { prisma } from '@talkie/database';
import { verifyApiKey } from '@talkie/auth';

export interface AuthenticatedContext {
  workspaceId: string;
  apiKeyId?: string;
  keyHint?: string;
}

export async function authenticateApiKey(req: NextRequest): Promise<AuthenticatedContext | null> {
  const authHeader = req.headers.get('authorization');
  const customHeader = req.headers.get('x-api-key');

  let rawKey: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    rawKey = authHeader.substring(7).trim();
  } else if (customHeader) {
    rawKey = customHeader.trim();
  }

  // If no API key provided, check session/header fallback in dev/dashboard
  if (!rawKey) {
    const devWorkspaceId = req.headers.get('x-workspace-id');
    if (devWorkspaceId) {
      return { workspaceId: devWorkspaceId };
    }
    return null;
  }

  // Look up API keys and verify hash
  const keys = await prisma.apiKey.findMany({
    where: { revokedAt: null },
  });

  for (const k of keys) {
    if (verifyApiKey(rawKey, k.keyHash)) {
      // Update lastUsedAt asynchronously
      prisma.apiKey.update({
        where: { id: k.id },
        data: { lastUsedAt: new Date() },
      }).catch(() => {});

      return {
        workspaceId: k.workspaceId,
        apiKeyId: k.id,
        keyHint: k.keyHint,
      };
    }
  }

  return null;
}
