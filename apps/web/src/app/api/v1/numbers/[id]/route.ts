import { NextRequest } from 'next/server';
import { z } from 'zod';
import { NumberService } from '@talkie/database';
import { authenticateRequest } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/api-response';

const updateNumberSchema = z.object({
  agentId: z.string().nullable().optional(),
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
    const number = await NumberService.getById(auth.workspaceId, id);
    if (!number) {
      return errorResponse('Phone number not found', 'NOT_FOUND', 404);
    }

    return successResponse(number);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to fetch phone number', 'INTERNAL_SERVER_ERROR', 500);
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

    const parsed = updateNumberSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const updated = await NumberService.attachToAgent(auth.workspaceId, id, parsed.data.agentId ?? null);
    return successResponse(updated);
  } catch (err: any) {
    if (err.message?.includes('not found')) {
      return errorResponse('Phone number not found', 'NOT_FOUND', 404);
    }
    return errorResponse(err.message || 'Failed to update phone number', 'INTERNAL_SERVER_ERROR', 500);
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
    await NumberService.release(auth.workspaceId, id);
    return successResponse({ released: true, id });
  } catch (err: any) {
    if (err.message?.includes('not found')) {
      return errorResponse('Phone number not found', 'NOT_FOUND', 404);
    }
    return errorResponse(err.message || 'Failed to release phone number', 'INTERNAL_SERVER_ERROR', 500);
  }
}
