import { NextRequest } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth/session';
import { syncClerkUser } from '@/lib/auth/clerk-sync';
import { prisma, AgentService } from '@talkie/database';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(req);

    if (!auth.isAuthenticated) {
      return errorResponse('Unauthenticated', 'UNAUTHORIZED', 401);
    }

    const body = await req.json().catch(() => ({}));
    const workspaceName = body.workspaceName || (auth.user?.email ? `${auth.user.email.split('@')[0]}'s Workspace` : 'Talkie AI Labs');

    let workspace = await prisma.workspace.findUnique({
      where: { id: auth.workspaceId },
    });

    if (!workspace) {
      const slugSuffix = Math.random().toString(36).substring(2, 8);
      const slug = `${workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${slugSuffix}`;

      workspace = await prisma.workspace.create({
        data: {
          name: workspaceName,
          slug,
          balanceCents: 5000,
          members: {
            create: {
              userId: auth.user!.userId,
              role: 'owner',
            },
          },
        },
      });

      // Create default starter concierge agent
      await AgentService.create(workspace.id, {
        name: 'Starter Inbound Concierge',
        description: 'Auto-provisioned AI assistant for testing voice turns and message routing',
        voiceMode: 'hosted',
        systemPrompt: 'You are a friendly, helpful conversational AI assistant for Talkie. Greet the caller warmly and answer their questions.',
        beginMessage: 'Hello! Thank you for calling Talkie. How can I help you today?',
        voice: 'aura-asteria-en',
        language: 'en-US',
      });
    }

    return successResponse({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        balanceCents: workspace.balanceCents,
      },
      message: 'Workspace provisioned successfully',
    });
  } catch (err: any) {
    console.error('Error auto-provisioning workspace:', err);
    return errorResponse(err.message || 'Failed to provision workspace', 'INTERNAL_ERROR', 500);
  }
}
