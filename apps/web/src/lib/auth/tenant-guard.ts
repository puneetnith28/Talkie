import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@talkie/database';
import { verifyApiKey } from '@talkie/auth';

export interface TenantContext {
  workspaceId: string;
  authType: 'api_key' | 'session' | 'internal';
}

export class TenantGuard {
  /**
   * Enforce tenant context from request headers, API Key bearer token, or cookie session
   */
  static async resolveTenant(req: NextRequest): Promise<TenantContext | null> {
    const authHeader = req.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const rawToken = authHeader.replace(/^Bearer\s+/, '').trim();

      // Look up non-revoked API keys matching hash
      const apiKeys = await prisma.apiKey.findMany({
        where: { revokedAt: null },
      });

      for (const keyRecord of apiKeys) {
        if (verifyApiKey(rawToken, keyRecord.keyHash)) {
          return {
            workspaceId: keyRecord.workspaceId,
            authType: 'api_key',
          };
        }
      }
    }

    const explicitWorkspace = req.headers.get('x-workspace-id');
    if (explicitWorkspace) {
      return {
        workspaceId: explicitWorkspace,
        authType: 'session',
      };
    }

    return null;
  }

  /**
   * Guard helper returning 401 response if tenant cannot be resolved
   */
  static unauthorizedResponse(message: string = 'Unauthorized: Valid API Key or Workspace session required') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message,
        },
      },
      { status: 401 }
    );
  }
}
