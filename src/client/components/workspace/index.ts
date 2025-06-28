/**
 * Workspace Components Index
 * Centralized exports for all workspace-related components
 */

export { default as WorkspaceManager } from './WorkspaceManager';
export { default as WorkspaceSelector } from './WorkspaceSelector';
export { default as TeamMemberList } from './TeamMemberList';
export { default as InviteTeamMember } from './InviteTeamMember';

// Re-export types for convenience
export type {
  IWorkspace,
  WorkspaceMember,
  WorkspaceRole,
  IWorkspaceInvitation,
  WorkspacePermissions,
  WorkspaceSettings
} from '../../../shared/types';
