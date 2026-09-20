import { NextRequest, NextResponse } from 'next/server';
import { IdempotencyService } from '@talkie/database';

export async function withIdempotency(
  req: NextRequest,
  workspaceId: string,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const key = req.headers.get('idempotency-key') || req.headers.get('x-idempotency-key');

  if (!key) {
    return handler();
  }

  // 1. Check existing cached response
  const existing = await IdempotencyService.check(workspaceId, key);
  if (existing) {
    return NextResponse.json(JSON.parse(existing.responseJson), {
      status: existing.statusCode,
      headers: { 'X-Cache-Lookup': 'HIT' },
    });
  }

  // 2. Execute handler
  const response = await handler();

  // 3. Cache response if successful (2xx or 4xx client validation)
  if (response.status >= 200 && response.status < 500) {
    try {
      const cloned = response.clone();
      const bodyJson = await cloned.json();
      await IdempotencyService.save(
        workspaceId,
        key,
        req.nextUrl.pathname,
        response.status,
        bodyJson
      );
    } catch {
      // Ignore if response body is not JSON
    }
  }

  return response;
}
