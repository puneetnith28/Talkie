import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@talkie/database';
import { hashApiKey, validateSessionToken, AUTH_COOKIE_NAME } from '@talkie/auth';
import type { AuthContext, WorkspaceRole } from '@talkie/types';
import { syncClerkUser } from './clerk-sync';

const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'talkie_development_auth_secret_32chars_long';

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_clerk') &&
  process.env.CLERK_SECRET_KEY &&
  !process.env.CLERK_SECRET_KEY.includes('your_clerk')
);

export async function getAuthenticatedSession(req: NextRequest): Promise<AuthContext> {
  // 1. Clerk Authenticated User Token / Session
  if (hasClerkKeys) {
    try {
      const { userId } = getAuth(req);
      if (userId) {
        // Query user in Prisma
        const user = await prisma.user.findUnique({
          where: { clerkUserId: userId },
          include: {
            memberships: {
              include: { workspace: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        });

        if (user && user.memberships.length > 0) {
          const membership = user.memberships[0];
          return {
            user: {
              userId: user.id,
              email: user.email,
              workspaceId: membership.workspaceId,
              workspaceSlug: membership.workspace.slug,
              role: (membership.role as WorkspaceRole) || 'owner',
              isDemoMode: false,
            },
            workspaceId: membership.workspaceId,
            isAuthenticated: true,
            isDemoMode: false,
          };
        } else if (user) {
          // Provision workspace for existing user
          const synced = await syncClerkUser({
            clerkUserId: userId,
            email: user.email,
            name: user.name,
          });
          return {
            user: {
              userId: synced.user.id,
              email: synced.user.email,
              workspaceId: synced.workspace.id,
              workspaceSlug: synced.workspace.slug,
              role: (synced.workspace.role as WorkspaceRole) || 'owner',
              isDemoMode: false,
            },
            workspaceId: synced.workspace.id,
            isAuthenticated: true,
            isDemoMode: false,
          };
        } else if (userId) {
          // Just-in-time user creation if webhook has not yet processed
          try {
            const { createClerkClient } = await import('@clerk/nextjs/server');
            const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
            const clerkUser = await clerk.users.getUser(userId);
            const primaryEmail =
              clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
              clerkUser.emailAddresses?.[0]?.emailAddress ||
              `${userId}@user.clerk.dev`;
            const fullName =
              [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
              clerkUser.username ||
              'Talkie User';

            const synced = await syncClerkUser({
              clerkUserId: userId,
              email: primaryEmail,
              name: fullName,
              imageUrl: clerkUser.imageUrl,
            });

            return {
              user: {
                userId: synced.user.id,
                email: synced.user.email,
                workspaceId: synced.workspace.id,
                workspaceSlug: synced.workspace.slug,
                role: (synced.workspace.role as WorkspaceRole) || 'owner',
                isDemoMode: false,
              },
              workspaceId: synced.workspace.id,
              isAuthenticated: true,
              isDemoMode: false,
            };
          } catch (clerkErr) {
            // Fallback lightweight sync
            const fallbackEmail = `${userId}@user.clerk.dev`;
            const synced = await syncClerkUser({
              clerkUserId: userId,
              email: fallbackEmail,
              name: 'Talkie User',
            });

            return {
              user: {
                userId: synced.user.id,
                email: synced.user.email,
                workspaceId: synced.workspace.id,
                workspaceSlug: synced.workspace.slug,
                role: (synced.workspace.role as WorkspaceRole) || 'owner',
                isDemoMode: false,
              },
              workspaceId: synced.workspace.id,
              isAuthenticated: true,
              isDemoMode: false,
            };
          }
        }
      }
    } catch (err) {
      // Non-Clerk request or token resolution error
    }
  }

  // 2. Check API Key Header (Bearer tk_live_...)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const rawKey = authHeader.replace('Bearer ', '').trim();
    if (rawKey.startsWith('tk_live_')) {
      const keyHash = hashApiKey(rawKey);
      const apiKeyRecord = await prisma.apiKey.findUnique({
        where: { keyHash },
        include: { workspace: true },
      });

      if (apiKeyRecord && !apiKeyRecord.revokedAt) {
        prisma.apiKey
          .update({
            where: { id: apiKeyRecord.id },
            data: { lastUsedAt: new Date() },
          })
          .catch(() => {});

        return {
          apiKey: {
            keyId: apiKeyRecord.id,
            workspaceId: apiKeyRecord.workspaceId,
            name: apiKeyRecord.name,
            role: 'developer',
          },
          workspaceId: apiKeyRecord.workspaceId,
          isAuthenticated: true,
          isDemoMode: false,
        };
      }
    }
  }

  // 3. Check Session Cookie
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
          role: (payload.role as WorkspaceRole) || 'member',
          isDemoMode: false,
        },
        workspaceId: payload.workspaceId,
        isAuthenticated: true,
        isDemoMode: false,
      };
    }
  }

  // 4. Custom header workspace targeting (for API testing / microservices)
  const headerWorkspaceId = req.headers.get('x-workspace-id');
  if (headerWorkspaceId) {
    const ws = await prisma.workspace.findUnique({
      where: { id: headerWorkspaceId },
    });
    if (ws) {
      return {
        user: {
          userId: 'header-user',
          email: 'service@talkie.ai',
          workspaceId: ws.id,
          workspaceSlug: ws.slug,
          role: 'owner',
          isDemoMode: false,
        },
        workspaceId: ws.id,
        isAuthenticated: true,
        isDemoMode: false,
      };
    }
  }

  // 5. Dev / Demo Fallback Workspace for Local Exploration & Automated Testing
  const fallbackWorkspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (fallbackWorkspace) {
    return {
      user: {
        userId: 'demo-user-id',
        email: 'alex@talkie.ai',
        workspaceId: fallbackWorkspace.id,
        workspaceSlug: fallbackWorkspace.slug,
        role: 'owner',
        isDemoMode: true,
      },
      workspaceId: fallbackWorkspace.id,
      isAuthenticated: true,
      isDemoMode: true,
    };
  }

  return {
    workspaceId: '',
    isAuthenticated: false,
    isDemoMode: false,
  };
}

export const authenticateRequest = getAuthenticatedSession;
