import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AgentService } from '@talkie/database';
import { authenticateRequest } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/api-response';

const createAgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required').max(100),
  description: z.string().max(500).optional(),
  voiceMode: z.enum(['hosted', 'webhook']).default('hosted'),
  webhookUrl: z.string().url('Invalid webhook URL').optional().or(z.literal('')),
  systemPrompt: z.string().min(1, 'System prompt cannot be empty').default('You are a helpful AI phone agent.'),
  beginMessage: z.string().max(500).optional(),
  voice: z.string().default('aura-asteria-en'),
  language: z.string().default('en-US'),
  voiceSpeed: z.number().min(0.5).max(2.0).default(1.0),
  interruptionSensitivity: z.number().min(0.0).max(1.0).default(0.5),
  enableBackchannel: z.boolean().default(true),
  denoisingMode: z.string().default('standard'),
  maxSilenceMs: z.number().min(500).max(10000).default(2000),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.isAuthenticated || !auth.workspaceId) {
      return errorResponse('Unauthorized access', 'UNAUTHORIZED', 401);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const agents = await AgentService.list(auth.workspaceId, { status, limit, offset });
    return successResponse(agents);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to list agents', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.isAuthenticated || !auth.workspaceId) {
      return errorResponse('Unauthorized access', 'UNAUTHORIZED', 401);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return errorResponse('Invalid JSON body', 'INVALID_BODY', 400);
    }

    const parsed = createAgentSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const agent = await AgentService.create(auth.workspaceId, parsed.data);
    return successResponse(agent, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to create agent', 'INTERNAL_SERVER_ERROR', 500);
  }
}
