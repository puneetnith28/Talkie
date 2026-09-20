import type { UserSession, AuthTokenPayload } from '@talkie/types';
import { signJwt, verifyJwt } from './jwt';

export const AUTH_COOKIE_NAME = 'talkie_session';

/**
 * Creates an encrypted/signed session JWT token string.
 */
export function createSessionToken(session: UserSession, secret: string, expiresInSeconds = 86400 * 7): string {
  const payload: Omit<AuthTokenPayload, 'iat' | 'exp'> = {
    sub: session.userId,
    email: session.email,
    workspaceId: session.workspaceId,
    role: session.role,
  };
  return signJwt(payload, secret, expiresInSeconds);
}

/**
 * Validates a session JWT and extracts payload.
 */
export function validateSessionToken(token: string, secret: string): AuthTokenPayload | null {
  return verifyJwt<AuthTokenPayload>(token, secret);
}
