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

    const workspace = await prisma.workspace.findUnique({
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

    if (!workspace) {
      return errorResponse('Workspace not found', 'NOT_FOUND', 404);
    }

    return successResponse({
      user: auth.user,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        balanceCents: workspace.balanceCents,
        balanceDollars: (workspace.balanceCents / 100).toFixed(2),
        counts: workspace._count,
      },
      isDemoMode: !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_clerk'),
    });
  } catch (err: any) {
    console.error('Error fetching auth session:', err);
    return errorResponse(err.message || 'Failed to fetch session', 'INTERNAL_ERROR', 500);
  }
}
