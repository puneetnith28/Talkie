import type { WorkspaceRole } from '@talkie/types';

export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 4,
  admin: 3,
  developer: 2,
  member: 1,
};

/**
 * Checks if a user's role meets or exceeds the required role.
 */
export function hasRequiredRole(userRole: WorkspaceRole, requiredRole: WorkspaceRole): boolean {
  const userRank = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredRank = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userRank >= requiredRank;
}

export type ResourceAction =
  | 'workspace:delete'
  | 'workspace:update'
  | 'members:invite'
  | 'members:remove'
  | 'members:update_role'
  | 'api_keys:create'
  | 'api_keys:revoke'
  | 'billing:manage'
  | 'agents:create'
  | 'agents:update'
  | 'agents:delete'
  | 'numbers:provision'
  | 'numbers:release'
  | 'numbers:attach'
  | 'calls:create'
  | 'messages:send'
  | 'webhooks:manage';

const ACTION_ROLE_MAP: Record<ResourceAction, WorkspaceRole> = {
  'workspace:delete': 'owner',
  'billing:manage': 'owner',
  'members:update_role': 'admin',
  'members:remove': 'admin',
  'members:invite': 'admin',
  'workspace:update': 'admin',
  'api_keys:create': 'developer',
  'api_keys:revoke': 'developer',
  'agents:create': 'developer',
  'agents:update': 'developer',
  'agents:delete': 'developer',
  'numbers:provision': 'developer',
  'numbers:release': 'developer',
  'numbers:attach': 'developer',
  'webhooks:manage': 'developer',
  'calls:create': 'member',
  'messages:send': 'member',
};

/**
 * Check whether a role has permission to perform a specific action.
 */
export function canPerformAction(role: WorkspaceRole, action: ResourceAction): boolean {
  const requiredRole = ACTION_ROLE_MAP[action];
  if (!requiredRole) return false;
  return hasRequiredRole(role, requiredRole);
}
