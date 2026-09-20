import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import type { ApiResponse } from '@talkie/types';

export function successResponse<T>(data: T, status = 200, requestId?: string): NextResponse<ApiResponse<T>> {
  const reqId = requestId || `req_${crypto.randomBytes(12).toString('hex')}`;
  return NextResponse.json(
    {
      data,
      error: null,
      requestId: reqId,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  code = 'BAD_REQUEST',
  status = 400,
  details?: any,
  requestId?: string
): NextResponse<ApiResponse<null>> {
  const reqId = requestId || `req_${crypto.randomBytes(12).toString('hex')}`;
  return NextResponse.json(
    {
      data: null,
      error: {
        code,
        message,
        details,
      },
      requestId: reqId,
    },
    { status }
  );
}
