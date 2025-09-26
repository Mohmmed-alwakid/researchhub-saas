import * as Sentry from '@sentry/react';
import { SentryUtils } from '../config/sentry';


/**
 * ResearchHub Sentry Performance Monitoring
 * Tracks application performance and user interactions
 */

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observers: Map<string, PerformanceObserver> = new Map();
  private transactions: Map<string, any> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    this.setupNavigationTracking();
    this.setupResourceTracking();
    this.setupUserInteractionTracking();
    this.setupCustomMetrics();
  }

  /**
   * Track page navigation performance
   */
  private setupNavigationTracking() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            
            Sentry.addBreadcrumb({
              message: 'Page navigation',
              category: 'navigation',
              data: {
                url: window.location.pathname,
                loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                firstContentfulPaint: this.getFirstContentfulPaint(),
                largestContentfulPaint: this.getLargestContentfulPaint()
              },
              level: 'info'
            });
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', observer);
    }
  }

  /**
   * Track resource loading performance
   */
  private setupResourceTracking() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Track slow resources (> 2 seconds)
            if (resourceEntry.duration > 2000) {
              SentryUtils.trackPerformanceIssue(
                'slow-resource', 
                resourceEntry.duration,
                {
                  name: resourceEntry.name,
                  type: this.getResourceType(resourceEntry.name),
                  size: resourceEntry.transferSize
                }
              );
            }
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', observer);
    }
  }

  /**
   * Track user interactions
   */
  private setupUserInteractionTracking() {
    // Track click interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const actionType = this.getActionType(target);
      
      if (actionType) {
        const transaction = Sentry.startTransaction({
          name: `User Interaction: ${actionType}`,
          op: 'ui.interaction'
        });

        Sentry.getCurrentScope().setSpan(transaction);
        
        // Finish transaction after a short delay to capture immediate effects
        setTimeout(() => {
          transaction.finish();
        }, 100);

        SentryUtils.trackParticipantAction(actionType, 'current-study', target.id);
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formName = form.name || form.id || 'unknown';
      
      const transaction = Sentry.startTransaction({
        name: `Form Submission: ${formName}`,
        op: 'ui.form.submit'
      });

      this.transactions.set(`form-${formName}`, transaction);
    });
  }

  /**
   * Setup custom ResearchHub metrics
   */
  private setupCustomMetrics() {
    // Study creation time tracking
    this.trackStudyCreationMetrics();
    
    // Participant engagement tracking
    this.trackParticipantEngagement();
    
    // API response time tracking
    this.trackAPIPerformance();
  }

  /**
   * Track study creation workflow performance
   */
  trackStudyCreationMetrics() {
    let studyCreationStart: number;

    // Listen for study creation start
    window.addEventListener('study-creation-start', () => {
      studyCreationStart = performance.now();
      
      const transaction = Sentry.startTransaction({
        name: 'Study Creation Workflow',
        op: 'researchhub.study.create'
      });
      
      this.transactions.set('study-creation', transaction);
    });

    // Listen for study creation completion
    window.addEventListener('study-creation-complete', (event: any) => {
      const duration = performance.now() - studyCreationStart;
      const transaction = this.transactions.get('study-creation');
      
      if (transaction) {
        transaction.setData('duration', duration);
        transaction.setData('studyData', event.detail);
        transaction.finish();
        this.transactions.delete('study-creation');
      }

      SentryUtils.trackStudyCreation(event.detail);
      
      // Track if creation was slow
      if (duration > 10000) { // > 10 seconds
        SentryUtils.trackPerformanceIssue('slow-study-creation', duration, event.detail);
      }
    });
  }

  /**
   * Track participant engagement metrics
   */
  trackParticipantEngagement() {
    const sessionStart = performance.now();
    let lastActivity = sessionStart;

    // Track activity
    ['click', 'keydown', 'scroll', 'mousemove'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        lastActivity = performance.now();
      }, { passive: true });
    });

    // Check for inactivity every 30 seconds
    setInterval(() => {
      const inactiveTime = performance.now() - lastActivity;
      
      if (inactiveTime > 60000) { // 1 minute of inactivity
        Sentry.addBreadcrumb({
          message: 'User inactive',
          category: 'user.engagement',
          data: {
            inactiveTime,
            sessionDuration: performance.now() - sessionStart
          },
          level: 'info'
        });
      }
    }, 30000);
  }

  /**
   * Track API performance
   */
  trackAPIPerformance() {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url] = args;
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        // Track API performance
        if (typeof url === 'string' && url.includes('/api/')) {
          SentryUtils.trackAPIError(url, null, { duration, status: response.status });
          
          if (duration > 5000) { // > 5 seconds
            SentryUtils.trackPerformanceIssue('slow-api', duration, { url, status: response.status });
          }
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        if (typeof url === 'string') {
          SentryUtils.trackAPIError(url, error, { duration });
        }
        
        throw error;
      }
    };
  }

  /**
   * Custom performance measurements
   */
  measureComponentRender(componentName: string, startTime: number) {
    const duration = performance.now() - startTime;
    
    Sentry.addBreadcrumb({
      message: `Component render: ${componentName}`,
      category: 'ui.render',
      data: {
        component: componentName,
        duration
      },
      level: duration > 100 ? 'warning' : 'info'
    });

    if (duration > 500) { // > 500ms
      SentryUtils.trackPerformanceIssue(`slow-render-${componentName}`, duration);
    }
  }

  /**
   * Measure custom operations
   */
  measureOperation(operationName: string, operation: () => Promise<any> | any) {
    const startTime = performance.now();
    
    const transaction = Sentry.startTransaction({
      name: operationName,
      op: 'custom.operation'
    });

    try {
      const result = operation();
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - startTime;
          transaction.setData('duration', duration);
          transaction.finish();
        });
      } else {
        const duration = performance.now() - startTime;
        transaction.setData('duration', duration);
        transaction.finish();
        return result;
      }
    } catch (error) {
      transaction.setStatus('internal_error');
      transaction.finish();
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
  }

  private getResourceType(name: string): string {
    if (name.includes('.js')) return 'script';
    if (name.includes('.css')) return 'stylesheet';
    if (name.includes('.png') || name.includes('.jpg') || name.includes('.svg')) return 'image';
    if (name.includes('/api/')) return 'api';
    return 'other';
  }

  private getActionType(element: HTMLElement): string | null {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const className = element.className;
    
    if (tag === 'button' || role === 'button') {
      if (className.includes('launch') || element.textContent?.includes('Launch')) return 'study-launch';
      if (className.includes('save') || element.textContent?.includes('Save')) return 'save';
      if (className.includes('delete') || element.textContent?.includes('Delete')) return 'delete';
      return 'button-click';
    }
    
    if (tag === 'a') return 'navigation';
    if (tag === 'input' || tag === 'textarea') return 'form-input';
    
    return null;
  }

  /**
   * Cleanup performance monitoring
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.transactions.clear();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
