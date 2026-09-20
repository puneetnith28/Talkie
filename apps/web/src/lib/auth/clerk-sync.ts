import { prisma } from '@talkie/database';

export interface SyncClerkUserInput {
  clerkUserId: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
}

export interface SyncClerkUserResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    clerkUserId: string | null;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
    balanceCents: number;
    role: string;
  };
  isNewUser: boolean;
}

/**
 * Idempotently syncs a Clerk-authenticated user into the Prisma database,
 * automatically provisioning an initial default workspace if none exists.
 */
export async function syncClerkUser(input: SyncClerkUserInput): Promise<SyncClerkUserResult> {
  const { clerkUserId, email, name } = input;

  // 1. Look up existing user by clerkUserId or email
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ clerkUserId }, { email }],
    },
    include: {
      memberships: {
        include: { workspace: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    // Create new user record
    user = await prisma.user.create({
      data: {
        clerkUserId,
        email,
        name: name || email.split('@')[0],
      },
      include: {
        memberships: {
          include: { workspace: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  } else if (!user.clerkUserId) {
    // Link existing email user with clerkUserId
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        clerkUserId,
        name: name || user.name,
      },
      include: {
        memberships: {
          include: { workspace: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  // 2. Ensure user has at least one active workspace
  let primaryMembership = user.memberships[0];

  if (!primaryMembership) {
    const slugSuffix = Math.random().toString(36).substring(2, 8);
    const workspaceName = name ? `${name}'s Workspace` : 'Primary Workspace';
    const workspaceSlug = `${(name || 'workspace')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}-${slugSuffix}`;

    const newWorkspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug: workspaceSlug,
        balanceCents: 5000, // $50.00 initial credit
        members: {
          create: {
            userId: user.id,
            role: 'owner',
          },
        },
      },
    });

    primaryMembership = {
      id: `mem_${Date.now()}`,
      workspaceId: newWorkspace.id,
      userId: user.id,
      role: 'owner',
      createdAt: new Date(),
      updatedAt: new Date(),
      workspace: newWorkspace,
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      clerkUserId: user.clerkUserId,
    },
    workspace: {
      id: primaryMembership.workspace.id,
      name: primaryMembership.workspace.name,
      slug: primaryMembership.workspace.slug,
      balanceCents: primaryMembership.workspace.balanceCents,
      role: primaryMembership.role,
    },
    isNewUser,
  };
}

/**
 * Cleanup or deactivate user upon Clerk user.deleted webhook.
 */
export async function deleteClerkUser(clerkUserId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) return false;

  await prisma.user.delete({
    where: { id: user.id },
  });

  return true;
}
