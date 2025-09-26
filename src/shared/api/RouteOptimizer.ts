import { ApiClient, ApiRequest, ApiResponse } from './ApiClient';
import { ResponseOptimizer, ResponseConfig } from './ResponseOptimizer';


/**
 * API Route Optimization - Intelligent route management and optimization
 * Part of the Vibe-Coder-MCP implementation for ResearchHub
 * 
 * Features:
 * - Route caching and prefetching
 * - Request batching and optimization
 * - Middleware pipeline for request/response processing
 * - Performance monitoring per route
 * - Automatic retry and circuit breaker patterns
 */

export interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  cache?: {
    enabled: boolean;
    ttl: number;
    strategy: 'memory' | 'localStorage' | 'sessionStorage';
  };
  retry?: {
    enabled: boolean;
    attempts: number;
    backoff: 'linear' | 'exponential';
    delay: number;
  };
  timeout?: number;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  circuitBreaker?: {
    enabled: boolean;
    threshold: number;
    timeout: number;
  };
  batch?: {
    enabled: boolean;
    maxSize: number;
    flushInterval: number;
  };
  prefetch?: boolean;
  middleware?: RouteMiddleware[];
  validation?: {
    request?: (data: unknown) => boolean;
    response?: (data: unknown) => boolean;
  };
}

export interface RouteMiddleware {
  name: string;
  before?: (request: ApiRequest) => Promise<ApiRequest | null>;
  after?: (response: ApiResponse, request: ApiRequest) => Promise<ApiResponse>;
  error?: (error: Error, request: ApiRequest) => Promise<Error | null>;
}

export interface BatchRequest {
  id: string;
  request: ApiRequest;
  resolve: (response: ApiResponse) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
  nextAttempt: number;
}

export interface RouteMetrics {
  path: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  lastError?: string;
  lastSuccess?: Date;
  circuitBreakerState?: CircuitBreakerState;
}

/**
 * Advanced route optimization and management
 */
export class RouteOptimizer {
  private routes: Map<string, RouteConfig>;
  private apiClient: ApiClient;
  private responseOptimizer: ResponseOptimizer;
  private batchQueues: Map<string, BatchRequest[]>;
  private batchTimers: Map<string, NodeJS.Timeout>;
  private circuitBreakers: Map<string, CircuitBreakerState>;
  private routeMetrics: Map<string, RouteMetrics>;
  private rateLimits: Map<string, { count: number; resetTime: number }>;
  private middleware: RouteMiddleware[];

  constructor(apiClient: ApiClient, responseOptimizer: ResponseOptimizer) {
    this.routes = new Map();
    this.apiClient = apiClient;
    this.responseOptimizer = responseOptimizer;
    this.batchQueues = new Map();
    this.batchTimers = new Map();
    this.circuitBreakers = new Map();
    this.routeMetrics = new Map();
    this.rateLimits = new Map();
    this.middleware = [];

    this.setupDefaultRoutes();
    this.setupMetricsTracking();
  }

  /**
   * Register a route with optimization configuration
   */
  registerRoute(config: RouteConfig): void {
    const routeKey = `${config.method}:${config.path}`;
    this.routes.set(routeKey, config);

    // Initialize metrics
    this.routeMetrics.set(routeKey, {
      path: config.path,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0
    });

    // Initialize circuit breaker if enabled
    if (config.circuitBreaker?.enabled) {
      this.circuitBreakers.set(routeKey, {
        failures: 0,
        lastFailure: 0,
        state: 'closed',
        nextAttempt: 0
      });
    }
  }

  /**
   * Add global middleware
   */
  addMiddleware(middleware: RouteMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Execute optimized API request
   */
  async request<T = unknown>(request: ApiRequest): Promise<ApiResponse<T>> {
    const routeKey = `${request.method}:${request.url}`;
    const config = this.routes.get(routeKey);
    const startTime = Date.now();

    try {
      // Check circuit breaker
      if (config?.circuitBreaker?.enabled && !this.canMakeRequest(routeKey)) {
        throw new Error('Circuit breaker is open');
      }

      // Check rate limit
      if (config?.rateLimit && !this.checkRateLimit(routeKey, config.rateLimit)) {
        throw new Error('Rate limit exceeded');
      }

      // Apply middleware transformations
      let processedRequest = request;
      const allMiddleware = [...this.middleware, ...(config?.middleware || [])];
      
      for (const middleware of allMiddleware) {
        if (middleware.before) {
          const result = await middleware.before(processedRequest);
          if (result === null) {
            throw new Error(`Request blocked by middleware: ${middleware.name}`);
          }
          processedRequest = result;
        }
      }

      // Handle batching if enabled
      if (config?.batch?.enabled && request.method === 'GET') {
        return await this.handleBatchRequest<T>(routeKey, processedRequest, config);
      }

      // Make the actual request
      let response: ApiResponse<T>;
      
      if (config?.cache?.enabled) {
        // Use response optimizer for caching
        const responseConfig: ResponseConfig = {
          cache: {
            type: config.cache.strategy,
            ttl: config.cache.ttl
          }
        };
        
        const rawResponse = await this.apiClient.request<T>(processedRequest);
        const optimizedResponse = await this.responseOptimizer.processResponse(
          new Response(), // Dummy response for optimizer
          rawResponse.data,
          responseConfig
        );
        
        response = {
          ...rawResponse,
          data: optimizedResponse.data as T,
          cached: optimizedResponse.metadata.cached
        };
      } else {
        response = await this.apiClient.request<T>(processedRequest);
      }

      // Apply after middleware
      let processedResponse = response;
      for (const middleware of allMiddleware.reverse()) {
        if (middleware.after) {
          processedResponse = await middleware.after(processedResponse, processedRequest) as ApiResponse<T>;
        }
      }

      // Update metrics
      this.updateMetrics(routeKey, true, Date.now() - startTime, processedResponse.cached);
      
      // Reset circuit breaker on success
      if (config?.circuitBreaker?.enabled) {
        this.resetCircuitBreaker(routeKey);
      }

      return processedResponse;

    } catch (error) {
      // Apply error middleware
      let processedError = error as Error;
      const allMiddleware = [...this.middleware, ...(config?.middleware || [])];
      
      for (const middleware of allMiddleware) {
        if (middleware.error) {
          const result = await middleware.error(processedError, request);
          if (result === null) {
            // Error was handled, don't throw
            return this.createErrorResponse<T>(processedError, request);
          }
          processedError = result;
        }
      }

      // Update metrics
      this.updateMetrics(routeKey, false, Date.now() - startTime, false);
      
      // Update circuit breaker on failure
      if (config?.circuitBreaker?.enabled) {
        this.recordFailure(routeKey, config.circuitBreaker);
      }

      throw processedError;
    }
  }

  /**
   * Prefetch routes that are likely to be needed
   */
  async prefetchRoutes(paths: string[]): Promise<void> {
    const prefetchPromises = paths.map(async (path) => {
      const routeKey = `GET:${path}`;
      const config = this.routes.get(routeKey);
      
      if (config?.prefetch) {
        try {
          await this.request({ url: path, method: 'GET' });
        } catch (error) {
          // Ignore prefetch errors
          console.warn(`Prefetch failed for ${path}:`, error);
        }
      }
    });

    await Promise.allSettled(prefetchPromises);
  }

  /**
   * Handle batch requests
   */
  private async handleBatchRequest<T>(
    routeKey: string,
    request: ApiRequest,
    config: RouteConfig
  ): Promise<ApiResponse<T>> {
    return new Promise<ApiResponse<T>>((resolve, reject) => {
      const batchRequest: BatchRequest = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        request,
        resolve: resolve as (response: ApiResponse) => void,
        reject,
        timestamp: Date.now()
      };

      // Add to batch queue
      if (!this.batchQueues.has(routeKey)) {
        this.batchQueues.set(routeKey, []);
      }
      
      const queue = this.batchQueues.get(routeKey)!;
      queue.push(batchRequest);

      // Process batch if it's full
      if (queue.length >= (config.batch!.maxSize || 10)) {
        this.processBatch(routeKey, config);
      } else {
        // Set timer to flush batch after interval
        if (!this.batchTimers.has(routeKey)) {
          const timer = setTimeout(() => {
            this.processBatch(routeKey, config);
          }, config.batch!.flushInterval || 100);
          
          this.batchTimers.set(routeKey, timer);
        }
      }
    });
  }

  /**
   * Process batch of requests
   */
  private async processBatch(routeKey: string, _config: RouteConfig): Promise<void> {
    const queue = this.batchQueues.get(routeKey);
    if (!queue || queue.length === 0) return;

    // Clear the queue and timer
    this.batchQueues.set(routeKey, []);
    const timer = this.batchTimers.get(routeKey);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(routeKey);
    }

    // Process each request in the batch
    const batchPromises = queue.map(async (batchRequest) => {
      try {
        const response = await this.apiClient.request(batchRequest.request);
        batchRequest.resolve(response);
      } catch (error) {
        batchRequest.reject(error as Error);
      }
    });

    await Promise.allSettled(batchPromises);
  }

  /**
   * Check if request can be made (circuit breaker)
   */
  private canMakeRequest(routeKey: string): boolean {
    const breaker = this.circuitBreakers.get(routeKey);
    if (!breaker) return true;

    const now = Date.now();

    switch (breaker.state) {
      case 'closed':
        return true;
      
      case 'open':
        if (now >= breaker.nextAttempt) {
          breaker.state = 'half-open';
          return true;
        }
        return false;
      
      case 'half-open':
        return true;
      
      default:
        return true;
    }
  }

  /**
   * Record failure for circuit breaker
   */
  private recordFailure(routeKey: string, config: NonNullable<RouteConfig['circuitBreaker']>): void {
    const breaker = this.circuitBreakers.get(routeKey);
    if (!breaker) return;

    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= config.threshold) {
      breaker.state = 'open';
      breaker.nextAttempt = Date.now() + config.timeout;
    }
  }

  /**
   * Reset circuit breaker on success
   */
  private resetCircuitBreaker(routeKey: string): void {
    const breaker = this.circuitBreakers.get(routeKey);
    if (!breaker) return;

    breaker.failures = 0;
    breaker.state = 'closed';
  }

  /**
   * Check rate limit
   */
  private checkRateLimit(routeKey: string, config: NonNullable<RouteConfig['rateLimit']>): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(routeKey);

    if (!limit || now >= limit.resetTime) {
      // Reset or initialize rate limit
      this.rateLimits.set(routeKey, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    if (limit.count >= config.maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  /**
   * Update route metrics
   */
  private updateMetrics(
    routeKey: string, 
    success: boolean, 
    duration: number, 
    cached: boolean
  ): void {
    const metrics = this.routeMetrics.get(routeKey);
    if (!metrics) return;

    metrics.totalRequests++;
    
    if (success) {
      metrics.successfulRequests++;
      metrics.lastSuccess = new Date();
    } else {
      metrics.failedRequests++;
    }

    // Update average response time
    const totalTime = metrics.averageResponseTime * (metrics.totalRequests - 1) + duration;
    metrics.averageResponseTime = totalTime / metrics.totalRequests;

    // Update cache hit rate
    if (cached) {
      const totalHits = metrics.cacheHitRate * (metrics.totalRequests - 1) + 1;
      metrics.cacheHitRate = totalHits / metrics.totalRequests;
    } else {
      metrics.cacheHitRate = (metrics.cacheHitRate * (metrics.totalRequests - 1)) / metrics.totalRequests;
    }
  }

  /**
   * Create error response
   */
  private createErrorResponse<T>(_error: Error, _request: ApiRequest): ApiResponse<T> {
    return {
      data: null as T,
      status: 500,
      headers: {},
      cached: false,
      timing: {
        start: Date.now(),
        end: Date.now(),
        duration: 0
      },
      retryCount: 0
    };
  }

  /**
   * Setup default route configurations
   */
  private setupDefaultRoutes(): void {
    // Studies routes
    this.registerRoute({
      path: '/api/studies',
      method: 'GET',
      cache: { enabled: true, ttl: 300000, strategy: 'memory' },
      retry: { enabled: true, attempts: 3, backoff: 'exponential', delay: 1000 },
      rateLimit: { maxRequests: 100, windowMs: 60000 },
      prefetch: true
    });

    this.registerRoute({
      path: '/api/studies/:id',
      method: 'GET',
      cache: { enabled: true, ttl: 600000, strategy: 'memory' },
      retry: { enabled: true, attempts: 2, backoff: 'linear', delay: 500 }
    });

    // Applications routes
    this.registerRoute({
      path: '/api/applications',
      method: 'GET',
      cache: { enabled: true, ttl: 60000, strategy: 'memory' },
      batch: { enabled: true, maxSize: 5, flushInterval: 100 }
    });

    // User profile routes
    this.registerRoute({
      path: '/api/profile',
      method: 'GET',
      cache: { enabled: true, ttl: 300000, strategy: 'localStorage' },
      circuitBreaker: { enabled: true, threshold: 5, timeout: 30000 }
    });
  }

  /**
   * Setup metrics tracking
   */
  private setupMetricsTracking(): void {
    setInterval(() => {
      const allMetrics = Array.from(this.routeMetrics.values());
      const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
      const avgResponseTime = allMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / allMetrics.length;
      const avgCacheHitRate = allMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / allMetrics.length;

      console.log(`Route Metrics: ${totalRequests} requests, ${avgResponseTime.toFixed(0)}ms avg, ${(avgCacheHitRate * 100).toFixed(1)}% cache hit rate`);
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get route metrics
   */
  getRouteMetrics(path?: string): RouteMetrics | RouteMetrics[] {
    if (path) {
      const metrics = Array.from(this.routeMetrics.values()).find(m => m.path === path);
      return metrics || {
        path,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        cacheHitRate: 0
      };
    }

    return Array.from(this.routeMetrics.values());
  }

  /**
   * Clear all route caches
   */
  clearRouteCache(path?: string): void {
    this.responseOptimizer.clearCache();
    
    if (path) {
      // Clear specific route cache
      const routeKey = `GET:${path}`;
      this.batchQueues.delete(routeKey);
      const timer = this.batchTimers.get(routeKey);
      if (timer) {
        clearTimeout(timer);
        this.batchTimers.delete(routeKey);
      }
    } else {
      // Clear all route caches
      this.batchQueues.clear();
      this.batchTimers.forEach(timer => clearTimeout(timer));
      this.batchTimers.clear();
    }
  }
}

// Export singleton instance
export const routeOptimizer = new RouteOptimizer(
  new ApiClient(),
  new ResponseOptimizer()
);
