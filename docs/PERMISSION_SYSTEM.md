# ResearchHub Permission System Documentation

## Overview

ResearchHub implements a comprehensive role-based access control (RBAC) system with multi-layered security for managing user permissions across the platform. This document provides a complete guide to understanding, implementing, and maintaining the permission system.

## Table of Contents

1. [Role Hierarchy](#role-hierarchy)
2. [Permission Matrix](#permission-matrix)
3. [Authentication Layers](#authentication-layers)
4. [Permission Utilities](#permission-utilities)
5. [Middleware Functions](#middleware-functions)
6. [Implementation Examples](#implementation-examples)
7. [Best Practices](#best-practices)
8. [Security Considerations](#security-considerations)

---

## Role Hierarchy

### User Roles

The system defines four distinct user roles with hierarchical permissions:

```typescript
const USER_ROLES = {
  PARTICIPANT: 'participant',      // Level 1 - Basic access
  RESEARCHER: 'researcher',        // Level 2 - Study management
  ADMIN: 'admin',                 // Level 3 - User management
  SUPER_ADMIN: 'super_admin'      // Level 4 - System administration
} as const;
```

### Role Descriptions

#### 1. Participant (`participant`)
- **Purpose**: End users who participate in research studies
- **Primary Actions**: Join studies, submit feedback, participate in sessions
- **Access Level**: Limited to own data and assigned tasks
- **Restrictions**: Cannot create studies or access analytics

#### 2. Researcher (`researcher`)
- **Purpose**: Research professionals who design and conduct studies
- **Primary Actions**: Create studies, manage participants, analyze data
- **Access Level**: Full access to own studies and team collaborations
- **Special Features**: Team collaboration, advanced analytics, participant management

#### 3. Admin (`admin`)
- **Purpose**: Platform administrators with user management capabilities
- **Primary Actions**: All researcher functions plus user management
- **Access Level**: Can override ownership restrictions for support purposes
- **Enhanced Features**: User role management, system monitoring

#### 4. Super Admin (`super_admin`)
- **Purpose**: Technical administrators with full system access
- **Primary Actions**: Complete system control and configuration
- **Access Level**: Unrestricted access to all resources and functions
- **System Control**: Database access, server configuration, security settings

---

## Permission Matrix

### Detailed Access Control

| Resource/Action | Participant | Researcher | Admin | Super Admin |
|----------------|-------------|------------|-------|-------------|
| **Study Management** |
| Create Study | ❌ | ✅ | ✅ | ✅ |
| View Own Studies | ❌ | ✅ | ✅ | ✅ |
| View All Studies | ❌ | ❌ | ✅ | ✅ |
| Update Study | ❌ | ✅ (owner/team) | ✅ | ✅ |
| Delete Study | ❌ | ✅ (owner) | ✅ | ✅ |
| Manage Study Team | ❌ | ✅ (owner) | ✅ | ✅ |
| **Participant Management** |
| Create Participant | ❌ | ✅ | ✅ | ✅ |
| View Participants | ❌ | ✅ (own studies) | ✅ | ✅ |
| Invite Participants | ❌ | ✅ | ✅ | ✅ |
| Manage Participants | ❌ | ✅ (own studies) | ✅ | ✅ |
| **Session Management** |
| Join Session | ✅ (assigned) | ❌ | ✅ | ✅ |
| Create Session | ❌ | ✅ | ✅ | ✅ |
| Start/End Session | ❌ | ✅ (own studies) | ✅ | ✅ |
| View Session Data | ✅ (own) | ✅ (own studies) | ✅ | ✅ |
| **Recording & Analytics** |
| View Own Recordings | ✅ | ✅ | ✅ | ✅ |
| Access Study Recordings | ❌ | ✅ (own studies) | ✅ | ✅ |
| Download Recordings | ❌ | ✅ (own studies) | ✅ | ✅ |
| Basic Analytics | ❌ | ✅ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ (subscription) | ✅ | ✅ |
| Export Analytics | ❌ | ✅ (subscription) | ✅ | ✅ |
| **User Management** |
| Update Own Profile | ✅ | ✅ | ✅ | ✅ |
| View User Profiles | ❌ | ✅ (limited) | ✅ | ✅ |
| Create Users | ❌ | ❌ | ✅ | ✅ |
| Delete Users | ❌ | ❌ | ✅ | ✅ |
| Manage User Roles | ❌ | ❌ | ✅ | ✅ |
| **Subscription & Billing** |
| View Subscription | ✅ (own) | ✅ (own) | ✅ | ✅ |
| Manage Subscription | ❌ | ✅ (own) | ✅ | ✅ |
| Process Payments | ❌ | ✅ | ✅ | ✅ |
| Issue Refunds | ❌ | ❌ | ✅ | ✅ |

---

## Authentication Layers

The system implements six authentication layers for comprehensive security:

### 1. JWT Token Authentication
```typescript
// Standard bearer token authentication
Authorization: Bearer <access_token>
```
- **Usage**: Primary authentication for web application
- **Middleware**: `authenticateToken`
- **Scope**: All authenticated endpoints

### 2. Role-Based Authorization
```typescript
// Check user role permissions
requireRole(['researcher', 'admin'])
```
- **Usage**: Restrict access based on user role
- **Middleware**: `requireRole`, `requireResearcher`, `requireAdmin`
- **Scope**: Role-specific endpoints

### 3. Resource Ownership Validation
```typescript
// Verify user owns the resource
requireOwnershipOrAdmin('userId')
```
- **Usage**: Ensure users can only access their own resources
- **Middleware**: `requireOwnershipOrAdmin`, `requireResourceOwnership`
- **Scope**: User-specific data endpoints

### 4. Session Token Authentication
```typescript
// Participant session authentication
X-Session-Token: <session_token>
```
- **Usage**: Authenticate participants during active study sessions
- **Middleware**: `authenticateSessionToken`
- **Scope**: Participant session endpoints

### 5. API Key Authentication
```typescript
// External integrations
X-API-Key: <api_key>
```
- **Usage**: Third-party integrations and webhooks
- **Middleware**: `authenticateApiKey`
- **Scope**: External API endpoints

### 6. Subscription-Based Gating
```typescript
// Feature access control
requireSubscription('advanced_analytics')
```
- **Usage**: Restrict premium features to subscribed users
- **Middleware**: `requireSubscription`, `requireActiveSubscription`
- **Scope**: Premium feature endpoints

---

## Permission Utilities

### Core Functions

#### Role Checking
```typescript
import { hasRole, hasAnyRole, isAdmin, isResearcher } from '../utils/permissions.util.js';

// Check specific role
if (hasRole(user, 'researcher')) {
  // User is a researcher
}

// Check multiple roles
if (hasAnyRole(user, ['admin', 'super_admin'])) {
  // User is admin or super admin
}

// Convenience functions
if (isAdmin(user)) {
  // User has admin privileges
}
```

#### Permission Checking
```typescript
import { hasPermission, hasAnyPermission } from '../utils/permissions.util.js';

// Check specific permission
if (hasPermission(user, 'study:create')) {
  // User can create studies
}

// Check multiple permissions
if (hasAnyPermission(user, ['study:read', 'study:update'])) {
  // User can read or update studies
}
```

#### Resource Access
```typescript
import { isResourceOwner, canAccessStudy } from '../utils/permissions.util.js';

// Check resource ownership
if (isResourceOwner(user, resourceUserId)) {
  // User owns the resource
}

// Check study access (owner, team member, or admin)
if (canAccessStudy(user, study.createdBy, study.team)) {
  // User can access the study
}
```

#### Subscription Validation
```typescript
import { hasActiveSubscription, hasSubscriptionFeature } from '../utils/permissions.util.js';

// Check active subscription
if (hasActiveSubscription(user)) {
  // User has active subscription
}

// Check specific feature
if (hasSubscriptionFeature(user, 'advanced_analytics')) {
  // User has access to advanced analytics
}
```

---

## Middleware Functions

### Standard Authentication
```typescript
// Basic token authentication
app.use('/api/protected', authenticateToken);

// Optional authentication (doesn't fail if no token)
app.use('/api/public', optionalAuth);
```

### Role-Based Access
```typescript
// Require specific roles
app.use('/api/admin', requireRole(['admin', 'super_admin']));
app.use('/api/research', requireResearcher);
app.use('/api/management', requireAdmin);
```

### Resource Protection
```typescript
// Protect user-specific resources
app.use('/api/users/:userId', requireOwnershipOrAdmin('userId'));

// Protect study access
app.use('/api/studies/:studyId', requireStudyAccess);

// Generic resource protection
app.use('/api/studies/:id', requireResourceOwnership('study', 'id', 'createdBy'));
```

### Subscription Gating
```typescript
// Require active subscription
app.use('/api/premium', requireActiveSubscription());

// Require specific feature
app.use('/api/analytics/advanced', requireActiveSubscription('advanced_analytics'));
```

### Session Authentication
```typescript
// Participant session validation
app.use('/api/sessions/:sessionId/participant', authenticateSessionToken);
app.use('/api/sessions/:sessionId/validate', validateParticipantSession);
```

---

## Implementation Examples

### Controller Implementation

```typescript
// Study controller with permission checks
export const createStudy = asyncHandler(async (req: AuthRequest, res: Response) => {
  // User authentication handled by middleware
  // Role check: requireResearcher middleware
  
  // Check subscription for study creation
  if (!hasActiveSubscription(req.user!)) {
    throw createError.forbidden(PERMISSION_ERRORS.SUBSCRIPTION_REQUIRED);
  }
  
  const study = new Study({
    ...req.body,
    createdBy: req.user!._id
  });
  
  await study.save();
  
  res.status(201).json({
    success: true,
    data: study
  });
});

// Study access with team collaboration
export const getStudyAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studyId } = req.params;
  
  // Study access validation handled by requireStudyAccess middleware
  const study = req.study; // Attached by middleware
  
  // Check subscription for advanced analytics
  if (!hasSubscriptionFeature(req.user!, 'advanced_analytics')) {
    throw createError.forbidden(PERMISSION_ERRORS.FEATURE_NOT_AVAILABLE('advanced_analytics'));
  }
  
  const analytics = await generateAnalytics(study);
  
  res.json({
    success: true,
    data: analytics
  });
});
```

### Route Protection

```typescript
// Auth routes
router.post('/register', validateRequest(userValidation.register), register);
router.post('/login', validateRequest(userValidation.login), login);

// Protected routes with role-based access
router.use(authenticateToken); // All routes below require authentication

// Researcher-only routes
router.use('/studies', requireResearcher);
router.post('/studies', requireActiveSubscription(), createStudy);
router.get('/studies/:studyId', requireStudyAccess, getStudy);
router.put('/studies/:studyId', requireStudyAccess, updateStudy);

// Admin-only routes
router.use('/admin', requireAdmin);
router.get('/admin/users', getAllUsers);
router.delete('/admin/users/:userId', requireOwnershipOrAdmin('userId'), deleteUser);

// Subscription-gated routes
router.get('/analytics/advanced', 
  requireActiveSubscription('advanced_analytics'), 
  getAdvancedAnalytics
);
```

---

## Best Practices

### 1. Layered Security
- Always implement multiple permission layers
- Use authentication → authorization → resource validation
- Never rely on client-side permission checks alone

### 2. Principle of Least Privilege
- Grant minimum necessary permissions
- Use specific permission checks rather than broad role checks
- Regularly audit and review permissions

### 3. Error Handling
```typescript
// Consistent error responses
if (!hasPermission(user, 'study:create')) {
  throw createError.forbidden(PERMISSION_ERRORS.PERMISSION_REQUIRED('study:create'));
}

// Avoid information disclosure
if (!study || !canAccessStudy(user, study.createdBy, study.team)) {
  throw createError.notFound(PERMISSION_ERRORS.RESOURCE_NOT_FOUND);
}
```

### 4. Middleware Chain Design
```typescript
// Proper middleware ordering
router.use(authenticateToken);           // 1. Authenticate user
router.use(requireResearcher);           // 2. Check role
router.use('/studies/:id', requireStudyAccess); // 3. Validate resource access
router.use(requireActiveSubscription()); // 4. Check subscription
```

### 5. Team Collaboration
```typescript
// Study team access pattern
const study = await Study.findById(studyId);
if (!canAccessStudy(req.user, study.createdBy, study.team)) {
  throw createError.forbidden(PERMISSION_ERRORS.STUDY_ACCESS_DENIED);
}
```

---

## Security Considerations

### 1. Token Security
- Use short-lived access tokens (15-30 minutes)
- Implement refresh token rotation
- Store tokens securely (httpOnly cookies for refresh tokens)

### 2. Role Escalation Prevention
- Validate role changes through admin approval
- Log all permission changes
- Implement role change cooldown periods

### 3. Resource Access Validation
- Always validate resource ownership at the database level
- Use parameterized queries to prevent injection
- Implement rate limiting per user

### 4. Subscription Security
- Validate subscription status on every premium feature access
- Implement feature usage tracking
- Use webhook validation for payment updates

### 5. Session Management
- Validate session tokens on every request
- Implement session timeout and cleanup
- Use secure session token generation

### 6. API Security
- Rotate API keys regularly
- Implement API key usage tracking
- Use IP whitelisting for sensitive integrations

---

## Common Permission Patterns

### Study Management Pattern
```typescript
// 1. Authenticate user
authenticateToken

// 2. Check researcher role
requireResearcher

// 3. Validate study access (owner/team/admin)
requireStudyAccess

// 4. Check subscription for premium features
requireActiveSubscription('feature_name')
```

### User Data Pattern
```typescript
// 1. Authenticate user
authenticateToken

// 2. Validate resource ownership or admin
requireOwnershipOrAdmin('userId')

// 3. Additional role checks if needed
requireRole(['admin']) // for sensitive operations
```

### Participant Session Pattern
```typescript
// 1. Authenticate session token
authenticateSessionToken

// 2. Validate participant session
validateParticipantSession

// 3. Check session status and permissions
// (handled in middleware)
```

This permission system provides comprehensive security while maintaining flexibility for different use cases and user types in the ResearchHub platform.
