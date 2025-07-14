/**
 * 🚀 Performance Intelligence Monitor for ResearchHub
 * Advanced performance monitoring and optimization for Study Builder and API responses
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'score' | 'count' | 'percent';
  timestamp: number;
  context?: Record<string, unknown>;
}

interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
  errorCount: number;
  lastUpdate: number;
  props?: Record<string, unknown>;
}

interface APIPerformance {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
  payloadSize: number;
  cached: boolean;
  retries: number;
  error?: string;
}

interface StudyBuilderPerformance {
  studyId: string;
  blocksCount: number;
  loadTime: number;
  saveTime: number;
  validationTime: number;
  previewTime: number;
  operationCounts: Record<string, number>;
  memoryUsage: number;
  timestamp: number;
}

interface PerformanceAlert {
  type: 'slow_response' | 'memory_leak' | 'error_spike' | 'degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: number;
  suggestions: string[];
}

class PerformanceIntelligence {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private componentMetrics: Map<string, ComponentPerformance> = new Map();
  private apiMetrics: APIPerformance[] = [];
  private studyBuilderMetrics: StudyBuilderPerformance[] = [];
  private alerts: PerformanceAlert[] = [];
  private observers: PerformanceObserver[] = [];
  
  // Performance thresholds
  private thresholds = {
    apiResponse: 2000, // 2 seconds
    componentRender: 100, // 100ms
    studyBuilderLoad: 3000, // 3 seconds
    memoryUsage: 100 * 1024 * 1024, // 100MB
    errorRate: 0.05, // 5%
    lcp: 2500, // 2.5 seconds (Largest Contentful Paint)
    fid: 100, // 100ms (First Input Delay)
    cls: 0.1 // 0.1 (Cumulative Layout Shift)
  };

  constructor() {
    this.initializePerformanceObservers();
    this.startMonitoring();
    this.trackWebVitals();
  }

  /**
   * Track Study Builder specific performance
   */
  trackStudyBuilderPerformance(data: Omit<StudyBuilderPerformance, 'timestamp'>): void {
    const metric: StudyBuilderPerformance = {
      ...data,
      timestamp: Date.now()
    };
    
    this.studyBuilderMetrics.push(metric);
    
    // Keep only last 100 entries
    if (this.studyBuilderMetrics.length > 100) {
      this.studyBuilderMetrics = this.studyBuilderMetrics.slice(-100);
    }

    // Check for performance issues
    this.checkStudyBuilderThresholds(metric);
    
    // Log to debug console
    this.logToDebugConsole('Study Builder Performance', {
      studyId: metric.studyId,
      blocksCount: metric.blocksCount,
      loadTime: metric.loadTime,
      saveTime: metric.saveTime,
      memoryUsage: `${(metric.memoryUsage / 1024 / 1024).toFixed(2)}MB`
    });
  }

  /**
   * Track API performance
   */
  trackAPIPerformance(data: Omit<APIPerformance, 'timestamp'>): void {
    const metric: APIPerformance = {
      ...data,
      timestamp: Date.now()
    };
    
    this.apiMetrics.push(metric);
    
    // Keep only last 500 entries
    if (this.apiMetrics.length > 500) {
      this.apiMetrics = this.apiMetrics.slice(-500);
    }

    // Check for performance issues
    this.checkAPIThresholds(metric);
    
    // Track slow APIs
    if (metric.responseTime > this.thresholds.apiResponse) {
      this.logToDebugConsole('Slow API Response Detected', {
        endpoint: metric.endpoint,
        responseTime: `${metric.responseTime}ms`,
        threshold: `${this.thresholds.apiResponse}ms`,
        statusCode: metric.statusCode
      });
    }
  }

  /**
   * Track React component performance
   */
  trackComponentPerformance(data: Omit<ComponentPerformance, 'lastUpdate'>): void {
    const metric: ComponentPerformance = {
      ...data,
      lastUpdate: Date.now()
    };
    
    this.componentMetrics.set(data.componentName, metric);
    
    // Check for performance issues
    this.checkComponentThresholds(metric);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): Record<string, unknown> {
    return {
      apiPerformance: this.getAPIPerformanceSummary(),
      componentPerformance: this.getComponentPerformanceSummary(),
      studyBuilderPerformance: this.getStudyBuilderPerformanceSummary(),
      webVitals: this.getWebVitalsSummary(),
      alerts: this.getActiveAlerts(),
      recommendations: this.generatePerformanceRecommendations()
    };
  }

  /**
   * Get slow operations analysis
   */
  getSlowOperationsAnalysis(): Record<string, unknown> {
    const slowAPIs = this.apiMetrics
      .filter(api => api.responseTime > this.thresholds.apiResponse)
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 10);

    const slowComponents = Array.from(this.componentMetrics.values())
      .filter(comp => comp.renderTime > this.thresholds.componentRender)
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, 10);

    const slowStudyOperations = this.studyBuilderMetrics
      .filter(study => study.loadTime > this.thresholds.studyBuilderLoad)
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 10);

    return {
      slowAPIs: slowAPIs.map(api => ({
        endpoint: api.endpoint,
        responseTime: api.responseTime,
        frequency: this.apiMetrics.filter(a => a.endpoint === api.endpoint).length
      })),
      slowComponents: slowComponents.map(comp => ({
        name: comp.componentName,
        renderTime: comp.renderTime,
        updateCount: comp.updateCount
      })),
      slowStudyOperations: slowStudyOperations.map(study => ({
        studyId: study.studyId,
        blocksCount: study.blocksCount,
        loadTime: study.loadTime,
        memoryUsage: study.memoryUsage
      }))
    };
  }

  /**
   * Start performance optimization mode
   */
  startOptimizationMode(): void {
    this.logToDebugConsole('Performance Optimization Mode Activated', {
      message: 'Enhanced monitoring and suggestions enabled',
      thresholds: this.thresholds
    });

    // Increase monitoring frequency
    this.startDetailedMonitoring();
  }

  /**
   * Get performance optimization suggestions
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    
    // API optimization suggestions
    const slowAPIs = this.apiMetrics.filter(api => api.responseTime > 1000);
    if (slowAPIs.length > 0) {
      suggestions.push('Consider implementing API response caching for slow endpoints');
      suggestions.push('Review database query optimization for slow API responses');
    }

    // Component optimization suggestions
    const heavyComponents = Array.from(this.componentMetrics.values())
      .filter(comp => comp.renderTime > 50);
    if (heavyComponents.length > 0) {
      suggestions.push('Consider memoization for heavy-rendering components');
      suggestions.push('Review component prop dependencies for unnecessary re-renders');
    }

    // Study Builder optimization
    const heavyStudies = this.studyBuilderMetrics.filter(study => study.loadTime > 2000);
    if (heavyStudies.length > 0) {
      suggestions.push('Implement lazy loading for Study Builder blocks');
      suggestions.push('Consider pagination for studies with many blocks');
    }

    // Memory optimization
    const highMemoryUsage = this.studyBuilderMetrics.filter(study => 
      study.memoryUsage > this.thresholds.memoryUsage
    );
    if (highMemoryUsage.length > 0) {
      suggestions.push('Review memory leaks in Study Builder components');
      suggestions.push('Implement cleanup in useEffect hooks');
    }

    return suggestions;
  }

  /**
   * Initialize performance observers
   */
  private initializePerformanceObservers(): void {
    if ('PerformanceObserver' in window) {
      // Navigation timing observer
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            this.trackMetric('page_load_time', entry.duration, 'ms');
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Resource timing observer
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'resource') {
            this.trackMetric(`resource_${entry.name}`, entry.duration, 'ms');
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Measure observer
      const measureObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            this.trackMetric(entry.name, entry.duration, 'ms');
          }
        });
      });
      measureObserver.observe({ entryTypes: ['measure'] });
      this.observers.push(measureObserver);
    }
  }

  /**
   * Track Web Vitals (Core Web Vitals)
   */
  private trackWebVitals(): void {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.trackMetric('lcp', lastEntry.startTime, 'ms');
          
          if (lastEntry.startTime > this.thresholds.lcp) {
            this.addAlert({
              type: 'degradation',
              severity: 'medium',
              message: 'Largest Contentful Paint is slower than recommended',
              threshold: this.thresholds.lcp,
              actualValue: lastEntry.startTime,
              timestamp: Date.now(),
              suggestions: ['Optimize images and fonts', 'Reduce server response time']
            });
          }
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }

    // FID (First Input Delay) - via event listeners
    ['mousedown', 'keydown', 'touchstart', 'pointerdown'].forEach(type => {
      addEventListener(type, this.measureFID.bind(this), { once: true, passive: true });
    });

    // CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        list.getEntries().forEach(entry => {
          const layoutEntry = entry as unknown as { hadRecentInput?: boolean; value?: number };
          if (!layoutEntry.hadRecentInput && layoutEntry.value) {
            cls += layoutEntry.value;
          }
        });
        
        this.trackMetric('cls', cls, 'score');
        
        if (cls > this.thresholds.cls) {
          this.addAlert({
            type: 'degradation',
            severity: 'medium',
            message: 'Cumulative Layout Shift exceeds threshold',
            threshold: this.thresholds.cls,
            actualValue: cls,
            timestamp: Date.now(),
            suggestions: ['Add size attributes to images', 'Avoid inserting content above existing content']
          });
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  /**
   * Measure First Input Delay
   */
  private measureFID(event: Event): void {
    const startTime = performance.now();
    
    requestIdleCallback(() => {
      const fid = performance.now() - startTime;
      this.trackMetric('fid', fid, 'ms');
      
      // Track additional context from the first interaction event
      const eventType = event.type;
      const targetElement = event.target ? (event.target as Element).tagName : 'unknown';
      
      if (fid > this.thresholds.fid) {
        this.addAlert({
          type: 'degradation',
          severity: 'medium',
          message: `First Input Delay (${fid.toFixed(2)}ms) exceeded threshold on ${eventType} event (target: ${targetElement})`,
          threshold: this.thresholds.fid,
          actualValue: fid,
          timestamp: Date.now(),
          suggestions: ['Reduce JavaScript execution time', 'Split long tasks into smaller chunks', `Optimize ${targetElement} event handlers`]
        });
      }
    });
  }

  /**
   * Track custom metric
   */
  private trackMetric(name: string, value: number, unit: PerformanceMetric['unit'], context?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      context
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricArray = this.metrics.get(name)!;
    metricArray.push(metric);

    // Keep only last 100 entries per metric
    if (metricArray.length > 100) {
      this.metrics.set(name, metricArray.slice(-100));
    }
  }

  /**
   * Check API performance thresholds
   */
  private checkAPIThresholds(metric: APIPerformance): void {
    if (metric.responseTime > this.thresholds.apiResponse) {
      this.addAlert({
        type: 'slow_response',
        severity: metric.responseTime > this.thresholds.apiResponse * 2 ? 'high' : 'medium',
        message: `Slow API response: ${metric.endpoint}`,
        threshold: this.thresholds.apiResponse,
        actualValue: metric.responseTime,
        timestamp: Date.now(),
        suggestions: ['Check database performance', 'Implement caching', 'Optimize queries']
      });
    }

    if (metric.statusCode >= 500) {
      this.addAlert({
        type: 'error_spike',
        severity: 'high',
        message: `Server error on ${metric.endpoint}`,
        threshold: 0,
        actualValue: metric.statusCode,
        timestamp: Date.now(),
        suggestions: ['Check server logs', 'Review error handling', 'Monitor server resources']
      });
    }
  }

  /**
   * Check component performance thresholds
   */
  private checkComponentThresholds(metric: ComponentPerformance): void {
    if (metric.renderTime > this.thresholds.componentRender) {
      this.addAlert({
        type: 'slow_response',
        severity: 'medium',
        message: `Slow component render: ${metric.componentName}`,
        threshold: this.thresholds.componentRender,
        actualValue: metric.renderTime,
        timestamp: Date.now(),
        suggestions: ['Use React.memo', 'Optimize props', 'Consider code splitting']
      });
    }

    if (metric.errorCount > 0) {
      this.addAlert({
        type: 'error_spike',
        severity: 'medium',
        message: `Component errors detected: ${metric.componentName}`,
        threshold: 0,
        actualValue: metric.errorCount,
        timestamp: Date.now(),
        suggestions: ['Review error boundaries', 'Check prop types', 'Add error handling']
      });
    }
  }

  /**
   * Check Study Builder performance thresholds
   */
  private checkStudyBuilderThresholds(metric: StudyBuilderPerformance): void {
    if (metric.loadTime > this.thresholds.studyBuilderLoad) {
      this.addAlert({
        type: 'slow_response',
        severity: 'medium',
        message: `Slow Study Builder load for study ${metric.studyId}`,
        threshold: this.thresholds.studyBuilderLoad,
        actualValue: metric.loadTime,
        timestamp: Date.now(),
        suggestions: ['Implement lazy loading', 'Optimize block rendering', 'Use virtualization']
      });
    }

    if (metric.memoryUsage > this.thresholds.memoryUsage) {
      this.addAlert({
        type: 'memory_leak',
        severity: 'high',
        message: `High memory usage in Study Builder: ${metric.studyId}`,
        threshold: this.thresholds.memoryUsage,
        actualValue: metric.memoryUsage,
        timestamp: Date.now(),
        suggestions: ['Check for memory leaks', 'Clean up event listeners', 'Optimize data structures']
      });
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    // Log high/critical alerts immediately
    if (alert.severity === 'high' || alert.severity === 'critical') {
      this.logToDebugConsole(`Performance Alert: ${alert.message}`, {
        severity: alert.severity,
        threshold: alert.threshold,
        actualValue: alert.actualValue,
        suggestions: alert.suggestions
      });
    }
  }

  /**
   * Get API performance summary
   */
  private getAPIPerformanceSummary(): Record<string, unknown> {
    if (this.apiMetrics.length === 0) return { message: 'No API metrics collected yet' };

    const avgResponseTime = this.apiMetrics.reduce((sum, api) => sum + api.responseTime, 0) / this.apiMetrics.length;
    const errorRate = this.apiMetrics.filter(api => api.statusCode >= 400).length / this.apiMetrics.length;
    const slowRequests = this.apiMetrics.filter(api => api.responseTime > this.thresholds.apiResponse).length;

    return {
      totalRequests: this.apiMetrics.length,
      averageResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      slowRequests,
      cacheHitRate: this.apiMetrics.filter(api => api.cached).length / this.apiMetrics.length
    };
  }

  /**
   * Get component performance summary
   */
  private getComponentPerformanceSummary(): Record<string, unknown> {
    if (this.componentMetrics.size === 0) return { message: 'No component metrics collected yet' };

    const components = Array.from(this.componentMetrics.values());
    const avgRenderTime = components.reduce((sum, comp) => sum + comp.renderTime, 0) / components.length;
    const totalErrors = components.reduce((sum, comp) => sum + comp.errorCount, 0);

    return {
      totalComponents: components.length,
      averageRenderTime: Math.round(avgRenderTime),
      totalErrors,
      slowComponents: components.filter(comp => comp.renderTime > this.thresholds.componentRender).length
    };
  }

  /**
   * Get Study Builder performance summary
   */
  private getStudyBuilderPerformanceSummary(): Record<string, unknown> {
    if (this.studyBuilderMetrics.length === 0) return { message: 'No Study Builder metrics collected yet' };

    const avgLoadTime = this.studyBuilderMetrics.reduce((sum, study) => sum + study.loadTime, 0) / this.studyBuilderMetrics.length;
    const avgMemoryUsage = this.studyBuilderMetrics.reduce((sum, study) => sum + study.memoryUsage, 0) / this.studyBuilderMetrics.length;
    const slowLoads = this.studyBuilderMetrics.filter(study => study.loadTime > this.thresholds.studyBuilderLoad).length;

    return {
      totalStudies: this.studyBuilderMetrics.length,
      averageLoadTime: Math.round(avgLoadTime),
      averageMemoryUsage: Math.round(avgMemoryUsage / 1024 / 1024 * 100) / 100, // MB
      slowLoads
    };
  }

  /**
   * Get Web Vitals summary
   */
  private getWebVitalsSummary(): Record<string, unknown> {
    const lcp = this.metrics.get('lcp');
    const fid = this.metrics.get('fid');
    const cls = this.metrics.get('cls');

    return {
      lcp: lcp && lcp.length > 0 ? lcp[lcp.length - 1].value : null,
      fid: fid && fid.length > 0 ? fid[fid.length - 1].value : null,
      cls: cls && cls.length > 0 ? cls[cls.length - 1].value : null,
      thresholds: {
        lcp: this.thresholds.lcp,
        fid: this.thresholds.fid,
        cls: this.thresholds.cls
      }
    };
  }

  /**
   * Get active alerts
   */
  private getActiveAlerts(): PerformanceAlert[] {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return this.alerts.filter(alert => alert.timestamp > oneHourAgo);
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const recentAlerts = this.getActiveAlerts();

    if (recentAlerts.some(alert => alert.type === 'slow_response')) {
      recommendations.push('Consider implementing response caching and database optimization');
    }

    if (recentAlerts.some(alert => alert.type === 'memory_leak')) {
      recommendations.push('Review component lifecycle and cleanup procedures');
    }

    if (recentAlerts.some(alert => alert.type === 'error_spike')) {
      recommendations.push('Implement better error handling and monitoring');
    }

    const webVitals = this.getWebVitalsSummary();
    if (typeof webVitals.lcp === 'number' && webVitals.lcp > this.thresholds.lcp) {
      recommendations.push('Optimize images and reduce server response time for better LCP');
    }

    return recommendations;
  }

  /**
   * Start detailed monitoring
   */
  private startDetailedMonitoring(): void {
    // Enhanced monitoring every 30 seconds
    setInterval(() => {
      this.collectMemoryMetrics();
      this.analyzePerformanceTrends();
    }, 30000);
  }

  /**
   * Start periodic monitoring
   */
  private startMonitoring(): void {
    // Basic monitoring every 5 minutes
    setInterval(() => {
      this.analyzePerformanceTrends();
    }, 300000);
  }

  /**
   * Collect memory metrics
   */
  private collectMemoryMetrics(): void {
    if ('memory' in performance) {
      const memInfo = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      this.trackMetric('memory_used', memInfo.usedJSHeapSize, 'bytes');
      this.trackMetric('memory_total', memInfo.totalJSHeapSize, 'bytes');
      this.trackMetric('memory_limit', memInfo.jsHeapSizeLimit, 'bytes');
    }
  }

  /**
   * Analyze performance trends
   */
  private analyzePerformanceTrends(): void {
    const summary = this.getPerformanceSummary();
    
    // Log performance summary
    this.logToDebugConsole('Performance Intelligence Summary', summary);
  }

  /**
   * Log to debug console
   */
  private logToDebugConsole(message: string, data: Record<string, unknown>): void {
    if (import.meta.env.DEV) {
      import('./DevDebugConsole').then(({ default: console }) => {
        console.log(message, data, 'info');
      });
    }
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create singleton instance
const performanceIntelligence = new PerformanceIntelligence();

export default performanceIntelligence;
