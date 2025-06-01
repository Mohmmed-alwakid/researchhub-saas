/**
 * @fileoverview Comprehensive permission system utilities for ResearchHub
 * @description Centralized permission constants, checks, and utilities for role-based access control
 */

import type { IUserDocument } from '../../database/models/index.js';

// =============================================================================
// PERMISSION CONSTANTS
// =============================================================================

/**
 * User roles in the system
 */
export const USER_ROLES = {
  PARTICIPANT: 'participant',
  RESEARCHER: 'researcher', 
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;

/**
 * Permission actions that can be performed on resources
 */
export const PERMISSIONS = {
  // Study permissions
  STUDY_CREATE: 'study:create',
  STUDY_READ: 'study:read',
  STUDY_UPDATE: 'study:update',
  STUDY_DELETE: 'study:delete',
  STUDY_MANAGE_TEAM: 'study:manage_team',
  STUDY_VIEW_ANALYTICS: 'study:view_analytics',
  
  // Participant permissions
  PARTICIPANT_CREATE: 'participant:create',
  PARTICIPANT_READ: 'participant:read',
  PARTICIPANT_UPDATE: 'participant:update',
  PARTICIPANT_DELETE: 'participant:delete',
  PARTICIPANT_INVITE: 'participant:invite',
  PARTICIPANT_MANAGE: 'participant:manage',
  
  // Session permissions
  SESSION_CREATE: 'session:create',
  SESSION_READ: 'session:read',
  SESSION_UPDATE: 'session:update',
  SESSION_DELETE: 'session:delete',
  SESSION_JOIN: 'session:join',
  SESSION_START: 'session:start',
  SESSION_END: 'session:end',
  
  // Recording permissions
  RECORDING_CREATE: 'recording:create',
  RECORDING_READ: 'recording:read',
  RECORDING_UPDATE: 'recording:update',
  RECORDING_DELETE: 'recording:delete',
  RECORDING_DOWNLOAD: 'recording:download',
  
  // Feedback permissions
  FEEDBACK_CREATE: 'feedback:create',
  FEEDBACK_READ: 'feedback:read',
  FEEDBACK_UPDATE: 'feedback:update',
  FEEDBACK_DELETE: 'feedback:delete',
  
  // Task permissions
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  
  // Analytics permissions
  ANALYTICS_VIEW_BASIC: 'analytics:view_basic',
  ANALYTICS_VIEW_ADVANCED: 'analytics:view_advanced',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // User management permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage_roles',
  
  // Subscription permissions
  SUBSCRIPTION_VIEW: 'subscription:view',
  SUBSCRIPTION_MANAGE: 'subscription:manage',
  SUBSCRIPTION_BILLING: 'subscription:billing',
  
  // Payment permissions
  PAYMENT_VIEW: 'payment:view',
  PAYMENT_PROCESS: 'payment:process',
  PAYMENT_REFUND: 'payment:refund',
  
  // System permissions
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_MONITOR: 'system:monitor',
  SYSTEM_CONFIG: 'system:config'
} as const;

/**
 * Resource types in the system
 */
export const RESOURCE_TYPES = {
  STUDY: 'study',
  PARTICIPANT: 'participant',
  SESSION: 'session',
  RECORDING: 'recording',
  FEEDBACK: 'feedback',
  TASK: 'task',
  USER: 'user',
  SUBSCRIPTION: 'subscription',
  PAYMENT: 'payment'
} as const;

// =============================================================================
// ROLE-BASED PERMISSION MATRIX
// =============================================================================

/**
 * Type for permission values
 */
type PermissionValue = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Default permissions for each role
 */
export const ROLE_PERMISSIONS: Record<string, PermissionValue[]> = {
  [USER_ROLES.PARTICIPANT]: [
    // Session permissions
    PERMISSIONS.SESSION_JOIN,
    PERMISSIONS.SESSION_READ, // Own sessions only
    
    // Feedback permissions
    PERMISSIONS.FEEDBACK_CREATE,
    PERMISSIONS.FEEDBACK_READ, // Own feedback only
    PERMISSIONS.FEEDBACK_UPDATE, // Own feedback only
    
    // Recording permissions (limited)
    PERMISSIONS.RECORDING_READ, // Own recordings only
    
    // Task permissions (limited)
    PERMISSIONS.TASK_READ, // Assigned tasks only
    PERMISSIONS.TASK_UPDATE, // Own task responses only
    
    // User permissions (self only)
    PERMISSIONS.USER_READ, // Own profile only
    PERMISSIONS.USER_UPDATE // Own profile only
  ],
  
  [USER_ROLES.RESEARCHER]: [
    // Study permissions
    PERMISSIONS.STUDY_CREATE,
    PERMISSIONS.STUDY_READ,
    PERMISSIONS.STUDY_UPDATE,
    PERMISSIONS.STUDY_DELETE,
    PERMISSIONS.STUDY_MANAGE_TEAM,
    PERMISSIONS.STUDY_VIEW_ANALYTICS,
    
    // Participant permissions
    PERMISSIONS.PARTICIPANT_CREATE,
    PERMISSIONS.PARTICIPANT_READ,
    PERMISSIONS.PARTICIPANT_UPDATE,
    PERMISSIONS.PARTICIPANT_DELETE,
    PERMISSIONS.PARTICIPANT_INVITE,
    PERMISSIONS.PARTICIPANT_MANAGE,
    
    // Session permissions
    PERMISSIONS.SESSION_CREATE,
    PERMISSIONS.SESSION_READ,
    PERMISSIONS.SESSION_UPDATE,
    PERMISSIONS.SESSION_DELETE,
    PERMISSIONS.SESSION_START,
    PERMISSIONS.SESSION_END,
    
    // Recording permissions
    PERMISSIONS.RECORDING_CREATE,
    PERMISSIONS.RECORDING_READ,
    PERMISSIONS.RECORDING_UPDATE,
    PERMISSIONS.RECORDING_DELETE,
    PERMISSIONS.RECORDING_DOWNLOAD,
    
    // Feedback permissions
    PERMISSIONS.FEEDBACK_READ,
    PERMISSIONS.FEEDBACK_UPDATE,
    PERMISSIONS.FEEDBACK_DELETE,
    
    // Task permissions
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
    
    // Analytics permissions
    PERMISSIONS.ANALYTICS_VIEW_BASIC,
    PERMISSIONS.ANALYTICS_VIEW_ADVANCED,
    PERMISSIONS.ANALYTICS_EXPORT,
    
    // User permissions (limited)
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    
    // Subscription permissions
    PERMISSIONS.SUBSCRIPTION_VIEW,
    PERMISSIONS.SUBSCRIPTION_MANAGE,
    PERMISSIONS.SUBSCRIPTION_BILLING,
    
    // Payment permissions
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_PROCESS
  ],
  
  [USER_ROLES.ADMIN]: [],
  [USER_ROLES.SUPER_ADMIN]: []
};

// Add admin permissions after RESEARCHER permissions are defined
ROLE_PERMISSIONS[USER_ROLES.ADMIN] = [
  // All researcher permissions plus:
  ...ROLE_PERMISSIONS[USER_ROLES.RESEARCHER],
  
  // Enhanced user management
  PERMISSIONS.USER_CREATE,
  PERMISSIONS.USER_DELETE,
  PERMISSIONS.USER_MANAGE_ROLES,
  
  // Payment permissions
  PERMISSIONS.PAYMENT_REFUND,
  
  // System permissions
  PERMISSIONS.SYSTEM_MONITOR
];

// Add super admin permissions
ROLE_PERMISSIONS[USER_ROLES.SUPER_ADMIN] = [
  // All permissions - system-wide access
  ...Object.values(PERMISSIONS)
];

// =============================================================================
// PERMISSION UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: IUserDocument, permission: PermissionValue): boolean {
  if (!user || !user.role) {
    return false;
  }
  
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: IUserDocument, permissions: PermissionValue[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: IUserDocument, permissions: PermissionValue[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: IUserDocument, role: string): boolean {
  return user?.role === role;
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: IUserDocument, roles: string[]): boolean {
  return user?.role ? roles.includes(user.role) : false;
}

/**
 * Check if user is admin (admin or super_admin)
 */
export function isAdmin(user: IUserDocument): boolean {
  return hasAnyRole(user, [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]);
}

/**
 * Check if user is researcher (researcher, admin, or super_admin)
 */
export function isResearcher(user: IUserDocument): boolean {
  return hasAnyRole(user, [USER_ROLES.RESEARCHER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]);
}

/**
 * Check if user is participant
 */
export function isParticipant(user: IUserDocument): boolean {
  return hasRole(user, USER_ROLES.PARTICIPANT);
}

/**
 * Check if user owns a resource (matches user ID)
 */
export function isResourceOwner(user: IUserDocument, resourceUserId: string): boolean {
  if (!user?._id || !resourceUserId) {
    return false;
  }
  return user._id.toString() === resourceUserId.toString();
}

/**
 * Check if user is resource owner or admin
 */
export function isOwnerOrAdmin(user: IUserDocument, resourceUserId: string): boolean {
  return isResourceOwner(user, resourceUserId) || isAdmin(user);
}

/**
 * Check if user is member of a study team
 */
export function isStudyTeamMember(user: IUserDocument, studyTeam: string[]): boolean {
  if (!user?._id || !studyTeam) {
    return false;
  }
  return studyTeam.includes(user._id.toString());
}

/**
 * Check if user can access a study (owner, team member, or admin)
 */
export function canAccessStudy(user: IUserDocument, studyCreatedBy: string, studyTeam?: string[]): boolean {
  if (!user) {
    return false;
  }
  
  // Admin can access any study
  if (isAdmin(user)) {
    return true;
  }
  
  // Owner can access their study
  if (isResourceOwner(user, studyCreatedBy)) {
    return true;
  }
  
  // Team member can access study
  if (studyTeam && isStudyTeamMember(user, studyTeam)) {
    return true;
  }
  
  return false;
}

/**
 * Get all permissions for a user role
 */
export function getRolePermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
}

/**
 * Check if user has active subscription
 */
export function hasActiveSubscription(user: IUserDocument): boolean {
  return (user?.subscription as { status?: string })?.status === 'active';
}

/**
 * Check if user has specific subscription feature
 */
export function hasSubscriptionFeature(user: IUserDocument, feature: string): boolean {
  if (!hasActiveSubscription(user)) {
    return false;
  }
    // Type assertion since we know subscription exists and is active
  const subscription = user.subscription as { hasFeature?: (feature: string) => boolean };
  return subscription?.hasFeature?.(feature) === true;
}

// =============================================================================
// PERMISSION ERROR MESSAGES
// =============================================================================

export const PERMISSION_ERRORS = {
  AUTHENTICATION_REQUIRED: 'Authentication required',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  ACCESS_DENIED: 'Access denied',
  RESOURCE_NOT_FOUND: 'Resource not found or access denied',
  ROLE_REQUIRED: (role: string) => `${role} role required`,
  PERMISSION_REQUIRED: (permission: string) => `Permission '${permission}' required`,
  SUBSCRIPTION_REQUIRED: 'Active subscription required',
  FEATURE_NOT_AVAILABLE: (feature: string) => `Feature '${feature}' not available in current plan`,
  ACCOUNT_INACTIVE: 'Account is not active',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  OWNER_OR_ADMIN_REQUIRED: 'Resource owner or admin privileges required',
  STUDY_ACCESS_DENIED: 'Study access denied - not owner, team member, or admin'
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type ResourceType = typeof RESOURCE_TYPES[keyof typeof RESOURCE_TYPES];
