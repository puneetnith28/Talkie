import { describe, it, expect } from 'vitest';
import {
  WorkspaceService,
  MemberService,
  AgentService,
  NumberService,
  ContactService,
  MessageService,
  CallService,
  WebhookService,
  UsageService,
  AuditService,
  IdempotencyService,
} from '@talkie/database';
import {
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  generateApiKey,
  verifyApiKey,
  hasRequiredRole,
  canPerformAction,
} from '@talkie/auth';

describe('Backend Services & Domain Integration (Checkpoint 2)', () => {
  it('should verify all domain service contracts and methods are available', () => {
    // 1. Workspace & Member Services
    expect(WorkspaceService).toBeDefined();
    expect(MemberService).toBeDefined();

    // 2. Agent & Telephony Services
    expect(AgentService).toBeDefined();
    expect(NumberService).toBeDefined();

    // 3. Contact & Messaging Services
    expect(ContactService).toBeDefined();
    expect(MessageService).toBeDefined();

    // 4. Voice Call & Transcript Services
    expect(CallService).toBeDefined();

    // 5. Webhooks & Developer Platform Services
    expect(WebhookService).toBeDefined();

    // 6. Usage, Audit & Idempotency Services
    expect(UsageService).toBeDefined();
    expect(AuditService).toBeDefined();
    expect(IdempotencyService).toBeDefined();
  });

  it('should verify authentication, cryptography, and RBAC authorization pipeline', async () => {
    // Password hashing
    const rawPass = 'TalkieSecure123!';
    const hash = await hashPassword(rawPass);
    expect(await verifyPassword(rawPass, hash)).toBe(true);

    // JWT session issue
    const secret = 'jwt-integration-secret';
    const token = signJwt(
      { sub: 'u_test', email: 'test@talkie.ai', workspaceId: 'ws_test', role: 'owner' },
      secret,
      3600
    );
    const verified = verifyJwt(token, secret);
    expect(verified?.sub).toBe('u_test');
    expect(verified?.role).toBe('owner');

    // API Key lifecycle
    const apiKey = generateApiKey('tk_live');
    expect(apiKey.rawKey.startsWith('tk_live_')).toBe(true);
    expect(verifyApiKey(apiKey.rawKey, apiKey.keyHash)).toBe(true);

    // RBAC Permissions
    expect(hasRequiredRole('owner', 'developer')).toBe(true);
    expect(canPerformAction('owner', 'workspace:delete')).toBe(true);
    expect(canPerformAction('developer', 'agents:create')).toBe(true);
    expect(canPerformAction('member', 'agents:create')).toBe(false);
  });
});
