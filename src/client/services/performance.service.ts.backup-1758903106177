import React from 'react';

/**
 * Performance Monitor and Issue Reporting System
 * Allows users to report performance issues and monitors application health
 */

// Extended Performance interface for Chrome's memory API
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  };
}

export interface PerformanceIssue {
  id: string;
  type: 'performance' | 'error' | 'ui_issue' | 'bug' | 'feature_request';
  description: string;
  url: string;
  userAgent: string;
  timestamp: string;
  performanceMetrics?: {
    loadTime: number;
    renderTime: number;
    memoryUsage?: number;
    networkRequests?: number;
  };
  screenshot?: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  networkRequests: number;
}

class PerformanceMonitor {
  private isMonitoring = false;
  private sessionId = this.generateSessionId();
  private performanceData: PerformanceMetrics[] = [];

  constructor() {
    this.initialize();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize() {
    // Start monitoring when page loads
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.startMonitoring();
      });

      // Monitor for errors
      window.addEventListener('error', (event) => {
        this.reportError({
          type: 'error',
          description: `JavaScript Error: ${event.error?.message || event.message}`,
          url: window.location.href,
          severity: 'high'
        });
      });

      // Monitor for unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.reportError({
          type: 'error',
          description: `Unhandled Promise Rejection: ${event.reason}`,
          url: window.location.href,
          severity: 'high'
        });
      });
    }
  }

  public startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Collect initial performance metrics
    this.collectPerformanceMetrics();
    
    // Set up periodic monitoring
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000); // Every 30 seconds
  }

  public stopMonitoring() {
    this.isMonitoring = false;
  }

  private collectPerformanceMetrics(): PerformanceMetrics | null {
    if (typeof window === 'undefined' || !window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    
    // Get memory info if available (Chrome only)
    const memoryInfo = (performance as PerformanceWithMemory).memory;
    
    const metrics: PerformanceMetrics = {
      pageLoadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      timeToFirstByte: navigation ? navigation.responseStart - navigation.requestStart : 0,
      firstContentfulPaint: fcp,
      largestContentfulPaint: 0, // Would need observer
      cumulativeLayoutShift: 0, // Would need observer
      firstInputDelay: 0, // Would need observer
      memoryUsage: memoryInfo ? (memoryInfo.usedJSHeapSize || 0) : 0,
      networkRequests: performance.getEntriesByType('resource').length
    };

    this.performanceData.push(metrics);
    
    // Keep only last 10 measurements
    if (this.performanceData.length > 10) {
      this.performanceData = this.performanceData.slice(-10);
    }

    return metrics;
  }

  public async reportIssue(issue: Partial<PerformanceIssue>): Promise<boolean> {
    try {
      const fullIssue: PerformanceIssue = {
        id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: issue.type || 'bug',
        description: issue.description || '',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        performanceMetrics: {
          loadTime: this.getCurrentPerformanceMetrics()?.pageLoadTime || 0,
          renderTime: this.getCurrentPerformanceMetrics()?.firstContentfulPaint || 0,
          memoryUsage: this.getCurrentPerformanceMetrics()?.memoryUsage,
          networkRequests: this.getCurrentPerformanceMetrics()?.networkRequests
        },
        sessionId: this.sessionId,
        severity: issue.severity || 'medium',
        status: 'open',
        ...issue
      };

      // Send to API endpoint
      const response = await fetch('/api/performance/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullIssue)
      });

      if (!response.ok) {
        throw new Error('Failed to report issue');
      }

      return true;
    } catch (error) {
      console.error('Error reporting issue:', error);
      return false;
    }
  }

  private async reportError(errorInfo: {
    type: 'error';
    description: string;
    url: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }) {
    await this.reportIssue(errorInfo);
  }

  private getCurrentPerformanceMetrics(): PerformanceMetrics | undefined {
    return this.performanceData[this.performanceData.length - 1];
  }

  public getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceData];
  }

  public async takeScreenshot(): Promise<string | null> {
    try {
      // For now, we'll skip screenshot functionality
      // In the future, this could use canvas API or external library
      return null;
    } catch (error) {
      console.warn('Screenshot capture failed:', error);
      return null;
    }
  }

  public getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        pixelDepth: screen.pixelDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for easy integration
export function usePerformanceMonitor() {
  const [isReporting, setIsReporting] = React.useState(false);

  const reportIssue = async (issue: Partial<PerformanceIssue>) => {
    setIsReporting(true);
    try {
      const success = await performanceMonitor.reportIssue(issue);
      return success;
    } finally {
      setIsReporting(false);
    }
  };

  const getPerformanceData = () => {
    return performanceMonitor.getPerformanceHistory();
  };

  const getSystemInfo = () => {
    return performanceMonitor.getSystemInfo();
  };

  return {
    reportIssue,
    getPerformanceData,
    getSystemInfo,
    isReporting
  };
}

export default PerformanceMonitor;
