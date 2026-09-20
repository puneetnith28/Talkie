import { describe, it, expect, beforeAll } from 'vitest';
import { prisma, WorkspaceService } from '@talkie/database';
import { syncClerkUser, deleteClerkUser } from '../../apps/web/src/lib/auth/clerk-sync';

describe('Phase 2 Checkpoint: Clerk Authentication & Multi-Tenant Isolation Security Suite', () => {
  const clerkUserId1 = `user_clerk_test_${Date.now()}_1`;
  const clerkUserId2 = `user_clerk_test_${Date.now()}_2`;

  it('idempotently provisions a new user and dedicated workspace on first sign-in', async () => {
    const result1 = await syncClerkUser({
      clerkUserId: clerkUserId1,
      email: `developer_${Date.now()}@acme.corp`,
      name: 'Developer One',
    });

    expect(result1.isNewUser).toBe(true);
    expect(result1.user.clerkUserId).toBe(clerkUserId1);
    expect(result1.workspace.role).toBe('owner');
    expect(result1.workspace.balanceCents).toBe(5000); // $50 default starting balance

    // Second sync with identical clerkUserId should be idempotent (not create duplicate user or workspace)
    const result2 = await syncClerkUser({
      clerkUserId: clerkUserId1,
      email: `developer_${Date.now()}@acme.corp`,
      name: 'Developer One Updated',
    });

    expect(result2.isNewUser).toBe(false);
    expect(result2.user.id).toBe(result1.user.id);
    expect(result2.workspace.id).toBe(result1.workspace.id);
  });

  it('guarantees isolated workspaces for separate Clerk users', async () => {
    const userA = await syncClerkUser({
      clerkUserId: clerkUserId2,
      email: `user_b_${Date.now()}@startup.io`,
      name: 'Tenant B User',
    });

    const user1Record = await prisma.user.findUnique({
      where: { clerkUserId: clerkUserId1 },
      include: { memberships: true },
    });

    const user2Record = await prisma.user.findUnique({
      where: { clerkUserId: clerkUserId2 },
      include: { memberships: true },
    });

    expect(user1Record).toBeDefined();
    expect(user2Record).toBeDefined();
    expect(user1Record?.memberships[0].workspaceId).not.toBe(
      user2Record?.memberships[0].workspaceId
    );
  });

  it('handles user deletion cleanup upon webhook event', async () => {
    const tempClerkId = `user_clerk_temp_${Date.now()}`;
    await syncClerkUser({
      clerkUserId: tempClerkId,
      email: `temp_${Date.now()}@talkie.ai`,
      name: 'Temporary User',
    });

    const beforeDelete = await prisma.user.findUnique({
      where: { clerkUserId: tempClerkId },
    });
    expect(beforeDelete).toBeDefined();

    const deleted = await deleteClerkUser(tempClerkId);
    expect(deleted).toBe(true);

    const afterDelete = await prisma.user.findUnique({
      where: { clerkUserId: tempClerkId },
    });
    expect(afterDelete).toBeNull();
  });
});
