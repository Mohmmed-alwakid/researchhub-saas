import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { IUserDocument } from '../../database/models/index.js';
import { User } from '../../database/models/index.js';
import {
  isAdmin,
  isOwnerOrAdmin,
  canAccessStudy,
  hasActiveSubscription,
  hasSubscriptionFeature,
  PERMISSION_ERRORS,
  PERMISSIONS
} from '../utils/permissions.util.js';

// Type for permission values
type PermissionValue = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      // Get user from database
    const user = await User.findById(decoded.userId)
      .select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
      return;
    }

    // Check if user account is active
    if (user.status !== 'active') {
      res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without user
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    const user = await User.findById(decoded.userId)
      .select('-password');

    if (user && user.status === 'active') {
      req.user = user;
    }

    next();

  } catch (error) {
    // Silent fail for optional auth
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Admin authorization middleware
 */
export const requireAdmin = requireRole(['admin', 'super_admin']);

/**
 * Researcher authorization middleware (researcher, admin, or super_admin)
 */
export const requireResearcher = requireRole(['researcher', 'admin', 'super_admin']);

/**
 * Check if user owns the resource or has admin privileges
 */
export const requireOwnershipOrAdmin = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    const userId = req.user._id ? req.user._id.toString() : '';
    const isOwner = userId === resourceUserId;
    const userIsAdmin = isAdmin(req.user);

    if (!isOwner && !userIsAdmin) {
      res.status(403).json({
        success: false,
        message: PERMISSION_ERRORS.OWNER_OR_ADMIN_REQUIRED
      });
      return;
    }

    next();
  };
};

/**
 * Check subscription access for features
 */
export const requireSubscription = (feature?: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    try {
      // Load subscription if not already populated
      if (!req.user.subscription) {
        await req.user.populate('subscription');
      }

      const subscription = req.user.subscription;

      if (!subscription) {
        res.status(403).json({
          success: false,
          message: 'Active subscription required'
        });
        return;
      }      // Check if subscription is active
      const subscriptionData = subscription as { status?: string };
      if (subscriptionData.status !== 'active') {
        res.status(403).json({
          success: false,
          message: 'Active subscription required'
        });
        return;
      }

      // Check specific feature if provided
      if (feature && !(subscription as any).hasFeature(feature)) {
        res.status(403).json({
          success: false,
          message: `Feature '${feature}' not available in current plan`
        });
        return;
      }

      next();

    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify subscription'
      });
    }
  };
};

/**
 * Rate limiting middleware per user
 */
export const rateLimitPerUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next();
      return;
    }    const userId = req.user._id ? req.user._id.toString() : '';
    const now = Date.now();
    const userLimit = userRequests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize user limit
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }

    if (userLimit.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
      return;
    }

    userLimit.count++;
    next();
  };
};

/**
 * API key authentication middleware (for external integrations)
 */
export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        success: false,
        message: 'API key required'
      });
      return;
    }

    // Find user by API key
    const user = await User.findOne({ 'apiKeys.key': apiKey, 'apiKeys.isActive': true })
      .select('-password')
      .populate('subscription');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
      return;
    }

    // Check if user account is active
    if (user.status !== 'active') {
      res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
      return;
    }

    // Update API key last used
    const apiKeyObj = user.apiKeys?.find(key => key.key === apiKey);
    if (apiKeyObj) {
      apiKeyObj.lastUsed = new Date();
      await user.save();
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Session token authentication (for participant sessions)
 */
export const authenticateSessionToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionToken = req.headers['x-session-token'] as string || req.query.sessionToken as string;

    if (!sessionToken) {
      res.status(401).json({
        success: false,
        message: 'Session token required'
      });
      return;
    }

    // Import Session model to avoid circular dependency
    const { Session } = await import('../../database/models/index.js');
    
    const session = await Session.findOne({ sessionToken })
      .populate('studyId')
      .populate('participantId');

    if (!session) {
      res.status(401).json({
        success: false,
        message: 'Invalid session token'
      });
      return;    }    
    // Check if session is active
    if (session.status !== 'in_progress' && session.status !== 'scheduled') {
      res.status(401).json({
        success: false,
        message: 'Session is not active'
      });
      return;
    }    // Attach session to request
    (req as Request & { session: any }).session = session;
    const user = await User.findById(session.participantId);
    req.user = user || undefined;
    next();

  } catch (error) {
    console.error('Session token authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Session authentication failed'
    });
  }
};

// =============================================================================
// ENHANCED PERMISSION MIDDLEWARE
// =============================================================================

/**
 * Check if user has specific permission
 */
export const requirePermission = (permission: PermissionValue) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: PERMISSION_ERRORS.AUTHENTICATION_REQUIRED
      });
      return;
    }

    // Import permission utilities
    import('../utils/permissions.util.js').then(({ hasPermission }) => {
      if (!hasPermission(req.user!, permission)) {
        res.status(403).json({
          success: false,
          message: PERMISSION_ERRORS.PERMISSION_REQUIRED(permission)
        });
        return;
      }
      next();
    }).catch(() => {
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    });
  };
};

/**
 * Check if user has any of the specified permissions
 */
export const requireAnyPermission = (permissions: PermissionValue[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: PERMISSION_ERRORS.AUTHENTICATION_REQUIRED
      });
      return;
    }

    import('../utils/permissions.util.js').then(({ hasAnyPermission }) => {
      if (!hasAnyPermission(req.user!, permissions)) {
        res.status(403).json({
          success: false,
          message: PERMISSION_ERRORS.INSUFFICIENT_PERMISSIONS
        });
        return;
      }
      next();
    }).catch(() => {
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    });
  };
};

/**
 * Enhanced study access middleware - checks ownership, team membership, or admin
 */
export const requireStudyAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: PERMISSION_ERRORS.AUTHENTICATION_REQUIRED
    });
    return;
  }

  try {
    const studyId = req.params.studyId || req.params.id || req.body.studyId;

    if (!studyId) {
      res.status(400).json({
        success: false,
        message: 'Study ID required'
      });
      return;
    }

    // Import Study model
    const { Study } = await import('../../database/models/index.js');
    const study = await Study.findById(studyId);

    if (!study) {
      res.status(404).json({
        success: false,
        message: PERMISSION_ERRORS.RESOURCE_NOT_FOUND
      });
      return;
    }

    if (!canAccessStudy(req.user, study.createdBy.toString(), study.team?.map((id: any) => id.toString()))) {
      res.status(403).json({
        success: false,
        message: PERMISSION_ERRORS.STUDY_ACCESS_DENIED
      });
      return;
    }

    // Attach study to request for use in controller
    (req as Request & { study: any }).study = study;
    next();

  } catch (error) {
    console.error('Study access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify study access'
    });
  }
};

/**
 * Enhanced subscription middleware with better error messages
 */
export const requireActiveSubscription = (feature?: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: PERMISSION_ERRORS.AUTHENTICATION_REQUIRED
      });
      return;
    }

    try {
      // Load subscription if not already populated
      if (!req.user.subscription) {
        await req.user.populate('subscription');
      }

      if (!hasActiveSubscription(req.user)) {
        res.status(403).json({
          success: false,
          message: PERMISSION_ERRORS.SUBSCRIPTION_REQUIRED
        });
        return;
      }

      // Check specific feature if provided
      if (feature && !hasSubscriptionFeature(req.user, feature)) {
        res.status(403).json({
          success: false,
          message: PERMISSION_ERRORS.FEATURE_NOT_AVAILABLE(feature)
        });
        return;
      }

      next();

    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify subscription'
      });
    }
  };
};

/**
 * Resource ownership validation with better type safety
 */
export const requireResourceOwnership = (
  resourceType: string,
  resourceIdField: string = 'id',
  userIdField: string = 'createdBy'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: PERMISSION_ERRORS.AUTHENTICATION_REQUIRED
      });
      return;
    }

    try {
      const resourceId = req.params[resourceIdField] || req.body[resourceIdField];

      if (!resourceId) {
        res.status(400).json({
          success: false,
          message: `${resourceType} ID required`
        });
        return;
      }

      // Dynamic model import based on resource type
      const models = await import('../../database/models/index.js');
      const ModelName = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
      const Model = (models as any)[ModelName];

      if (!Model) {
        res.status(500).json({
          success: false,
          message: `Invalid resource type: ${resourceType}`
        });
        return;
      }

      const resource = await Model.findById(resourceId);

      if (!resource) {
        res.status(404).json({
          success: false,
          message: PERMISSION_ERRORS.RESOURCE_NOT_FOUND
        });
        return;
      }

      const resourceOwnerId = resource[userIdField]?.toString();
      const userId = req.user._id?.toString();

      if (!isOwnerOrAdmin(req.user, resourceOwnerId)) {
        res.status(403).json({
          success: false,
          message: PERMISSION_ERRORS.OWNER_OR_ADMIN_REQUIRED
        });
        return;
      }

      // Attach resource to request
      (req as any)[resourceType] = resource;
      next();

    } catch (error) {
      console.error(`${resourceType} ownership check error:`, error);
      res.status(500).json({
        success: false,
        message: `Failed to verify ${resourceType} ownership`
      });
    }
  };
};

/**
 * Participant session validation
 */
export const validateParticipantSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.params.sessionId || req.body.sessionId;

    if (!sessionId) {
      res.status(400).json({
        success: false,
        message: 'Session ID required'
      });
      return;
    }

    const { Session } = await import('../../database/models/index.js');
    const session = await Session.findById(sessionId)
      .populate('studyId')
      .populate('participantId');

    if (!session) {
      res.status(404).json({
        success: false,
        message: PERMISSION_ERRORS.RESOURCE_NOT_FOUND
      });
      return;
    }

    // Check if user is the participant for this session
    if (req.user && session.participantId._id.toString() !== req.user._id?.toString()) {
      res.status(403).json({
        success: false,
        message: PERMISSION_ERRORS.ACCESS_DENIED
      });
      return;
    }

    // Attach session to request
    (req as Request & { session: any }).session = session;
    next();

  } catch (error) {
    console.error('Participant session validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate participant session'
    });
  }
};
