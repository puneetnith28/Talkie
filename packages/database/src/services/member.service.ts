import { prisma } from '../client';
import type { WorkspaceRole } from '@talkie/types';

export interface AddMemberInput {
  workspaceId: string;
  userId: string;
  role?: WorkspaceRole;
}

export interface UpdateMemberRoleInput {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
}

export class MemberService {
  /**
   * Add a member to a workspace
   */
  static async addMember(input: AddMemberInput) {
    return prisma.workspaceMember.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        role: input.role || 'member',
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  /**
   * Update a member's role in a workspace
   */
  static async updateRole(input: UpdateMemberRoleInput) {
    return prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId: input.workspaceId,
          userId: input.userId,
        },
      },
      data: {
        role: input.role,
      },
    });
  }

  /**
   * Remove a member from a workspace
   */
  static async removeMember(workspaceId: string, userId: string) {
    return prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  /**
   * List all members of a workspace
   */
  static async listMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get specific user membership
   */
  static async getMembership(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }
}
