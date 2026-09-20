import { NextRequest } from 'next/server';
import { prisma } from '@talkie/database';
import { hashApiKey, validateSessionToken, AUTH_COOKIE_NAME } from '@talkie/auth';
import type { AuthContext, WorkspaceRole } from '@talkie/types';

const JWT_SECRET = process.env.JWT_SECRET || 'talkie-default-dev-jwt-secret-key-32chars!';

export async function authenticateRequest(req: NextRequest): Promise<AuthContext> {
  const authHeader = req.headers.get('authorization');

  // 1. Check API Key Header (Bearer tk_live_...)
  if (authHeader?.startsWith('Bearer ')) {
    const rawKey = authHeader.replace('Bearer ', '').trim();
    if (rawKey.startsWith('tk_live_')) {
      const keyHash = hashApiKey(rawKey);
      const apiKeyRecord = await prisma.apiKey.findUnique({
        where: { keyHash },
        include: { workspace: true },
      });

      if (apiKeyRecord && !apiKeyRecord.revokedAt) {
        // Asynchronously update lastUsedAt
        prisma.apiKey.update({
          where: { id: apiKeyRecord.id },
          data: { lastUsedAt: new Date() },
        }).catch(() => {});

        return {
          apiKey: {
            keyId: apiKeyRecord.id,
            workspaceId: apiKeyRecord.workspaceId,
            name: apiKeyRecord.name,
            role: 'developer',
          },
          workspaceId: apiKeyRecord.workspaceId,
          isAuthenticated: true,
        };
      }
    }
  }

  // 2. Check Session Cookie
  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (sessionCookie) {
    const payload = validateSessionToken(sessionCookie, JWT_SECRET);
    if (payload) {
      return {
        user: {
          userId: payload.sub,
          email: payload.email,
          workspaceId: payload.workspaceId,
          workspaceSlug: 'default',
          role: payload.role as WorkspaceRole,
        },
        workspaceId: payload.workspaceId,
        isAuthenticated: true,
      };
    }
  }

  // 3. Dev / Fallback Workspace for Local Exploration
  const fallbackWorkspace = await prisma.workspace.findFirst({
    where: { slug: 'talkie-demo' },
  });

  if (fallbackWorkspace) {
    return {
      user: {
        userId: 'demo-user-id',
        email: 'alex@talkie.ai',
        workspaceId: fallbackWorkspace.id,
        workspaceSlug: fallbackWorkspace.slug,
        role: 'owner',
      },
      workspaceId: fallbackWorkspace.id,
      isAuthenticated: true,
    };
  }

  return {
    workspaceId: '',
    isAuthenticated: false,
  };
}
