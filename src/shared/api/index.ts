import { ApiClient } from './ApiClient';
import { routeOptimizer } from './RouteOptimizer';
import type { ApiRequest, ApiResponse } from './ApiClient';


/**
 * API Optimization Module - Centralized exports for ResearchHub API optimization
 * Part of the Vibe-Coder-MCP implementation
 * 
 * This module provides comprehensive API optimization features including:
 * - Enhanced HTTP client with automatic retries and caching
 * - Response optimization with multiple caching strategies
 * - Route optimization with batching and circuit breakers
 * - Performance monitoring and metrics
 * - Security integration and validation
 */

// Core API Client
export {
  ApiClient,
  apiClient,
  type ApiConfig,
  type ApiRequest,
  type ApiResponse,
  type ApiError
} from './ApiClient';

// Response Optimization
export {
  ResponseOptimizer,
  responseOptimizer,
  type ResponseTransform,
  type CacheStrategy,
  type ResponseValidator,
  type ResponseMetadata,
  type OptimizedResponse,
  type ResponseConfig
} from './ResponseOptimizer';

// Route Optimization
export {
  RouteOptimizer,
  routeOptimizer,
  type RouteConfig,
  type RouteMiddleware,
  type BatchRequest,
  type CircuitBreakerState,
  type RouteMetrics
} from './RouteOptimizer';

// Import for internal use
/**
 * Default API optimization configuration for ResearchHub
 */
export const DEFAULT_API_CONFIG = {
  baseUrl: '/api', // Use Vite proxy for all environments
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  cacheEnabled: true,
  cacheTtl: 300000, // 5 minutes
  enableMetrics: true,
  securityEnabled: true
} as const;

/**
 * ResearchHub-specific API endpoints configuration
 */
export const RESEARCHHUB_ROUTES = {
  // Authentication
  auth: {
    login: { path: '/auth', method: 'POST' as const },
    logout: { path: '/auth/logout', method: 'POST' as const },
    refresh: { path: '/auth/refresh', method: 'POST' as const },
    profile: { path: '/auth/profile', method: 'GET' as const }
  },

  // Studies
  studies: {
    list: { path: '/studies', method: 'GET' as const },
    create: { path: '/studies', method: 'POST' as const },
    get: { path: '/studies/:id', method: 'GET' as const },
    update: { path: '/studies/:id', method: 'PUT' as const },
    delete: { path: '/studies/:id', method: 'DELETE' as const },
    publish: { path: '/studies/:id/publish', method: 'POST' as const },
    unpublish: { path: '/studies/:id/unpublish', method: 'POST' as const }
  },

  // Study Blocks
  blocks: {
    list: { path: '/studies/:studyId/blocks', method: 'GET' as const },
    create: { path: '/studies/:studyId/blocks', method: 'POST' as const },
    update: { path: '/studies/:studyId/blocks/:blockId', method: 'PUT' as const },
    delete: { path: '/studies/:studyId/blocks/:blockId', method: 'DELETE' as const },
    reorder: { path: '/studies/:studyId/blocks/reorder', method: 'POST' as const }
  },

  // Applications
  applications: {
    list: { path: '/applications', method: 'GET' as const },
    create: { path: '/applications', method: 'POST' as const },
    get: { path: '/applications/:id', method: 'GET' as const },
    approve: { path: '/applications/:id/approve', method: 'POST' as const },
    reject: { path: '/applications/:id/reject', method: 'POST' as const }
  },

  // Sessions
  sessions: {
    create: { path: '/sessions', method: 'POST' as const },
    get: { path: '/sessions/:id', method: 'GET' as const },
    update: { path: '/sessions/:id', method: 'PUT' as const },
    complete: { path: '/sessions/:id/complete', method: 'POST' as const }
  },

  // Templates
  templates: {
    list: { path: '/templates', method: 'GET' as const },
    get: { path: '/templates/:id', method: 'GET' as const },
    create: { path: '/templates', method: 'POST' as const }
  },

  // Admin
  admin: {
    users: { path: '/admin/users', method: 'GET' as const },
    analytics: { path: '/admin/analytics', method: 'GET' as const },
    settings: { path: '/admin/settings', method: 'GET' as const }
  }
} as const;

/**
 * Common middleware for ResearchHub API requests
 */
export const RESEARCHHUB_MIDDLEWARE = {
  /**
   * Authentication middleware - adds auth headers
   */
  auth: {
    name: 'auth',
    before: async (request: ApiRequest) => {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (token) {
        request.headers = {
          ...request.headers,
          'Authorization': `Bearer ${token}`
        };
      }
      return request;
    }
  },

  /**
   * Request ID middleware - adds unique request ID for tracking
   */
  requestId: {
    name: 'requestId',
    before: async (request: ApiRequest) => {
      request.headers = {
        ...request.headers,
        'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      return request;
    }
  },

  /**
   * Timing middleware - logs request timing
   */
  timing: {
    name: 'timing',
    before: async (request: ApiRequest & { _startTime?: number }) => {
      const extendedRequest = request as ApiRequest & { _startTime?: number };
      extendedRequest._startTime = Date.now();
      return request;
    },
    after: async (response: ApiResponse, request: ApiRequest & { _startTime?: number }) => {
      const extendedRequest = request as ApiRequest & { _startTime?: number };
      if (extendedRequest._startTime) {
        const duration = Date.now() - extendedRequest._startTime;
        console.log(`API Request: ${request.method} ${request.url} - ${duration}ms`);
      }
      return response;
    }
  },

  /**
   * Error logging middleware
   */
  errorLogging: {
    name: 'errorLogging',
    error: async (error: Error, request: ApiRequest) => {
      console.error(`API Error: ${request.method} ${request.url}`, {
        error: error.message,
        request: {
          url: request.url,
          method: request.method,
          headers: request.headers
        }
      });
      return error;
    }
  }
} as const;

/**
 * Optimized API client instance configured for ResearchHub
 */
export const optimizedApiClient = new ApiClient(DEFAULT_API_CONFIG);

/**
 * Initialize API optimization for ResearchHub
 * Call this during app initialization
 */
export function initializeApiOptimization(): void {
  // Add global middleware
  Object.values(RESEARCHHUB_MIDDLEWARE).forEach(middleware => {
    routeOptimizer.addMiddleware(middleware);
  });

  // Register optimized routes
  Object.values(RESEARCHHUB_ROUTES).forEach(routeGroup => {
    Object.values(routeGroup).forEach(route => {
      routeOptimizer.registerRoute({
        path: route.path,
        method: route.method,
        cache: getRouteCacheConfig(route.path, route.method),
        retry: getRouteRetryConfig(route.path, route.method),
        circuitBreaker: getRouteCircuitBreakerConfig(route.path, route.method),
        rateLimit: getRouteRateLimitConfig(route.path, route.method)
      });
    });
  });

  console.log('API optimization initialized for ResearchHub');
}

/**
 * Get cache configuration for specific route
 */
function getRouteCacheConfig(path: string, method: string) {
  // Only cache GET requests
  if (method !== 'GET') return undefined;

  // Long cache for templates and static data
  if (path.includes('/templates')) {
    return { enabled: true, ttl: 600000, strategy: 'localStorage' as const };
  }

  // Medium cache for studies and applications
  if (path.includes('/studies') || path.includes('/applications')) {
    return { enabled: true, ttl: 300000, strategy: 'memory' as const };
  }

  // Short cache for user data
  if (path.includes('/profile') || path.includes('/auth')) {
    return { enabled: true, ttl: 60000, strategy: 'sessionStorage' as const };
  }

  // Default cache
  return { enabled: true, ttl: 180000, strategy: 'memory' as const };
}

/**
 * Get retry configuration for specific route
 */
function getRouteRetryConfig(path: string, method: string) {
  // No retries for POST/PUT/DELETE operations
  if (method !== 'GET') {
    return { enabled: false, attempts: 0, backoff: 'linear' as const, delay: 0 };
  }

  // Higher retries for critical data
  if (path.includes('/studies') || path.includes('/applications')) {
    return { enabled: true, attempts: 3, backoff: 'exponential' as const, delay: 1000 };
  }

  // Standard retries for other GET requests
  return { enabled: true, attempts: 2, backoff: 'linear' as const, delay: 500 };
}

/**
 * Get circuit breaker configuration for specific route
 */
function getRouteCircuitBreakerConfig(path: string, _method: string) {
  // Enable circuit breaker for external or critical endpoints
  if (path.includes('/admin') || path.includes('/analytics')) {
    return { enabled: true, threshold: 5, timeout: 30000 };
  }

  // Disable for most endpoints
  return undefined;
}

/**
 * Get rate limit configuration for specific route
 */
function getRouteRateLimitConfig(path: string, method: string) {
  // Strict rate limiting for admin endpoints
  if (path.includes('/admin')) {
    return { maxRequests: 10, windowMs: 60000 };
  }

  // Moderate rate limiting for API calls
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    return { maxRequests: 30, windowMs: 60000 };
  }

  // Generous rate limiting for GET requests
  return { maxRequests: 100, windowMs: 60000 };
}

/**
 * Utility function to build URL with parameters
 */
export function buildApiUrl(path: string, params: Record<string, string | number> = {}): string {
  let url = path;
  
  // Replace path parameters
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });

  return url;
}

/**
 * Utility function for ResearchHub API calls
 */
export const api = {
  // Studies
  studies: {
    list: () => routeOptimizer.request({ url: '/studies', method: 'GET' }),
    get: (id: string) => routeOptimizer.request({ url: `/studies/${id}`, method: 'GET' }),
    create: (data: unknown) => routeOptimizer.request({ url: '/studies', method: 'POST', body: data }),
    update: (id: string, data: unknown) => routeOptimizer.request({ url: `/studies/${id}`, method: 'PUT', body: data }),
    delete: (id: string) => routeOptimizer.request({ url: `/studies/${id}`, method: 'DELETE' })
  },

  // Applications
  applications: {
    list: () => routeOptimizer.request({ url: '/applications', method: 'GET' }),
    create: (data: unknown) => routeOptimizer.request({ url: '/applications', method: 'POST', body: data }),
    approve: (id: string) => routeOptimizer.request({ url: `/applications/${id}/approve`, method: 'POST' })
  },

  // Auth
  auth: {
    login: (credentials: unknown) => routeOptimizer.request({ url: '/auth', method: 'POST', body: credentials }),
    profile: () => routeOptimizer.request({ url: '/auth/profile', method: 'GET' }),
    refresh: () => routeOptimizer.request({ url: '/auth/refresh', method: 'POST' })
  }
};

/**
 * Performance monitoring utilities
 */
export const apiMonitoring = {
  getMetrics: () => routeOptimizer.getRouteMetrics(),
  clearCache: () => routeOptimizer.clearRouteCache(),
  getClientMetrics: () => optimizedApiClient.getMetrics()
};
