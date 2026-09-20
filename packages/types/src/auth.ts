// Authentication & Session Types

import type { WorkspaceRole } from './index';

export interface UserSession {
  userId: string;
  email: string;
  name?: string | null;
  workspaceId: string;
  workspaceSlug: string;
  role: WorkspaceRole;
  isDemoMode?: boolean;
}

export interface AuthTokenPayload {
  sub: string; // userId
  email: string;
  workspaceId: string;
  role: WorkspaceRole;
  iat: number;
  exp: number;
}

export interface ApiKeyContext {
  keyId: string;
  workspaceId: string;
  name: string;
  role: WorkspaceRole;
}

export interface AuthContext {
  user?: UserSession;
  apiKey?: ApiKeyContext;
  workspaceId: string;
  isAuthenticated: boolean;
  isDemoMode?: boolean;
}

export interface PasswordHashResult {
  hash: string;
  salt: string;
}
