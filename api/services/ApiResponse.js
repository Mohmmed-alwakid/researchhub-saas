/**
 * PHASE 1: API RESPONSE HELPER (JavaScript version)
 * Standardized API response format for consistency
 * Requirements Source: docs/requirements/01-PLATFORM_FOUNDATION.md
 */

/**
 * Standardized API Response Helper
 */
export class ApiResponseHelper {
  /**
   * Success response
   */
  static success(data = null, message = null) {
    return {
      success: true,
      data,
      message,
      error: null,
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Error response
   */
  static error(errorCode, message, details = null) {
    return {
      success: false,
      data: null,
      message,
      error: {
        code: errorCode,
        details
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Validation error response
   */
  static validationError(details = null) {
    return this.error(
      'VALIDATION_ERROR',
      'The provided data is invalid',
      details
    );
  }

  /**
   * Not found error response
   */
  static notFoundError(resource = 'Resource') {
    return this.error(
      'NOT_FOUND',
      `${resource} not found`
    );
  }

  /**
   * Authentication error response
   */
  static authError() {
    return this.error(
      'AUTHENTICATION_ERROR',
      'Authentication required'
    );
  }

  /**
   * Authorization error response
   */
  static forbiddenError() {
    return this.error(
      'FORBIDDEN',
      'You do not have permission to perform this action'
    );
  }

  /**
   * Server error response
   */
  static serverError(message = 'Internal server error') {
    return this.error(
      'INTERNAL_SERVER_ERROR',
      message
    );
  }
}

/**
 * CORS middleware
 */
export function corsMiddleware(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

/**
 * Basic authentication token validation (placeholder)
 */
export async function validateAuthToken(req) {
  // For development, return a mock user
  // In production, this would validate JWT tokens
  return {
    success: true,
    user: {
      id: 'mock-user-id',
      email: 'test@example.com',
      role: 'researcher',
      organization_id: 'mock-org-id'
    }
  };
}

/**
 * Input sanitization (basic implementation)
 */
export function sanitizeInput(data) {
  if (typeof data === 'string') {
    return data.trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Rate limiting middleware (basic implementation)
 */
export async function rateLimitMiddleware(req) {
  // Basic rate limiting - in production, use Redis or similar
  return {
    allowed: true,
    retryAfter: null
  };
}

export default {
  ApiResponseHelper,
  corsMiddleware,
  validateAuthToken,
  sanitizeInput,
  rateLimitMiddleware
};
