import { prisma } from '../client';
import type { WorkspaceRole } from '@talkie/types';

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  userId: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  slug?: string;
  balanceCents?: number;
}

export class WorkspaceService {
  /**
   * Create a new workspace and add creator as owner
   */
  static async create(input: CreateWorkspaceInput) {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: input.name,
          slug: input.slug,
          balanceCents: 5000,
        },
      });

      if (input.userId) {
        await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: input.userId,
            role: 'owner',
          },
        });
      }

      return workspace;
    });
  }

  /**
   * Get workspace by ID with member validation
   */
  static async getById(workspaceId: string, userId?: string) {
    if (userId) {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });
      if (!membership) return null;
    }

    return prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });
  }

  /**
   * Get workspace by slug
   */
  static async getBySlug(slug: string) {
    return prisma.workspace.findUnique({
      where: { slug },
    });
  }

  /**
   * List all workspaces for a user
   */
  static async listUserWorkspaces(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role as WorkspaceRole,
    }));
  }

  /**
   * Update workspace details
   */
  static async update(workspaceId: string, input: UpdateWorkspaceInput) {
    return prisma.workspace.update({
      where: { id: workspaceId },
      data: input,
    });
  }

  /**
   * Delete workspace and all cascading child records
   */
  static async delete(workspaceId: string) {
    return prisma.workspace.delete({
      where: { id: workspaceId },
    });
  }
}
