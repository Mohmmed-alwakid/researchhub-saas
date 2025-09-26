import { SecurityManager } from '../security/SecurityManager';


/**
 * Enhanced API Client for ResearchHub
 * Provides optimized HTTP communication with advanced features
 * 
 * Features:
 * - Request/Response optimization
 * - Automatic retries and backoff
 * - Request caching
 * - Type-safe API calls
 * - Error handling and recovery
 * - Performance monitoring
 * - Security integration
 */

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  cacheEnabled: boolean;
  cacheTtl: number;
  enableMetrics: boolean;
  securityEnabled: boolean;
}

export interface ApiRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  cache?: boolean;
  timeout?: number;
  retries?: number;
  validateResponse?: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  cached: boolean;
  timing: {
    start: number;
    end: number;
    duration: number;
  };
  retryCount: number;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
  retryable: boolean;
  timing: {
    start: number;
    end: number;
    duration: number;
  };
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
  url: string;
}

interface RequestMetrics {
  url: string;
  method: string;
  status: number;
  duration: number;
  cached: boolean;
  retryCount: number;
  timestamp: number;
  error?: string;
}

export class ApiClient {
  private config: ApiConfig;
  private cache: Map<string, CacheEntry>;
  private metrics: RequestMetrics[];
  private activeRequests: Map<string, Promise<unknown>>;
  private securityManager?: SecurityManager;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: '',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      cacheEnabled: true,
      cacheTtl: 300000, // 5 minutes
      enableMetrics: true,
      securityEnabled: true,
      ...config
    };

    this.cache = new Map();
    this.metrics = [];
    this.activeRequests = new Map();

    if (this.config.securityEnabled) {
      this.securityManager = SecurityManager.getInstance();
    }

    this.setupPerformanceMonitoring();
  }

  /**
   * Make an optimized API request
   */
  async request<T = unknown>(request: ApiRequest): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId(request);
    
    try {
      // Security validation
      if (this.securityManager) {
        await this.validateRequest(request);
      }

      // Check cache first
      if (request.cache !== false && this.config.cacheEnabled) {
        const cached = this.getCachedResponse<T>(requestId);
        if (cached) {
          return cached;
        }
      }

      // Deduplicate identical requests
      if (this.activeRequests.has(requestId)) {
        return await this.activeRequests.get(requestId) as ApiResponse<T>;
      }

      // Create request promise
      const requestPromise = this.executeRequest<T>(request, startTime);
      this.activeRequests.set(requestId, requestPromise);

      try {
        const response = await requestPromise;
        
        // Cache successful responses
        if (request.cache !== false && this.config.cacheEnabled && response.status < 400) {
          this.cacheResponse(requestId, response);
        }

        return response;
      } finally {
        this.activeRequests.delete(requestId);
      }

    } catch (error) {
      this.recordError(request, error as Error, startTime);
      throw this.createApiError(error as Error, startTime);
    }
  }

  /**
   * GET request with optimization
   */
  async get<T = unknown>(url: string, params?: Record<string, string | number | boolean>, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      params,
      ...options
    });
  }

  /**
   * POST request with optimization
   */
  async post<T = unknown>(url: string, body?: unknown, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      body,
      cache: false, // Don't cache POST requests
      ...options
    });
  }

  /**
   * PUT request with optimization
   */
  async put<T = unknown>(url: string, body?: unknown, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      body,
      cache: false, // Don't cache PUT requests
      ...options
    });
  }

  /**
   * DELETE request with optimization
   */
  async delete<T = unknown>(url: string, options?: Partial<ApiRequest>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      cache: false, // Don't cache DELETE requests
      ...options
    });
  }

  /**
   * Execute the actual HTTP request with retries
   */
  private async executeRequest<T>(request: ApiRequest, startTime: number): Promise<ApiResponse<T>> {
    const retryAttempts = request.retries ?? this.config.retryAttempts;
    let lastError: Error;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const response = await this.performHttpRequest<T>(request, startTime, attempt);
        
        // Record successful metrics
        if (this.config.enableMetrics) {
          this.recordMetrics(request, response, attempt);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on non-retryable errors
        if (!this.isRetryableError(error as Error) || attempt === retryAttempts) {
          throw error;
        }

        // Wait before retry with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Perform the actual HTTP request
   */
  private async performHttpRequest<T>(request: ApiRequest, startTime: number, retryCount: number): Promise<ApiResponse<T>> {
    const url = this.buildUrl(request.url, request.params);
    const timeout = request.timeout ?? this.config.timeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...request.headers
      };

      const fetchOptions: RequestInit = {
        method: request.method,
        headers,
        signal: controller.signal
      };

      if (request.body && request.method !== 'GET') {
        fetchOptions.body = JSON.stringify(request.body);
      }

      const response = await fetch(url, fetchOptions);
      const endTime = Date.now();

      // Parse response data
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as T;
      }

      // Validate response if security is enabled
      if (this.securityManager && request.validateResponse !== false) {
        await this.validateResponse(data, response);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        data,
        status: response.status,
        headers: this.parseHeaders(response.headers),
        cached: false,
        timing: {
          start: startTime,
          end: endTime,
          duration: endTime - startTime
        },
        retryCount
      };

    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Build complete URL with parameters
   */
  private buildUrl(url: string, params?: Record<string, any>): string {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    
    if (!params || Object.keys(params).length === 0) {
      return fullUrl;
    }

    const urlObj = new URL(fullUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.set(key, String(value));
      }
    });

    return urlObj.toString();
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Parse response headers into object
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const headerObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    return headerObj;
  }

  /**
   * Generate unique request ID for caching and deduplication
   */
  private generateRequestId(request: ApiRequest): string {
    const key = `${request.method}:${request.url}`;
    if (request.params) {
      const sortedParams = Object.keys(request.params)
        .sort()
        .map(key => `${key}=${request.params![key]}`)
        .join('&');
      return `${key}?${sortedParams}`;
    }
    return key;
  }

  /**
   * Get cached response if available and valid
   */
  private getCachedResponse<T>(requestId: string): ApiResponse<T> | null {
    const entry = this.cache.get(requestId);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(requestId);
      return null;
    }

    // Return cached response with proper typing
    const cachedResponse = entry.data as ApiResponse<T>;
    return {
      ...cachedResponse,
      cached: true
    };
  }

  /**
   * Cache successful response
   */
  private cacheResponse<T>(requestId: string, response: ApiResponse<T>): void {
    const entry: CacheEntry = {
      data: response,
      timestamp: Date.now(),
      ttl: this.config.cacheTtl,
      url: requestId
    };

    this.cache.set(requestId, entry);

    // Clean up old cache entries
    this.cleanupCache();
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    // Network errors are retryable
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      return true;
    }

    // HTTP 5xx errors are retryable
    if (error.message.includes('HTTP 5')) {
      return true;
    }

    // HTTP 429 (Too Many Requests) is retryable
    if (error.message.includes('HTTP 429')) {
      return true;
    }

    return false;
  }

  /**
   * Create structured API error
   */
  private createApiError(error: Error, startTime: number): ApiError {
    const endTime = Date.now();
    let status = 0;
    let code = 'UNKNOWN_ERROR';

    // Extract status code from error message
    const statusMatch = error.message.match(/HTTP (\d+)/);
    if (statusMatch) {
      status = parseInt(statusMatch[1]);
      code = `HTTP_${status}`;
    }

    return {
      code,
      message: error.message,
      status,
      details: error,
      retryable: this.isRetryableError(error),
      timing: {
        start: startTime,
        end: endTime,
        duration: endTime - startTime
      }
    };
  }

  /**
   * Record request metrics
   */
  private recordMetrics<T>(request: ApiRequest, response: ApiResponse<T>, retryCount: number): void {
    const metric: RequestMetrics = {
      url: request.url,
      method: request.method,
      status: response.status,
      duration: response.timing.duration,
      cached: response.cached,
      retryCount,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Record error metrics
   */
  private recordError(request: ApiRequest, error: Error, startTime: number): void {
    if (!this.config.enableMetrics) return;

    const metric: RequestMetrics = {
      url: request.url,
      method: request.method,
      status: 0,
      duration: Date.now() - startTime,
      cached: false,
      retryCount: 0,
      timestamp: Date.now(),
      error: error.message
    };

    this.metrics.push(metric);
  }

  /**
   * Security validation for requests
   */
  private async validateRequest(request: ApiRequest): Promise<void> {
    if (!this.securityManager) return;

    // Validate URL
    if (!this.securityManager.validateInput(request.url, 'url')) {
      throw new Error('Invalid request URL');
    }

    // Validate body if present
    if (request.body) {
      const bodyStr = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
      if (!this.securityManager.validateInput(bodyStr, 'json')) {
        throw new Error('Invalid request body');
      }
    }

    // Record security event
    this.securityManager.recordEvent(
      'suspicious_activity',
      'low',
      {
        url: request.url,
        method: request.method
      },
      'current_user'
    );
  }

  /**
   * Security validation for responses
   */
  private async validateResponse<T>(_data: T, response: Response): Promise<void> {
    if (!this.securityManager) return;

    // Validate response content type
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json') && !contentType.includes('text/')) {
      this.securityManager.recordEvent(
        'suspicious_activity',
        'medium',
        { contentType },
        'current_user'
      );
    }

    // Validate response size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
      this.securityManager.recordEvent(
        'suspicious_activity',
        'medium',
        { size: contentLength },
        'current_user'
      );
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (!this.config.enableMetrics) return;

    // Monitor cache hit rate
    setInterval(() => {
      const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp < 60000); // Last minute
      const cacheHits = recentMetrics.filter(m => m.cached).length;
      const totalRequests = recentMetrics.length;
      
      if (totalRequests > 0) {
        const hitRate = (cacheHits / totalRequests) * 100;
        console.log(`API Cache Hit Rate: ${hitRate.toFixed(1)}%`);
      }
    }, 60000); // Every minute
  }

  /**
   * Get performance metrics
   */
  getMetrics(): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
    recentMetrics: RequestMetrics[];
  } {
    const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp < 300000); // Last 5 minutes
    const totalRequests = recentMetrics.length;
    
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
        recentMetrics: []
      };
    }

    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
    const errors = recentMetrics.filter(m => m.error || m.status >= 400).length;
    const errorRate = (errors / totalRequests) * 100;
    const cacheHits = recentMetrics.filter(m => m.cached).length;
    const cacheHitRate = (cacheHits / totalRequests) * 100;

    return {
      totalRequests,
      averageResponseTime,
      errorRate,
      cacheHitRate,
      recentMetrics
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Utility: Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
