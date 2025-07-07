/**
 * API Response Optimization - Enhanced response handling and caching
 * Part of the Vibe-Coder-MCP implementation for ResearchHub
 * 
 * Features:
 * - Response transformation and normalization
 * - Advanced caching strategies
 * - Response validation and error handling
 * - Performance optimization
 * - Type-safe response processing
 */

export interface ResponseTransform<T = unknown, R = unknown> {
  (data: T): R;
}

export interface CacheStrategy {
  type: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  ttl: number;
  maxSize?: number;
  maxEntries?: number;
  compress?: boolean;
}

export interface ResponseValidator<T = unknown> {
  (data: T): boolean | string;
}

export interface ResponseMetadata {
  cached: boolean;
  cacheHit: boolean;
  transformed: boolean;
  validated: boolean;
  timing: {
    fetchStart: number;
    fetchEnd: number;
    cacheCheck: number;
    transformTime: number;
    validationTime: number;
    totalTime: number;
  };
  source: 'network' | 'cache' | 'fallback';
  compressionRatio?: number;
}

export interface OptimizedResponse<T = unknown> {
  data: T;
  metadata: ResponseMetadata;
  status: number;
  headers: Record<string, string>;
  originalData?: unknown;
  errors?: string[];
  warnings?: string[];
}

export interface ResponseConfig<T = unknown, R = unknown> {
  transform?: ResponseTransform<T, R>;
  validator?: ResponseValidator<R>;
  cache?: CacheStrategy;
  fallback?: R;
  errorTransform?: (error: Error) => R;
  retryable?: boolean;
  skipCache?: boolean;
  skipTransform?: boolean;
  skipValidation?: boolean;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
  url: string;
}

interface PerformanceMetrics {
  url?: string;
  count: number;
  average: number;
  min: number;
  max: number;
  recent: number[];
}

/**
 * Enhanced response processor with optimization features
 */
export class ResponseOptimizer {
  private cache: Map<string, CacheEntry>;
  private transformers: Map<string, ResponseTransform>;
  private validators: Map<string, ResponseValidator>;
  private metrics: Map<string, number[]>;

  constructor() {
    this.cache = new Map();
    this.transformers = new Map();
    this.validators = new Map();
    this.metrics = new Map();
    
    this.setupPerformanceTracking();
  }

  /**
   * Process and optimize API response
   */
  async processResponse<T = unknown, R = T>(
    response: Response,
    data: T,
    config: ResponseConfig<T, R> = {}
  ): Promise<OptimizedResponse<R>> {
    const timing = {
      fetchStart: Date.now(),
      fetchEnd: Date.now(),
      cacheCheck: 0,
      transformTime: 0,
      validationTime: 0,
      totalTime: 0
    };

    const metadata: ResponseMetadata = {
      cached: false,
      cacheHit: false,
      transformed: false,
      validated: false,
      timing,
      source: 'network'
    };

    const result: OptimizedResponse<R> = {
      data: data as unknown as R,
      metadata,
      status: response.status,
      headers: this.parseHeaders(response.headers),
      originalData: data,
      errors: [],
      warnings: []
    };

    try {
      // Check cache if enabled
      if (config.cache && !config.skipCache) {
        const cacheStart = Date.now();
        const cached = await this.getCachedResponse<R>(response.url, config.cache);
        timing.cacheCheck = Date.now() - cacheStart;
        
        if (cached) {
          result.data = cached;
          metadata.cached = true;
          metadata.cacheHit = true;
          metadata.source = 'cache';
          return result;
        }
      }

      // Transform response if transformer provided
      if (config.transform && !config.skipTransform) {
        const transformStart = Date.now();
        try {
          result.data = config.transform(data);
          metadata.transformed = true;
          timing.transformTime = Date.now() - transformStart;
        } catch (error) {
          result.errors!.push(`Transform error: ${(error as Error).message}`);
          if (config.fallback !== undefined) {
            result.data = config.fallback;
          }
        }
      }

      // Validate response if validator provided
      if (config.validator && !config.skipValidation) {
        const validationStart = Date.now();
        try {
          const validationResult = config.validator(result.data);
          if (typeof validationResult === 'string') {
            result.warnings!.push(validationResult);
          } else if (!validationResult) {
            result.errors!.push('Response validation failed');
            if (config.fallback !== undefined) {
              result.data = config.fallback;
            }
          }
          metadata.validated = true;
          timing.validationTime = Date.now() - validationStart;
        } catch (error) {
          result.errors!.push(`Validation error: ${(error as Error).message}`);
        }
      }

      // Cache successful response
      if (config.cache && !config.skipCache && result.errors!.length === 0) {
        await this.cacheResponse(response.url, result.data, config.cache);
        metadata.cached = true;
      }

      // Record performance metrics
      timing.totalTime = Date.now() - timing.fetchStart;
      this.recordPerformanceMetrics(response.url, timing.totalTime);

      return result;

    } catch (error) {
      // Handle errors with error transformer if provided
      if (config.errorTransform) {
        try {
          result.data = config.errorTransform(error as Error);
        } catch (transformError) {
          result.errors!.push(`Error transform failed: ${(transformError as Error).message}`);
        }
      }

      if (config.fallback !== undefined) {
        result.data = config.fallback;
      }

      result.errors!.push(`Processing error: ${(error as Error).message}`);
      return result;
    }
  }

  /**
   * Register a response transformer
   */
  registerTransformer<T, R>(name: string, transformer: ResponseTransform<T, R>): void {
    this.transformers.set(name, transformer as ResponseTransform);
  }

  /**
   * Register a response validator
   */
  registerValidator<T>(name: string, validator: ResponseValidator<T>): void {
    this.validators.set(name, validator as ResponseValidator);
  }

  /**
   * Get registered transformer
   */
  getTransformer<T, R>(name: string): ResponseTransform<T, R> | undefined {
    return this.transformers.get(name) as ResponseTransform<T, R>;
  }

  /**
   * Get registered validator
   */
  getValidator<T>(name: string): ResponseValidator<T> | undefined {
    return this.validators.get(name) as ResponseValidator<T>;
  }

  /**
   * Cache response based on strategy
   */
  private async cacheResponse<T>(url: string, data: T, strategy: CacheStrategy): Promise<void> {
    const key = this.generateCacheKey(url);
    const entry = {
      data,
      timestamp: Date.now(),
      ttl: strategy.ttl,
      url
    };

    switch (strategy.type) {
      case 'memory':
        this.cache.set(key, entry);
        this.enforceMemoryCacheSize(strategy.maxEntries);
        break;

      case 'localStorage':
        try {
          const serialized = strategy.compress ? 
            this.compressData(JSON.stringify(entry)) : 
            JSON.stringify(entry);
          localStorage.setItem(`response_cache_${key}`, serialized);
          this.enforceStorageCacheSize('localStorage', strategy.maxSize);
        } catch (error) {
          console.warn('Failed to cache response in localStorage:', error);
        }
        break;

      case 'sessionStorage':
        try {
          const serialized = strategy.compress ? 
            this.compressData(JSON.stringify(entry)) : 
            JSON.stringify(entry);
          sessionStorage.setItem(`response_cache_${key}`, serialized);
          this.enforceStorageCacheSize('sessionStorage', strategy.maxSize);
        } catch (error) {
          console.warn('Failed to cache response in sessionStorage:', error);
        }
        break;

      case 'indexedDB':
        // IndexedDB implementation for large data caching
        await this.cacheInIndexedDB(key, entry);
        break;
    }
  }

  /**
   * Get cached response based on strategy
   */
  private async getCachedResponse<T>(url: string, strategy: CacheStrategy): Promise<T | null> {
    const key = this.generateCacheKey(url);

    switch (strategy.type) {
      case 'memory': {
        const memoryEntry = this.cache.get(key);
        if (memoryEntry && this.isEntryValid(memoryEntry)) {
          return memoryEntry.data as T;
        }
        break;
      }

      case 'localStorage':
        try {
          const cached = localStorage.getItem(`response_cache_${key}`);
          if (cached) {
            const data = strategy.compress ? 
              this.decompressData(cached) : 
              cached;
            const entry = JSON.parse(data);
            if (this.isEntryValid(entry)) {
              return entry.data;
            }
          }
        } catch (error) {
          console.warn('Failed to retrieve cached response from localStorage:', error);
        }
        break;

      case 'sessionStorage':
        try {
          const cached = sessionStorage.getItem(`response_cache_${key}`);
          if (cached) {
            const data = strategy.compress ? 
              this.decompressData(cached) : 
              cached;
            const entry = JSON.parse(data);
            if (this.isEntryValid(entry)) {
              return entry.data;
            }
          }
        } catch (error) {
          console.warn('Failed to retrieve cached response from sessionStorage:', error);
        }
        break;

      case 'indexedDB':
        return await this.getCachedFromIndexedDB<T>(key);
    }

    return null;
  }

  /**
   * Generate cache key from URL
   */
  private generateCacheKey(url: string): string {
    // Create a simple hash for the URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if cache entry is still valid
   */
  private isEntryValid(entry: unknown): boolean {
    const typedEntry = entry as CacheEntry;
    return !!(typedEntry && 
           typedEntry.timestamp && 
           typedEntry.ttl && 
           (Date.now() - typedEntry.timestamp) < typedEntry.ttl);
  }

  /**
   * Enforce memory cache size limits
   */
  private enforceMemoryCacheSize(maxEntries?: number): void {
    if (!maxEntries || this.cache.size <= maxEntries) return;

    // Remove oldest entries
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const toRemove = entries.slice(0, this.cache.size - maxEntries);
    toRemove.forEach(([key]) => this.cache.delete(key));
  }

  /**
   * Enforce storage cache size limits
   */
  private enforceStorageCacheSize(storage: 'localStorage' | 'sessionStorage', maxSize?: number): void {
    if (!maxSize) return;

    const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
    const keys = Object.keys(storageObj).filter(key => key.startsWith('response_cache_'));
    
    let totalSize = 0;
    keys.forEach(key => {
      totalSize += storageObj.getItem(key)?.length || 0;
    });

    if (totalSize > maxSize) {
      // Remove oldest entries until under size limit
      const entries = keys.map(key => ({
        key,
        timestamp: this.getEntryTimestamp(storageObj.getItem(key)),
        size: storageObj.getItem(key)?.length || 0
      })).sort((a, b) => a.timestamp - b.timestamp);

      for (const entry of entries) {
        if (totalSize <= maxSize) break;
        storageObj.removeItem(entry.key);
        totalSize -= entry.size;
      }
    }
  }

  /**
   * Get timestamp from cached entry
   */
  private getEntryTimestamp(data: string | null): number {
    if (!data) return 0;
    try {
      const entry = JSON.parse(data);
      return entry.timestamp || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Cache response in IndexedDB for large data
   */
  private async cacheInIndexedDB(key: string, entry: CacheEntry): Promise<void> {
    try {
      const request = indexedDB.open('ResponseCache', 1);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('responses')) {
          db.createObjectStore('responses', { keyPath: 'key' });
        }
      };

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['responses'], 'readwrite');
          const store = transaction.objectStore('responses');
          
          store.put({ key, ...entry });
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to cache in IndexedDB:', error);
    }
  }

  /**
   * Get cached response from IndexedDB
   */
  private async getCachedFromIndexedDB<T>(key: string): Promise<T | null> {
    try {
      const request = indexedDB.open('ResponseCache', 1);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['responses'], 'readonly');
          const store = transaction.objectStore('responses');
          const getRequest = store.get(key);
          
          getRequest.onsuccess = () => {
            const entry = getRequest.result;
            if (entry && this.isEntryValid(entry)) {
              resolve(entry.data);
            } else {
              resolve(null);
            }
          };
          
          getRequest.onerror = () => resolve(null);
        };
        
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.warn('Failed to get cached response from IndexedDB:', error);
      return null;
    }
  }

  /**
   * Simple data compression (base64 encoding for now)
   */
  private compressData(data: string): string {
    try {
      return btoa(data);
    } catch {
      return data;
    }
  }

  /**
   * Simple data decompression
   */
  private decompressData(data: string): string {
    try {
      return atob(data);
    } catch {
      return data;
    }
  }

  /**
   * Parse response headers
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const headerObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    return headerObj;
  }

  /**
   * Record performance metrics
   */
  private recordPerformanceMetrics(url: string, duration: number): void {
    if (!this.metrics.has(url)) {
      this.metrics.set(url, []);
    }
    
    const urlMetrics = this.metrics.get(url)!;
    urlMetrics.push(duration);
    
    // Keep only last 100 measurements per URL
    if (urlMetrics.length > 100) {
      urlMetrics.splice(0, urlMetrics.length - 100);
    }
  }

  /**
   * Get performance metrics for URL
   */
  getPerformanceMetrics(url?: string): PerformanceMetrics | Record<string, PerformanceMetrics> {
    if (url) {
      const urlMetrics = this.metrics.get(url) || [];
      if (urlMetrics.length === 0) return {};
      
      const avg = urlMetrics.reduce((sum, time) => sum + time, 0) / urlMetrics.length;
      const min = Math.min(...urlMetrics);
      const max = Math.max(...urlMetrics);
      
      return {
        url,
        count: urlMetrics.length,
        average: avg,
        min,
        max,
        recent: urlMetrics.slice(-10)
      };
    }

    // Return metrics for all URLs
    const allMetrics: Record<string, PerformanceMetrics> = {};
    this.metrics.forEach((_times, url) => {
      allMetrics[url] = this.getPerformanceMetrics(url) as PerformanceMetrics;
    });
    
    return allMetrics;
  }

  /**
   * Setup performance tracking
   */
  private setupPerformanceTracking(): void {
    // Monitor performance every 5 minutes
    setInterval(() => {
      const metrics = this.getPerformanceMetrics() as Record<string, PerformanceMetrics>;
      const urls = Object.keys(metrics);
      
      if (urls.length > 0) {
        const totalRequests = urls.reduce((sum, url) => sum + metrics[url].count, 0);
        const avgResponseTime = urls.reduce((sum, url) => sum + metrics[url].average, 0) / urls.length;
        
        console.log(`API Performance: ${totalRequests} requests, ${avgResponseTime.toFixed(0)}ms avg response`);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    // Clear memory cache
    this.cache.clear();
    
    // Clear localStorage cache
    Object.keys(localStorage)
      .filter(key => key.startsWith('response_cache_'))
      .forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage cache
    Object.keys(sessionStorage)
      .filter(key => key.startsWith('response_cache_'))
      .forEach(key => sessionStorage.removeItem(key));
    
    // Clear IndexedDB cache
    this.clearIndexedDBCache();
  }

  /**
   * Clear IndexedDB cache
   */
  private async clearIndexedDBCache(): Promise<void> {
    try {
      const request = indexedDB.open('ResponseCache', 1);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['responses'], 'readwrite');
          const store = transaction.objectStore('responses');
          
          store.clear();
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => resolve();
        };
        
        request.onerror = () => resolve();
      });
    } catch (error) {
      console.warn('Failed to clear IndexedDB cache:', error);
    }
  }
}

// Export singleton instance
export const responseOptimizer = new ResponseOptimizer();
