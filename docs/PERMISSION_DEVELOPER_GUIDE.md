# ResearchHub Permission System Developer Guide

## Quick Start Guide

This guide provides developers with practical examples for implementing permissions in the ResearchHub platform.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Implementation Patterns](#implementation-patterns)
3. [Middleware Usage](#middleware-usage)
4. [Controller Examples](#controller-examples)
5. [Common Scenarios](#common-scenarios)
6. [Troubleshooting](#troubleshooting)

---

## Quick Reference

### Import Statements
```typescript
// Middleware imports
import {
  authenticateToken,
  requireRole,
  requireResearcher,
  requireAdmin,
  requireOwnershipOrAdmin,
  requireStudyAccess,
  requireActiveSubscription,
  requirePermission,
  requireAnyPermission,
  requireResourceOwnership,
  validateParticipantSession
} from '../middleware/auth.middleware.js';

// Utility imports
import {
  hasPermission,
  hasAnyPermission,
  hasRole,
  isAdmin,
  isResearcher,
  isResourceOwner,
  canAccessStudy,
  hasActiveSubscription,
  hasSubscriptionFeature,
  PERMISSIONS,
  USER_ROLES,
  PERMISSION_ERRORS
} from '../utils/permissions.util.js';
```

### Role Constants
```typescript
USER_ROLES.PARTICIPANT    // 'participant'
USER_ROLES.RESEARCHER     // 'researcher'
USER_ROLES.ADMIN          // 'admin'
USER_ROLES.SUPER_ADMIN    // 'super_admin'
```

### Common Permissions
```typescript
PERMISSIONS.STUDY_CREATE          // 'study:create'
PERMISSIONS.STUDY_READ            // 'study:read'
PERMISSIONS.STUDY_UPDATE          // 'study:update'
PERMISSIONS.PARTICIPANT_MANAGE    // 'participant:manage'
PERMISSIONS.ANALYTICS_VIEW_ADVANCED // 'analytics:view_advanced'
```

---

## Implementation Patterns

### 1. Basic Route Protection

```typescript
// routes/studies.routes.ts
import { Router } from 'express';
import { authenticateToken, requireResearcher } from '../middleware/auth.middleware.js';

const router = Router();

// Public route - no authentication
router.get('/public-studies', getPublicStudies);

// Authenticated routes
router.use(authenticateToken); // All routes below require authentication

// Role-specific routes
router.use(requireResearcher); // All routes below require researcher role
router.post('/', createStudy);
router.get('/', getMyStudies);

// Specific resource protection
router.get('/:studyId', requireStudyAccess, getStudy);
router.put('/:studyId', requireStudyAccess, updateStudy);
router.delete('/:studyId', requireStudyAccess, deleteStudy);

export default router;
```

### 2. Controller Permission Checks

```typescript
// controllers/study.controller.ts
import { asyncHandler } from '../middleware/async.middleware.js';
import { hasActiveSubscription, canAccessStudy } from '../utils/permissions.util.js';

export const createStudy = asyncHandler(async (req: AuthRequest, res: Response) => {
  // User is already authenticated and role-checked by middleware
  
  // Additional permission checks
  if (!hasActiveSubscription(req.user!)) {
    throw createError.forbidden('Active subscription required to create studies');
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

export const getStudyAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studyId } = req.params;
  
  // Study access already validated by requireStudyAccess middleware
  const study = req.study; // Attached by middleware
  
  // Check for premium feature access
  if (!hasSubscriptionFeature(req.user!, 'advanced_analytics')) {
    throw createError.forbidden('Advanced analytics requires premium subscription');
  }
  
  const analytics = await generateAnalytics(study);
  
  res.json({
    success: true,
    data: analytics
  });
});
```

### 3. Team Collaboration Pattern

```typescript
// Study team access
export const addTeamMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studyId, userId } = req.body;
  
  const study = await Study.findById(studyId);
  
  // Check if user can manage this study (owner or admin)
  if (!isResourceOwner(req.user!, study.createdBy.toString()) && !isAdmin(req.user!)) {
    throw createError.forbidden('Only study owner or admin can manage team members');
  }
  
  // Add team member
  if (!study.team.includes(userId)) {
    study.team.push(userId);
    await study.save();
  }
  
  res.json({
    success: true,
    message: 'Team member added successfully'
  });
});
```

---

## Middleware Usage

### 1. Authentication Middleware

```typescript
// Basic authentication
router.use(authenticateToken);

// Optional authentication (doesn't fail if no token)
router.get('/public-data', optionalAuth, getPublicData);

// API key authentication for external services
router.use('/webhook', authenticateApiKey);

// Session token for participant interactions
router.use('/session', authenticateSessionToken);
```

### 2. Role-Based Middleware

```typescript
// Specific role requirements
router.use('/admin', requireRole(['admin', 'super_admin']));
router.use('/research', requireRole(['researcher', 'admin', 'super_admin']));

// Convenience middleware
router.use('/admin', requireAdmin);
router.use('/research', requireResearcher);
```

### 3. Resource Protection Middleware

```typescript
// Ownership validation
router.get('/users/:userId/profile', requireOwnershipOrAdmin('userId'), getUserProfile);

// Study access validation
router.get('/studies/:studyId', requireStudyAccess, getStudy);

// Generic resource ownership
router.get('/recordings/:id', 
  requireResourceOwnership('recording', 'id', 'createdBy'), 
  getRecording
);
```

### 4. Subscription Middleware

```typescript
// Basic subscription requirement
router.use('/premium', requireActiveSubscription());

// Feature-specific subscription
router.get('/analytics/heatmaps', 
  requireActiveSubscription('heatmap_analytics'), 
  getHeatmaps
);
```

### 5. Permission-Based Middleware

```typescript
// Specific permission requirement
router.post('/studies', requirePermission(PERMISSIONS.STUDY_CREATE), createStudy);

// Multiple permission options
router.get('/data', 
  requireAnyPermission([
    PERMISSIONS.ANALYTICS_VIEW_BASIC, 
    PERMISSIONS.ANALYTICS_VIEW_ADVANCED
  ]), 
  getData
);
```

---

## Controller Examples

### 1. Study Management Controller

```typescript
export class StudyController {
  // Create study - requires researcher role and subscription
  static createStudy = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Middleware: authenticateToken + requireResearcher + requireActiveSubscription
    
    const study = new Study({
      ...req.body,
      createdBy: req.user!._id,
      team: [req.user!._id] // Creator is automatically a team member
    });
    
    await study.save();
    
    res.status(201).json({
      success: true,
      data: study
    });
  });

  // Get study - requires study access (owner/team/admin)
  static getStudy = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Middleware: authenticateToken + requireStudyAccess
    
    const study = req.study; // Attached by requireStudyAccess middleware
    
    res.json({
      success: true,
      data: study
    });
  });

  // Update study - requires study access and additional permission check
  static updateStudy = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Middleware: authenticateToken + requireStudyAccess
    
    const study = req.study;
    
    // Only owner or admin can update study settings
    if (!isResourceOwner(req.user!, study.createdBy.toString()) && !isAdmin(req.user!)) {
      throw createError.forbidden('Only study owner or admin can update study settings');
    }
    
    Object.assign(study, req.body);
    await study.save();
    
    res.json({
      success: true,
      data: study
    });
  });

  // Delete study - requires ownership or admin
  static deleteStudy = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Middleware: authenticateToken + requireStudyAccess
    
    const study = req.study;
    
    // Only owner or admin can delete
    if (!isResourceOwner(req.user!, study.createdBy.toString()) && !isAdmin(req.user!)) {
      throw createError.forbidden('Only study owner or admin can delete study');
    }
    
    await study.deleteOne();
    
    res.json({
      success: true,
      message: 'Study deleted successfully'
    });
  });
}
```

### 2. Participant Management Controller

```typescript
export class ParticipantController {
  // Get participants for a study
  static getStudyParticipants = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Middleware: authenticateToken + requireResearcher + requireStudyAccess
    
    const { studyId } = req.params;
    
    const participants = await Participant.find({ studyId })
      .populate('userId', 'firstName lastName email')
      .select('-sensitiveData');
    
    res.json({
      success: true,
      data: participants
    });
  });

  // Invite participant to study
  static inviteParticipant = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Middleware: authenticateToken + requireResearcher + requireStudyAccess
    
    const study = req.study;
    const { email, firstName, lastName } = req.body;
    
    // Check subscription limits
    if (!hasSubscriptionFeature(req.user!, 'unlimited_participants')) {
      const participantCount = await Participant.countDocuments({ studyId: study._id });
      if (participantCount >= 50) { // Free tier limit
        throw createError.forbidden('Participant limit reached. Upgrade subscription for more participants');
      }
    }
    
    // Create and send invitation
    const invitation = await createParticipantInvitation(study._id, email, firstName, lastName);
    
    res.json({
      success: true,
      data: invitation
    });
  });
}
```

### 3. Session Management Controller

```typescript
export class SessionController {
  // Start session - requires study access
  static startSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Middleware: authenticateToken + requireResearcher + requireStudyAccess
    
    const { sessionId } = req.params;
    const study = req.study;
    
    const session = await Session.findById(sessionId);
    if (!session || session.studyId.toString() !== study._id.toString()) {
      throw createError.notFound('Session not found');
    }
    
    session.status = 'in_progress';
    session.startedAt = new Date();
    await session.save();
    
    res.json({
      success: true,
      data: session
    });
  });

  // Join session as participant
  static joinSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Middleware: authenticateSessionToken + validateParticipantSession
    
    const session = req.session; // Attached by middleware
    
    // Update session with participant join time
    session.participantJoinedAt = new Date();
    await session.save();
    
    res.json({
      success: true,
      data: {
        sessionId: session._id,
        studyId: session.studyId,
        status: session.status
      }
    });
  });
}
```

---

## Common Scenarios

### 1. Multi-Role Access

```typescript
// Allow both researchers and admins
router.get('/analytics', 
  authenticateToken,
  requireRole(['researcher', 'admin', 'super_admin']),
  getAnalytics
);

// Or use convenience function
router.get('/analytics', 
  authenticateToken,
  requireResearcher, // Includes admin and super_admin
  getAnalytics
);
```

### 2. Conditional Permissions

```typescript
export const getAdvancedAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studyId } = req.params;
  
  // Check study access
  const study = await Study.findById(studyId);
  if (!canAccessStudy(req.user!, study.createdBy.toString(), study.team)) {
    throw createError.forbidden('Study access denied');
  }
  
  // Check subscription for advanced features
  if (!hasSubscriptionFeature(req.user!, 'advanced_analytics')) {
    // Return basic analytics instead
    const basicAnalytics = await generateBasicAnalytics(study);
    return res.json({
      success: true,
      data: basicAnalytics,
      message: 'Upgrade subscription for advanced analytics'
    });
  }
  
  const advancedAnalytics = await generateAdvancedAnalytics(study);
  res.json({
    success: true,
    data: advancedAnalytics
  });
});
```

### 3. Bulk Operations with Permissions

```typescript
export const bulkDeleteParticipants = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { participantIds } = req.body;
  
  // Get all participants and verify access to each
  const participants = await Participant.find({ _id: { $in: participantIds } })
    .populate('studyId');
  
  for (const participant of participants) {
    const study = participant.studyId;
    if (!canAccessStudy(req.user!, study.createdBy.toString(), study.team)) {
      throw createError.forbidden(`Access denied to participant ${participant._id}`);
    }
  }
  
  // Perform bulk deletion
  await Participant.deleteMany({ _id: { $in: participantIds } });
  
  res.json({
    success: true,
    message: `${participants.length} participants deleted`
  });
});
```

### 4. Feature Flag Integration

```typescript
export const getFeatureStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const features = {
    // Basic features available to all authenticated users
    basicAnalytics: true,
    studyCreation: isResearcher(req.user!),
    
    // Subscription-based features
    advancedAnalytics: hasSubscriptionFeature(req.user!, 'advanced_analytics'),
    unlimitedParticipants: hasSubscriptionFeature(req.user!, 'unlimited_participants'),
    teamCollaboration: hasSubscriptionFeature(req.user!, 'team_collaboration'),
    
    // Role-based features
    userManagement: isAdmin(req.user!),
    systemAdmin: hasRole(req.user!, USER_ROLES.SUPER_ADMIN),
    
    // Permission-based features
    exportData: hasPermission(req.user!, PERMISSIONS.ANALYTICS_EXPORT),
    managePayments: hasPermission(req.user!, PERMISSIONS.PAYMENT_PROCESS)
  };
  
  res.json({
    success: true,
    data: features
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Middleware Order
```typescript
// ❌ Wrong order
router.use(requireResearcher);     // This will fail - no user attached yet
router.use(authenticateToken);

// ✅ Correct order
router.use(authenticateToken);     // First authenticate
router.use(requireResearcher);     // Then check role
```

#### 2. Missing Type Assertions
```typescript
// ❌ Type error
const userId = req.user._id.toString(); // _id might be undefined

// ✅ Safe type handling
const userId = req.user?._id?.toString();
if (!userId) {
  throw createError.unauthorized('User not authenticated');
}
```

#### 3. Resource Access Validation
```typescript
// ❌ Insufficient validation
const study = await Study.findById(studyId);
// Missing: check if user can access this study

// ✅ Proper validation
const study = await Study.findById(studyId);
if (!study || !canAccessStudy(req.user!, study.createdBy.toString(), study.team)) {
  throw createError.notFound('Study not found or access denied');
}
```

#### 4. Subscription Check Timing
```typescript
// ❌ Wrong timing
const data = await expensiveOperation(); // Don't do expensive work first
if (!hasActiveSubscription(req.user!)) {
  throw createError.forbidden('Subscription required');
}

// ✅ Check subscription first
if (!hasActiveSubscription(req.user!)) {
  throw createError.forbidden('Subscription required');
}
const data = await expensiveOperation();
```

### Debug Tips

#### 1. Add Logging
```typescript
export const debugPermissions = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('Permission Debug:', {
    userId: req.user?._id,
    role: req.user?.role,
    path: req.path,
    method: req.method,
    subscription: req.user?.subscription?.status
  });
  next();
};
```

#### 2. Permission Test Utility
```typescript
export const testUserPermissions = (user: IUserDocument) => {
  return {
    role: user.role,
    isAdmin: isAdmin(user),
    isResearcher: isResearcher(user),
    hasSubscription: hasActiveSubscription(user),
    permissions: {
      createStudy: hasPermission(user, PERMISSIONS.STUDY_CREATE),
      manageUsers: hasPermission(user, PERMISSIONS.USER_MANAGE_ROLES),
      viewAnalytics: hasPermission(user, PERMISSIONS.ANALYTICS_VIEW_BASIC)
    }
  };
};
```

This developer guide provides practical patterns for implementing the ResearchHub permission system effectively and securely.
