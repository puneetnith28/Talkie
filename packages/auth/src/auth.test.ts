import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  generateApiKey,
  hashApiKey,
  verifyApiKey,
  hasRequiredRole,
  canPerformAction,
  createSessionToken,
  validateSessionToken,
} from './index';

describe('Auth Foundation', () => {
  describe('Password Hashing & Verification', () => {
    it('should hash and verify passwords accurately', async () => {
      const password = 'SuperSecretPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toMatch(/^scrypt:[0-9a-f]+:[0-9a-f]+$/);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('should generate distinct hashes for identical passwords (salt randomness)', async () => {
      const password = 'IdenticalPassword!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('JWT Signing & Verification', () => {
    const secret = 'super-secure-jwt-signing-secret-key-12345';

    it('should sign and verify valid JWT token', () => {
      const payload = {
        sub: 'user_123',
        email: 'alex@example.com',
        workspaceId: 'ws_456',
        role: 'owner' as const,
      };

      const token = signJwt(payload, secret, 3600);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const verified = verifyJwt(token, secret);
      expect(verified).not.toBeNull();
      expect(verified?.sub).toBe('user_123');
      expect(verified?.email).toBe('alex@example.com');
      expect(verified?.workspaceId).toBe('ws_456');
      expect(verified?.role).toBe('owner');
    });

    it('should reject token signed with different secret', () => {
      const payload = {
        sub: 'user_123',
        email: 'alex@example.com',
        workspaceId: 'ws_456',
        role: 'admin' as const,
      };

      const token = signJwt(payload, secret, 3600);
      const verified = verifyJwt(token, 'different-wrong-secret');
      expect(verified).toBeNull();
    });

    it('should reject expired JWT token', () => {
      const payload = {
        sub: 'user_123',
        email: 'alex@example.com',
        workspaceId: 'ws_456',
        role: 'developer' as const,
      };

      // Set expiration to negative seconds (already expired)
      const token = signJwt(payload, secret, -10);
      const verified = verifyJwt(token, secret);
      expect(verified).toBeNull();
    });
  });

  describe('API Key Generation & Verification', () => {
    it('should generate valid API key with proper prefix, hint and hash', () => {
      const { rawKey, keyHash, keyHint } = generateApiKey('tk_live');

      expect(rawKey.startsWith('tk_live_')).toBe(true);
      expect(keyHint.startsWith('tk_live_...')).toBe(true);
      expect(keyHash).toBe(hashApiKey(rawKey));
      expect(verifyApiKey(rawKey, keyHash)).toBe(true);
      expect(verifyApiKey('tk_live_fakekey', keyHash)).toBe(false);
    });
  });

  describe('Role Hierarchy & Permissions', () => {
    it('should correctly evaluate role hierarchy', () => {
      expect(hasRequiredRole('owner', 'admin')).toBe(true);
      expect(hasRequiredRole('admin', 'developer')).toBe(true);
      expect(hasRequiredRole('developer', 'member')).toBe(true);
      expect(hasRequiredRole('member', 'admin')).toBe(false);
      expect(hasRequiredRole('developer', 'owner')).toBe(false);
    });

    it('should enforce action level permissions', () => {
      expect(canPerformAction('owner', 'workspace:delete')).toBe(true);
      expect(canPerformAction('admin', 'workspace:delete')).toBe(false);
      expect(canPerformAction('admin', 'members:invite')).toBe(true);
      expect(canPerformAction('developer', 'agents:create')).toBe(true);
      expect(canPerformAction('member', 'agents:create')).toBe(false);
      expect(canPerformAction('member', 'calls:create')).toBe(true);
    });
  });

  describe('Session Token Handling', () => {
    const secret = 'session-secret-salt-key';

    it('should create and validate session token', () => {
      const session = {
        userId: 'u_101',
        email: 'dev@talkie.ai',
        workspaceId: 'ws_909',
        workspaceSlug: 'talkie-dev',
        role: 'developer' as const,
      };

      const token = createSessionToken(session, secret);
      const validated = validateSessionToken(token, secret);

      expect(validated).not.toBeNull();
      expect(validated?.sub).toBe(session.userId);
      expect(validated?.email).toBe(session.email);
      expect(validated?.workspaceId).toBe(session.workspaceId);
    });
  });
});
