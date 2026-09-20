import { NextRequest } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth/session';
import { prisma } from '@talkie/database';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(req);

    if (!auth.isAuthenticated || !auth.workspaceId) {
      return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);
    }

    let workspace: any = null;
    try {
      workspace = await prisma.workspace.findUnique({
        where: { id: auth.workspaceId },
        include: {
          _count: {
            select: {
              agents: true,
              phoneNumbers: true,
              calls: true,
              conversations: true,
              webhooks: true,
            },
          },
        },
      });
    } catch (_dbErr) {
      // Database is initializing
    }

    return successResponse({
      user: auth.user,
      workspace: {
        id: workspace?.id || auth.workspaceId || 'ws_default',
        name: workspace?.name || 'Talkie AI Labs',
        slug: workspace?.slug || 'talkie-ai-labs',
        balanceCents: workspace?.balanceCents ?? 5000,
        balanceDollars: ((workspace?.balanceCents ?? 5000) / 100).toFixed(2),
        counts: workspace?._count || {
          agents: 0,
          phoneNumbers: 0,
          calls: 0,
          conversations: 0,
          webhooks: 0,
        },
      },
      isDemoMode: !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_clerk'),
    });
  } catch (err: any) {
    console.error('Error fetching auth session:', err);
    return errorResponse(err.message || 'Failed to fetch session', 'INTERNAL_ERROR', 500);
  }
}
