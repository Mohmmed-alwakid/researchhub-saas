/**
 * Browser Performance Monitoring
 * Browser-specific performance monitoring and Web Vitals collection
 * Based on Vibe-Coder-MCP architectural patterns
 */

import { getPerformanceMonitor, PerformanceMetric } from './PerformanceMonitor';

/**
 * Web Vitals metrics interface
 */
interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Browser Performance Monitor - Browser-specific metrics
 */
export class BrowserPerformanceMonitor {
  private monitor = getPerformanceMonitor();
  private observer: PerformanceObserver | null = null;
  private mutationObserver: MutationObserver | null = null;

  /**
   * Initialize browser performance monitoring
   */
  initialize(): void {
    if (typeof window === 'undefined') {
      console.warn('BrowserPerformanceMonitor: Not in browser environment');
      return;
    }

    this.setupPerformanceObserver();
    this.setupMutationObserver();
    this.monitorPageVisibility();
    this.monitorNetworkStatus();
    
    console.log('BrowserPerformanceMonitor: Initialized');
  }

  /**
   * Setup Performance Observer for browser metrics
   */
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.processPerformanceEntry(entry);
          }
        });

        // Observe different types of performance entries
        this.observer.observe({ entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint'] });
      } catch (error) {
        console.warn('BrowserPerformanceMonitor: PerformanceObserver setup failed:', error);
      }
    }
  }

  /**
   * Setup Mutation Observer for DOM changes
   */
  private setupMutationObserver(): void {
    if ('MutationObserver' in window) {
      this.mutationObserver = new MutationObserver((mutations) => {
        const mutationCount = mutations.length;
        
        this.monitor.recordMetric(
          'render_time',
          'dom-mutations',
          mutationCount,
          'count',
          { type: 'mutations' },
          { 
            mutationTypes: mutations.map(m => m.type),
            timestamp: Date.now()
          }
        );
      });

      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true
      });
    }
  }

  /**
   * Process performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        this.processNavigationTiming(entry as PerformanceNavigationTiming);
        break;
      case 'resource':
        this.processResourceTiming(entry as PerformanceResourceTiming);
        break;
      case 'paint':
        this.processPaintTiming(entry);
        break;
      case 'largest-contentful-paint':
        this.processLCP(entry);
        break;
    }
  }

  /**
   * Process navigation timing
   */
  private processNavigationTiming(timing: PerformanceNavigationTiming): void {
    const metrics = {
      'page-load-total': timing.loadEventEnd - timing.navigationStart,
      'dom-content-loaded': timing.domContentLoadedEventEnd - timing.navigationStart,
      'first-byte': timing.responseStart - timing.requestStart,
      'dom-processing': timing.domComplete - timing.domLoading
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.monitor.recordMetric(
          'page_load',
          name,
          value,
          'ms',
          { type: 'navigation' },
          { timing: timing.toJSON() }
        );
      }
    });
  }

  /**
   * Process resource timing
   */
  private processResourceTiming(timing: PerformanceResourceTiming): void {
    const duration = timing.responseEnd - timing.requestStart;
    const transferSize = timing.transferSize || 0;
    
    this.monitor.recordMetric(
      'api_call',
      `resource-${this.getResourceType(timing.name)}`,
      duration,
      'ms',
      { 
        resourceType: this.getResourceType(timing.name),
        url: timing.name 
      },
      { 
        transferSize,
        encodedBodySize: timing.encodedBodySize || 0,
        decodedBodySize: timing.decodedBodySize || 0
      }
    );
  }

  /**
   * Process paint timing
   */
  private processPaintTiming(entry: PerformanceEntry): void {
    this.monitor.recordMetric(
      'render_time',
      entry.name,
      entry.startTime,
      'ms',
      { type: 'paint' },
      { entryType: entry.entryType }
    );
  }

  /**
   * Process Largest Contentful Paint
   */
  private processLCP(entry: PerformanceEntry): void {
    this.monitor.recordMetric(
      'render_time',
      'largest-contentful-paint',
      entry.startTime,
      'ms',
      { type: 'lcp' },
      { 
        element: (entry as any).element?.tagName || 'unknown',
        url: (entry as any).url || ''
      }
    );
  }

  /**
   * Monitor page visibility changes
   */
  private monitorPageVisibility(): void {
    document.addEventListener('visibilitychange', () => {
      this.monitor.recordMetric(
        'page_load',
        'visibility-change',
        Date.now(),
        'timestamp',
        { 
          visibility: document.hidden ? 'hidden' : 'visible' 
        },
        { timestamp: new Date().toISOString() }
      );
    });
  }

  /**
   * Monitor network status
   */
  private monitorNetworkStatus(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.monitor.recordMetric(
        'throughput',
        'network-connection',
        connection.downlink || 0,
        'mbps',
        { 
          effectiveType: connection.effectiveType || 'unknown',
          type: connection.type || 'unknown'
        },
        { 
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        }
      );

      connection.addEventListener('change', () => {
        this.monitor.recordMetric(
          'throughput',
          'network-change',
          connection.downlink || 0,
          'mbps',
          { 
            effectiveType: connection.effectiveType || 'unknown',
            type: connection.type || 'unknown'
          },
          { 
            rtt: connection.rtt || 0,
            saveData: connection.saveData || false
          }
        );
      });
    }
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    if (['js', 'mjs'].includes(extension)) return 'script';
    if (['css'].includes(extension)) return 'stylesheet';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) return 'font';
    if (url.includes('/api/')) return 'api';
    
    return 'document';
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }
}

/**
 * Web Vitals Collector - Core Web Vitals metrics
 */
export class WebVitalsCollector {
  private monitor = getPerformanceMonitor();

  /**
   * Initialize Web Vitals collection
   */
  async initialize(): Promise<void> {
    try {
      // Try to import web-vitals library dynamically
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      this.setupWebVitals({ getCLS, getFID, getFCP, getLCP, getTTFB });
    } catch (error) {
      // Fallback to manual collection if web-vitals library is not available
      console.warn('WebVitalsCollector: web-vitals library not available, using fallback methods');
      this.setupFallbackCollection();
    }
  }

  /**
   * Setup Web Vitals collection with library
   */
  private setupWebVitals(vitals: any): void {
    const onVital = (metric: WebVitalsMetric) => {
      this.monitor.recordMetric(
        'page_load',
        metric.name.toLowerCase(),
        metric.value,
        'ms',
        { 
          rating: metric.rating,
          id: metric.id 
        },
        { 
          delta: metric.delta,
          webVital: true
        }
      );
    };

    vitals.getCLS(onVital);
    vitals.getFID(onVital);
    vitals.getFCP(onVital);
    vitals.getLCP(onVital);
    vitals.getTTFB(onVital);
  }

  /**
   * Fallback Web Vitals collection
   */
  private setupFallbackCollection(): void {
    // Fallback First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.monitor.recordMetric(
                'page_load',
                'fcp',
                entry.startTime,
                'ms',
                { rating: this.getFCPRating(entry.startTime) },
                { webVital: true, fallback: true }
              );
            }
          }
        });
        observer.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('WebVitalsCollector: Fallback FCP collection failed:', error);
      }
    }

    // Fallback Time to First Byte
    if (window.performance?.timing) {
      const ttfb = window.performance.timing.responseStart - window.performance.timing.navigationStart;
      this.monitor.recordMetric(
        'page_load',
        'ttfb',
        ttfb,
        'ms',
        { rating: this.getTTFBRating(ttfb) },
        { webVital: true, fallback: true }
      );
    }
  }

  /**
   * Get FCP rating
   */
  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get TTFB rating
   */
  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }
}

/**
 * Resource Timing Analyzer - Analyze resource loading performance
 */
export class ResourceTimingAnalyzer {
  private monitor = getPerformanceMonitor();

  /**
   * Analyze all resource timing entries
   */
  analyzeResources(): void {
    if (!window.performance?.getEntriesByType) return;

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const analysis = {
      totalResources: resources.length,
      totalTransferSize: 0,
      totalDuration: 0,
      resourceTypes: {} as Record<string, number>,
      slowestResources: [] as PerformanceResourceTiming[]
    };

    resources.forEach(resource => {
      const duration = resource.responseEnd - resource.requestStart;
      const transferSize = resource.transferSize || 0;
      const resourceType = this.getResourceType(resource.name);

      analysis.totalTransferSize += transferSize;
      analysis.totalDuration += duration;
      analysis.resourceTypes[resourceType] = (analysis.resourceTypes[resourceType] || 0) + 1;
    });

    // Find slowest resources
    analysis.slowestResources = resources
      .sort((a, b) => (b.responseEnd - b.requestStart) - (a.responseEnd - a.requestStart))
      .slice(0, 5);

    // Record analysis metrics
    this.monitor.recordMetric(
      'page_load',
      'resource-analysis',
      analysis.totalDuration,
      'ms',
      { type: 'resource-analysis' },
      analysis
    );

    // Record individual slow resources
    analysis.slowestResources.forEach((resource, index) => {
      const duration = resource.responseEnd - resource.requestStart;
      this.monitor.recordMetric(
        'api_call',
        `slow-resource-${index + 1}`,
        duration,
        'ms',
        { 
          resourceType: this.getResourceType(resource.name),
          url: resource.name,
          rank: index + 1
        },
        {
          transferSize: resource.transferSize || 0,
          encodedBodySize: resource.encodedBodySize || 0
        }
      );
    });
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    if (['js', 'mjs'].includes(extension)) return 'script';
    if (['css'].includes(extension)) return 'stylesheet';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) return 'font';
    if (url.includes('/api/')) return 'api';
    
    return 'document';
  }

  /**
   * Get performance insights
   */
  getInsights(): string[] {
    const insights: string[] = [];
    
    if (!window.performance?.getEntriesByType) {
      insights.push('Performance API not available');
      return insights;
    }

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const avgDuration = resources.reduce((sum, r) => sum + (r.responseEnd - r.requestStart), 0) / resources.length;

    if (totalSize > 5 * 1024 * 1024) { // 5MB
      insights.push('Total resource size is large (>5MB). Consider optimizing images and assets.');
    }

    if (avgDuration > 1000) { // 1 second
      insights.push('Average resource load time is slow (>1s). Consider using a CDN or optimizing server response times.');
    }

    const imageResources = resources.filter(r => this.getResourceType(r.name) === 'image');
    if (imageResources.length > 20) {
      insights.push('High number of image requests. Consider image sprites or lazy loading.');
    }

    return insights;
  }
}
