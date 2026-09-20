import { NextRequest } from 'next/server';
import { MockTelephonyProvider } from '@talkie/telephony';
import { authenticateRequest } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/api-response';

const telephony = new MockTelephonyProvider();

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.isAuthenticated || !auth.workspaceId) {
      return errorResponse('Unauthorized access', 'UNAUTHORIZED', 401);
    }

    const { searchParams } = new URL(req.url);
    const areaCode = searchParams.get('areaCode') || '415';
    const country = searchParams.get('country') || 'US';
    const contains = searchParams.get('contains') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;

    const numbers = await telephony.searchNumbers({
      areaCode,
      country,
      contains,
      limit,
    });

    return successResponse(numbers);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to search numbers', 'INTERNAL_SERVER_ERROR', 500);
  }
}
