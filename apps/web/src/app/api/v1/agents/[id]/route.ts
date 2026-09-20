import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AgentService } from '@talkie/database';
import { authenticateRequest } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/api-response';

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  voiceMode: z.enum(['hosted', 'webhook']).optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')).nullable(),
  systemPrompt: z.string().min(1).optional(),
  beginMessage: z.string().max(500).optional().nullable(),
  voice: z.string().optional(),
  language: z.string().optional(),
  voiceSpeed: z.number().min(0.5).max(2.0).optional(),
  interruptionSensitivity: z.number().min(0.0).max(1.0).optional(),
  enableBackchannel: z.boolean().optional(),
  denoisingMode: z.string().optional(),
  maxSilenceMs: z.number().min(500).max(10000).optional(),
  status: z.enum(['active', 'paused', 'archived']).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.isAuthenticated || !auth.workspaceId) {
      return errorResponse('Unauthorized access', 'UNAUTHORIZED', 401);
    }

    const { id } = await params;
    const agent = await AgentService.getById(auth.workspaceId, id);
    if (!agent) {
      return errorResponse('Agent not found', 'NOT_FOUND', 404);
    }

    return successResponse(agent);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch agent', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.isAuthenticated || !auth.workspaceId) {
      return errorResponse('Unauthorized access', 'UNAUTHORIZED', 401);
    }

    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) {
      return errorResponse('Invalid JSON body', 'INVALID_BODY', 400);
    }

    const parsed = updateAgentSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const updated = await AgentService.update(auth.workspaceId, id, parsed.data as any);
    return successResponse(updated);
  } catch (err: any) {
    if (err.message?.includes('not found')) {
      return errorResponse('Agent not found', 'NOT_FOUND', 404);
    }
    return errorResponse(err.message || 'Failed to update agent', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.isAuthenticated || !auth.workspaceId) {
      return errorResponse('Unauthorized access', 'UNAUTHORIZED', 401);
    }

    const { id } = await params;
    await AgentService.delete(auth.workspaceId, id);
    return successResponse({ deleted: true, id });
  } catch (err: any) {
    if (err.message?.includes('not found')) {
      return errorResponse('Agent not found', 'NOT_FOUND', 404);
    }
    return errorResponse(err.message || 'Failed to delete agent', 'INTERNAL_SERVER_ERROR', 500);
  }
}
