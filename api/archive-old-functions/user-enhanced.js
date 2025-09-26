import { corsMiddleware, validateAuthToken, sanitizeInput, rateLimitMiddleware } from './services/ApiResponse.js';

import { createUserService, createSystemService } from './services/BaseService.js';

/**
 * PHASE 1: ENHANCED USER API ENDPOINT
 * Modern API endpoint using service layer architecture
 * Requirements Source: docs/requirements/01-PLATFORM_FOUNDATION.md
 */

/**
 * Enhanced User Management API
 * Supports: GET (profile), PUT (update profile), POST (user actions)
 */
export default async function handler(req, res) {
  // Apply CORS middleware
  corsMiddleware(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const startTime = Date.now();

  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: rateLimitResult.retryAfter
      });
    }

    // Validate authentication for protected routes
    const authResult = await validateAuthToken(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Valid authentication token required'
      });
    }

    // Extract service context
    const serviceContext = {
      userId: authResult.user.id,
      organizationId: authResult.user.organization_id,
      userRole: authResult.user.role,
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    // Create service instances
    const userService = createUserService(serviceContext);
    const systemService = createSystemService(serviceContext);

    // Route handling
    switch (req.method) {
      case 'GET':
        return await handleGetUser(req, res, userService, startTime);
      
      case 'PUT':
        return await handleUpdateProfile(req, res, userService, startTime);
      
      case 'POST':
        return await handleUserActions(req, res, userService, systemService, startTime);
      
      default:
        return res.status(405).json({
          success: false,
          error: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} not allowed`,
          meta: {
            allowedMethods: ['GET', 'PUT', 'POST'],
            processingTime: Date.now() - startTime
          }
        });
    }

  } catch (error) {
    console.error('User API error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An internal server error occurred',
      meta: {
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    });
  }
}

/**
 * Handle GET /api/user-enhanced - Get user profile
 */
async function handleGetUser(req, res, userService, startTime) {
  const { action } = req.query;

  try {
    switch (action) {
      case 'profile':
      case undefined: // Default action
        const result = await userService.getUserWithProfile(req.user.id);
        
        return res.status(result.success ? 200 : 400).json({
          ...result,
          meta: {
            processingTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
          }
        });

      case 'organizations':
        // This would be handled by organization service
        return res.status(501).json({
          success: false,
          error: 'NOT_IMPLEMENTED',
          message: 'Organization listing not yet implemented'
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'INVALID_ACTION',
          message: `Unknown action: ${action}`,
          meta: {
            validActions: ['profile', 'organizations'],
            processingTime: Date.now() - startTime
          }
        });
    }
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: 'PROFILE_FETCH_ERROR',
      message: 'Failed to fetch user profile'
    });
  }
}

/**
 * Handle PUT /api/user-enhanced - Update user profile
 */
async function handleUpdateProfile(req, res, userService, startTime) {
  try {
    // Sanitize input data
    const profileData = sanitizeInput(req.body);
    
    // Validate required fields
    if (!profileData || typeof profileData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Profile data must be a valid object'
      });
    }

    // Update profile using service
    const result = await userService.updateProfile(req.user.id, profileData);
    
    // Update last activity
    await userService.updateLastActivity(req.user.id);
    
    return res.status(result.success ? 200 : 400).json({
      ...result,
      meta: {
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'PROFILE_UPDATE_ERROR',
      message: 'Failed to update user profile'
    });
  }
}

/**
 * Handle POST /api/user-enhanced - User actions
 */
async function handleUserActions(req, res, userService, systemService, startTime) {
  const { action } = req.body;

  try {
    switch (action) {
      case 'ping':
        // Simple health check action
        await userService.updateLastActivity(req.user.id);
        
        return res.status(200).json({
          success: true,
          data: {
            userId: req.user.id,
            timestamp: new Date().toISOString(),
            status: 'active'
          },
          meta: {
            processingTime: Date.now() - startTime
          }
        });

      case 'health_check':
        // System health check
        const healthResult = await systemService.getSystemHealth();
        
        return res.status(healthResult.success ? 200 : 500).json({
          ...healthResult,
          meta: {
            processingTime: Date.now() - startTime,
            requestedBy: req.user.id
          }
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'INVALID_ACTION',
          message: `Unknown action: ${action}`,
          meta: {
            validActions: ['ping', 'health_check'],
            processingTime: Date.now() - startTime
          }
        });
    }
  } catch (error) {
    console.error('User action error:', error);
    return res.status(500).json({
      success: false,
      error: 'ACTION_ERROR',
      message: 'Failed to execute user action'
    });
  }
}

/**
 * Development helper: Export functions for testing
 */
export {
  handleGetUser,
  handleUpdateProfile,
  handleUserActions
};
