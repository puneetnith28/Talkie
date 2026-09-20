import { NextRequest } from 'next/server';
import { z } from 'zod';
import { NumberService } from '@talkie/database';
import { MockTelephonyProvider } from '@talkie/telephony';
import { authenticateRequest } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/api-response';

const telephony = new MockTelephonyProvider();

const provisionNumberSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Must be valid E.164 phone number'),
  country: z.string().default('US'),
  areaCode: z.string().default('415'),
  agentId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.isAuthenticated || !auth.workspaceId) {
      return errorResponse('Unauthorized access', 'UNAUTHORIZED', 401);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const agentId = searchParams.get('agentId') || undefined;

    const numbers = await NumberService.list(auth.workspaceId, { status, agentId });
    return successResponse(numbers);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to list phone numbers', 'INTERNAL_SERVER_ERROR', 500);
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

    const parsed = provisionNumberSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    // 1. Provision from provider
    const provResult = await telephony.provisionNumber(parsed.data.phoneNumber);

    // 2. Persist in database
    const record = await NumberService.provision(auth.workspaceId, {
      phoneNumber: provResult.phoneNumber,
      provider: 'mock',
      providerNumberId: provResult.providerNumberId,
      country: parsed.data.country,
      areaCode: parsed.data.areaCode,
      capabilities: provResult.capabilities,
      agentId: parsed.data.agentId ?? undefined,
    });

    return successResponse(record, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to provision number', 'INTERNAL_SERVER_ERROR', 500);
  }
}
