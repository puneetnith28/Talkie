import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/settings(.*)',
]);

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_clerk') &&
  process.env.CLERK_SECRET_KEY &&
  !process.env.CLERK_SECRET_KEY.includes('your_clerk')
);

// Fallback basic middleware when Clerk keys are not configured (Demo / Test mode)
function fallbackMiddleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Handle preflight CORS for API routes
  if (request.method === 'OPTIONS' && request.nextUrl.pathname.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Workspace-Id, X-Request-Id, X-Talkie-Signature, X-Talkie-Timestamp, X-Talkie-Event',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Enforce authentication on protected dashboard & settings routes
  if (isProtectedRoute(request)) {
    const sessionCookie =
      request.cookies.get('talkie_session')?.value ||
      request.cookies.get('__session')?.value ||
      request.cookies.get('talkie_token')?.value;

    if (!sessionCookie) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Request-Id', requestId);

  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  return response;
}

export default hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      const requestId = req.headers.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Handle preflight CORS
      if (req.method === 'OPTIONS' && req.nextUrl.pathname.startsWith('/api/')) {
        return new NextResponse(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Workspace-Id, X-Request-Id, X-Talkie-Signature, X-Talkie-Timestamp, X-Talkie-Event',
            'Access-Control-Max-Age': '86400',
          },
        });
      }

      if (isProtectedRoute(req)) {
        await auth.protect();
      }

      const response = NextResponse.next();
      response.headers.set('X-Request-Id', requestId);
      if (req.nextUrl.pathname.startsWith('/api/')) {
        response.headers.set('Access-Control-Allow-Origin', '*');
      }
      return response;
    })
  : fallbackMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
