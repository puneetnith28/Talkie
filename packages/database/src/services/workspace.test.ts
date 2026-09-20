import { describe, it, expect } from 'vitest';
import { WorkspaceService } from './workspace.service';
import { MemberService } from './member.service';

describe('Workspace & Member Service Layer', () => {
  it('should expose WorkspaceService static methods', () => {
    expect(typeof WorkspaceService.create).toBe('function');
    expect(typeof WorkspaceService.getById).toBe('function');
    expect(typeof WorkspaceService.getBySlug).toBe('function');
    expect(typeof WorkspaceService.listUserWorkspaces).toBe('function');
    expect(typeof WorkspaceService.update).toBe('function');
    expect(typeof WorkspaceService.delete).toBe('function');
  });

  it('should expose MemberService static methods', () => {
    expect(typeof MemberService.addMember).toBe('function');
    expect(typeof MemberService.updateRole).toBe('function');
    expect(typeof MemberService.removeMember).toBe('function');
    expect(typeof MemberService.listMembers).toBe('function');
    expect(typeof MemberService.getMembership).toBe('function');
  });
});
