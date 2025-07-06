/**
 * Development Tools Manager for ResearchHub
 * Provides debugging utilities, performance monitoring, and development helpers
 * Based on Vibe-Coder-MCP architectural patterns
 */

export interface DevToolsConfig {
  enableInProduction: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableStateInspection: boolean;
  enableApiLogging: boolean;
  enableComponentDebugging: boolean;
  maxLogEntries: number;
  performanceThresholds: {
    slowApiCall: number;
    slowComponentRender: number;
    largePayload: number;
  };
}

export interface PerformanceMetric {
  id: string;
  name: string;
  category: 'api' | 'component' | 'navigation' | 'custom';
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface ApiCall {
  id: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  requestSize?: number;
  responseSize?: number;
  timestamp: Date;
  error?: string;
}

export interface ComponentDebugInfo {
  name: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  props?: Record<string, unknown>;
  state?: Record<string, unknown>;
}

export class DevToolsManager {
  private config: DevToolsConfig;
  private performanceMetrics: PerformanceMetric[] = [];
  private apiCalls: ApiCall[] = [];
  private componentDebugInfo = new Map<string, ComponentDebugInfo>();
  private isInitialized = false;

  constructor(config: Partial<DevToolsConfig> = {}) {
    this.config = {
      enableInProduction: false,
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      enableStateInspection: true,
      enableApiLogging: true,
      enableComponentDebugging: true,
      maxLogEntries: 1000,
      performanceThresholds: {
        slowApiCall: 2000,
        slowComponentRender: 100,
        largePayload: 1024 * 1024 // 1MB
      },
      ...config
    };
  }

  /**
   * Initialize development tools
   */
  public initialize(): void {
    if (this.isInitialized) return;

    // Don't initialize in production unless explicitly enabled
    if (this.isProduction() && !this.config.enableInProduction) {
      console.log('DevTools disabled in production');
      return;
    }

    this.setupPerformanceMonitoring();
    this.setupApiInterception();
    this.setupErrorTracking();
    this.setupConsoleHelpers();
    this.exposeGlobalHelpers();

    this.isInitialized = true;
    console.log('🛠️ ResearchHub DevTools initialized');
  }

  /**
   * Start performance monitoring for an operation
   */
  public startPerformanceTimer(
    name: string, 
    category: PerformanceMetric['category'] = 'custom',
    metadata?: Record<string, unknown>
  ): string {
    const id = `perf_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    const metric: PerformanceMetric = {
      id,
      name,
      category,
      startTime: performance.now(),
      metadata
    };

    this.performanceMetrics.push(metric);
    this.trimMetrics();

    return id;
  }

  /**
   * End performance monitoring
   */
  public endPerformanceTimer(id: string): PerformanceMetric | null {
    const metric = this.performanceMetrics.find(m => m.id === id);
    if (!metric) return null;

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Check for slow operations
    if (this.isSlowOperation(metric)) {
      console.warn(`🐌 Slow ${metric.category} operation detected:`, metric);
    }

    return metric;
  }

  /**
   * Log API call information
   */
  public logApiCall(
    method: string,
    url: string,
    status?: number,
    duration?: number,
    requestSize?: number,
    responseSize?: number,
    error?: string
  ): void {
    if (!this.config.enableApiLogging) return;

    const apiCall: ApiCall = {
      id: `api_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      method,
      url,
      status,
      duration,
      requestSize,
      responseSize,
      timestamp: new Date(),
      error
    };

    this.apiCalls.push(apiCall);
    this.trimApiCalls();

    // Log slow or failed API calls
    if (error || (duration && duration > this.config.performanceThresholds.slowApiCall)) {
      const logLevel = error ? 'error' : 'warn';
      console[logLevel](`🌐 API ${method} ${url}:`, apiCall);
    }

    // Check for large payloads
    if (responseSize && responseSize > this.config.performanceThresholds.largePayload) {
      console.warn(`📦 Large response payload detected (${responseSize} bytes):`, apiCall);
    }
  }

  /**
   * Track component render performance
   */
  public trackComponentRender(
    componentName: string,
    renderTime: number,
    props?: Record<string, unknown>,
    state?: Record<string, unknown>
  ): void {
    if (!this.config.enableComponentDebugging) return;

    const existing = this.componentDebugInfo.get(componentName);
    
    if (existing) {
      existing.renderCount++;
      existing.lastRenderTime = renderTime;
      existing.averageRenderTime = 
        (existing.averageRenderTime * (existing.renderCount - 1) + renderTime) / existing.renderCount;
      existing.props = props;
      existing.state = state;
    } else {
      this.componentDebugInfo.set(componentName, {
        name: componentName,
        renderCount: 1,
        lastRenderTime: renderTime,
        averageRenderTime: renderTime,
        props,
        state
      });
    }

    // Warn about slow renders
    if (renderTime > this.config.performanceThresholds.slowComponentRender) {
      console.warn(`🐌 Slow component render: ${componentName} (${renderTime}ms)`);
    }
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary() {
    return {
      metrics: this.performanceMetrics.length,
      slowOperations: this.performanceMetrics.filter(m => this.isSlowOperation(m)).length,
      averageDuration: this.calculateAverageDuration(),
      byCategory: this.groupMetricsByCategory(),
      apiCalls: {
        total: this.apiCalls.length,
        failed: this.apiCalls.filter(call => call.error).length,
        slow: this.apiCalls.filter(call => 
          call.duration && call.duration > this.config.performanceThresholds.slowApiCall
        ).length
      },
      components: {
        tracked: this.componentDebugInfo.size,
        slowRenders: Array.from(this.componentDebugInfo.values()).filter(
          comp => comp.averageRenderTime > this.config.performanceThresholds.slowComponentRender
        ).length
      }
    };
  }

  /**
   * Export development data for debugging
   */
  public exportDebugData() {
    return {
      config: this.config,
      performanceMetrics: this.performanceMetrics,
      apiCalls: this.apiCalls,
      componentDebugInfo: Array.from(this.componentDebugInfo.entries()),
      summary: this.getPerformanceSummary(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear all collected data
   */
  public clearData(): void {
    this.performanceMetrics = [];
    this.apiCalls = [];
    this.componentDebugInfo.clear();
    console.log('🧹 DevTools data cleared');
  }

  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) return;

    // Monitor navigation performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor page load performance
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log('📊 Page Load Performance:', {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart
          });
        }
      });

      // Monitor resource loading
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.duration > 1000) { // Resources taking more than 1 second
            console.warn(`🐌 Slow resource load: ${entry.name} (${entry.duration}ms)`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private setupApiInterception(): void {
    if (!this.config.enableApiLogging) return;
    if (typeof window === 'undefined') return;

    // Intercept fetch calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const request = args[0];
      const url = typeof request === 'string' ? request : request instanceof Request ? request.url : request.toString();
      const method = args[1]?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.logApiCall(
          method,
          url,
          response.status,
          duration,
          this.getRequestSize(args[1]),
          this.getResponseSize(response)
        );

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.logApiCall(
          method,
          url,
          undefined,
          duration,
          undefined,
          undefined,
          error instanceof Error ? error.message : String(error)
        );
        throw error;
      }
    };
  }

  private setupErrorTracking(): void {
    if (!this.config.enableErrorTracking) return;
    if (typeof window === 'undefined') return;

    // Enhanced error logging
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Add stack trace and context
      const error = args.find(arg => arg instanceof Error);
      if (error) {
        console.group('🚨 Error Details');
        originalConsoleError(...args);
        console.log('Stack trace:', error.stack);
        console.log('Timestamp:', new Date().toISOString());
        console.log('URL:', window.location.href);
        console.groupEnd();
      } else {
        originalConsoleError(...args);
      }
    };
  }

  private setupConsoleHelpers(): void {
    if (typeof window === 'undefined') return;

    // Add helpful console methods
    (window as unknown as { devTools: any }).devTools = {
      summary: () => this.getPerformanceSummary(),
      export: () => this.exportDebugData(),
      clear: () => this.clearData(),
      components: () => Array.from(this.componentDebugInfo.entries()),
      slowApis: () => this.apiCalls.filter(call => 
        call.duration && call.duration > this.config.performanceThresholds.slowApiCall
      ),
      errors: () => this.apiCalls.filter(call => call.error)
    };
  }

  private exposeGlobalHelpers(): void {
    if (typeof window === 'undefined') return;

    // Expose useful debugging functions globally
    (window as unknown as { debugHelpers: any }).debugHelpers = {
      logComponent: (name: string, props?: Record<string, unknown>, state?: Record<string, unknown>) => {
        console.log(`🔍 Component Debug: ${name}`, { props, state });
      },
      measure: (fn: () => unknown, name = 'operation') => {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        console.log(`⏱️ ${name} took ${duration}ms`);
        return result;
      },
      measureAsync: async (fn: () => Promise<unknown>, name = 'async operation') => {
        const start = performance.now();
        const result = await fn();
        const duration = performance.now() - start;
        console.log(`⏱️ ${name} took ${duration}ms`);
        return result;
      }
    };
  }

  private isSlowOperation(metric: PerformanceMetric): boolean {
    if (!metric.duration) return false;
    
    switch (metric.category) {
      case 'api':
        return metric.duration > this.config.performanceThresholds.slowApiCall;
      case 'component':
        return metric.duration > this.config.performanceThresholds.slowComponentRender;
      default:
        return metric.duration > 1000; // 1 second default
    }
  }

  private calculateAverageDuration(): number {
    const completedMetrics = this.performanceMetrics.filter(m => m.duration);
    if (completedMetrics.length === 0) return 0;
    
    const total = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / completedMetrics.length;
  }

  private groupMetricsByCategory(): Record<string, number> {
    return this.performanceMetrics.reduce((acc, metric) => {
      acc[metric.category] = (acc[metric.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getRequestSize(init?: RequestInit): number | undefined {
    if (!init?.body) return undefined;
    
    if (typeof init.body === 'string') {
      return new Blob([init.body]).size;
    }
    
    if (init.body instanceof Blob) {
      return init.body.size;
    }
    
    return undefined;
  }

  private getResponseSize(response: Response): number | undefined {
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : undefined;
  }

  private trimMetrics(): void {
    if (this.performanceMetrics.length > this.config.maxLogEntries) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.config.maxLogEntries + 100);
    }
  }

  private trimApiCalls(): void {
    if (this.apiCalls.length > this.config.maxLogEntries) {
      this.apiCalls = this.apiCalls.slice(-this.config.maxLogEntries + 100);
    }
  }

  private isProduction(): boolean {
    return typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
  }
}

// Global instance
export const globalDevTools = new DevToolsManager();

// Convenience functions
export const startTimer = (name: string, category?: PerformanceMetric['category'], metadata?: Record<string, unknown>) =>
  globalDevTools.startPerformanceTimer(name, category, metadata);

export const endTimer = (id: string) => globalDevTools.endPerformanceTimer(id);

export const logApi = (method: string, url: string, status?: number, duration?: number, error?: string) =>
  globalDevTools.logApiCall(method, url, status, duration, undefined, undefined, error);

export const trackComponent = (name: string, renderTime: number, props?: Record<string, unknown>, state?: Record<string, unknown>) =>
  globalDevTools.trackComponentRender(name, renderTime, props, state);

export const getDevSummary = () => globalDevTools.getPerformanceSummary();

export const exportDevData = () => globalDevTools.exportDebugData();

export const clearDevData = () => globalDevTools.clearData();
