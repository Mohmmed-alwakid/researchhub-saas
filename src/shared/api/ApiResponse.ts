/**
 * PHASE 1: API RESPONSE STANDARDIZATION
 * Implements consistent API response format across all endpoints
 * Requirements Source: docs/requirements/01-PLATFORM_FOUNDATION.md
 */

// Standard API response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string; // Only in development
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Response helper class
export class ApiResponseHelper {
  /**
   * Create a successful API response
   */
  static success<T>(data: T, meta?: Partial<ApiResponse['meta']>): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        version: process.env.API_VERSION || '1.0.0',
        ...meta
      }
    };
  }

  /**
   * Create a paginated successful response
   */
  static successWithPagination<T>(
    data: T, 
    pagination: { page: number; limit: number; total: number }
  ): ApiResponse<T> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        version: process.env.API_VERSION || '1.0.0',
        pagination: {
          ...pagination,
          totalPages
        }
      }
    };
  }

  /**
   * Create an error API response
   */
  static error(
    code: string, 
    message: string, 
    details?: any,
    statusCode?: number
  ): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        stack: process.env.NODE_ENV === 'development' ? new Error().stack : undefined
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        version: process.env.API_VERSION || '1.0.0'
      }
    };
  }

  /**
   * Create validation error response
   */
  static validationError(validationErrors: any): ApiResponse {
    return this.error(
      'VALIDATION_ERROR',
      'Request validation failed',
      validationErrors
    );
  }

  /**
   * Create authentication error response
   */
  static authError(message: string = 'Authentication required'): ApiResponse {
    return this.error(
      'AUTH_ERROR',
      message
    );
  }

  /**
   * Create authorization error response
   */
  static forbiddenError(message: string = 'Insufficient permissions'): ApiResponse {
    return this.error(
      'FORBIDDEN_ERROR',
      message
    );
  }

  /**
   * Create not found error response
   */
  static notFoundError(resource: string = 'Resource'): ApiResponse {
    return this.error(
      'NOT_FOUND_ERROR',
      `${resource} not found`
    );
  }

  /**
   * Create server error response
   */
  static serverError(message: string = 'Internal server error'): ApiResponse {
    return this.error(
      'SERVER_ERROR',
      message
    );
  }
}

// Error codes enum for consistency
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  FORBIDDEN_ERROR: 'FORBIDDEN_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  MAINTENANCE_ERROR: 'MAINTENANCE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  FEATURE_DISABLED_ERROR: 'FEATURE_DISABLED_ERROR'
} as const;

// HTTP status code mappings
export const API_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

// Middleware for standardizing responses
export function standardizeApiResponse(handler: Function) {
  return async (req: any, res: any) => {
    try {
      const result = await handler(req, res);
      
      // If handler already sent a response, don't interfere
      if (res.headersSent) {
        return result;
      }

      // If result is an ApiResponse, send it
      if (result && typeof result === 'object' && 'success' in result) {
        const statusCode = result.success ? API_STATUS_CODES.OK : API_STATUS_CODES.BAD_REQUEST;
        return res.status(statusCode).json(result);
      }

      // If result is raw data, wrap in success response
      if (result !== undefined) {
        return res.status(API_STATUS_CODES.OK).json(
          ApiResponseHelper.success(result)
        );
      }

      // No result, send 204 No Content
      return res.status(API_STATUS_CODES.NO_CONTENT).end();

    } catch (error) {
      console.error('API Handler Error:', error);
      
      // Send standardized error response
      const errorResponse = ApiResponseHelper.serverError(
        process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      );
      
      return res.status(API_STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
  };
}

// Performance tracking middleware
export function trackApiPerformance(req: any, res: any, next: Function) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request ID to request object
  req.requestId = requestId;
  
  // Track response
  const originalJson = res.json;
  res.json = function(data: any) {
    const duration = Date.now() - startTime;
    
    // Log performance data
    console.log(`[API] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${requestId}`);
    
    // Add performance meta to response if it's an ApiResponse
    if (data && typeof data === 'object' && 'meta' in data) {
      data.meta.performance = {
        duration,
        requestId
      };
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

// CORS middleware for consistent headers
export function corsMiddleware(req: any, res: any, next: Function) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
}

// Rate limiting tracking (basic implementation)
const rateLimitStore = new Map();

export function rateLimitMiddleware(maxRequests: number = 100, windowMs: number = 60000) {
  return (req: any, res: any, next: Function) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (!rateLimitStore.has(clientId)) {
      rateLimitStore.set(clientId, []);
    }
    
    const requests = rateLimitStore.get(clientId).filter((time: number) => time > windowStart);
    
    if (requests.length >= maxRequests) {
      const errorResponse = ApiResponseHelper.error(
        API_ERROR_CODES.RATE_LIMIT_ERROR,
        'Too many requests, please try again later'
      );
      return res.status(API_STATUS_CODES.TOO_MANY_REQUESTS).json(errorResponse);
    }
    
    requests.push(now);
    rateLimitStore.set(clientId, requests);
    
    next();
  };
}

export default {
  ApiResponseHelper,
  API_ERROR_CODES,
  API_STATUS_CODES,
  standardizeApiResponse,
  trackApiPerformance,
  corsMiddleware,
  rateLimitMiddleware
};
