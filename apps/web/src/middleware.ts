import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/settings(.*)',
]);

const hasClerkKey = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_clerk')
);

export default clerkMiddleware(async (auth, request) => {
  const requestId =
    request.headers.get('x-request-id') ||
    `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Handle preflight CORS for API routes
  if (request.method === 'OPTIONS' && request.nextUrl.pathname.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Workspace-Id, X-Request-Id, X-Talkie-Signature, X-Talkie-Timestamp, X-Talkie-Event',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Protect /dashboard and /settings routes if Clerk credentials are configured
  if (hasClerkKey && isProtectedRoute(request)) {
    await auth.protect();
  }

  const response = NextResponse.next();
  response.headers.set('X-Request-Id', requestId);

  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
