/**
 * Performance Utilities and Helper Functions
 * Utility classes and functions for performance monitoring
 * Based on Vibe-Coder-MCP architectural patterns
 */

import { getPerformanceMonitor, PerformanceMetric, MetricType, PerformanceAnalytics } from './PerformanceMonitor';
import { globalDevTools } from '../dev-tools/DevToolsManager';
import { getJobManager } from '../jobs';
import { globalNotificationManager } from '../notifications';

/**
 * Performance Utilities - Static helper methods
 */
export class PerformanceUtils {
  /**
   * Format metric value with appropriate units
   */
  static formatMetric(metric: PerformanceMetric): string {
    const { value, unit, type } = metric;
    
    switch (type) {
      case 'memory_usage':
        return value > 1024 ? `${(value / 1024).toFixed(2)} GB` : `${value.toFixed(2)} MB`;
      case 'response_time':
      case 'api_call':
      case 'page_load':
      case 'render_time':
        return value > 1000 ? `${(value / 1000).toFixed(2)}s` : `${value.toFixed(2)}ms`;
      case 'throughput':
        return `${value.toFixed(2)} req/s`;
      case 'cpu_usage':
        return `${value.toFixed(1)}%`;
      default:
        return `${value.toFixed(2)} ${unit}`;
    }
  }

  /**
   * Calculate performance score based on thresholds
   */
  static calculateScore(metric: PerformanceMetric): number {
    if (!metric.threshold) return 100;
    
    const { value } = metric;
    const { warning, critical } = metric.threshold;
    
    if (value <= warning) return 100;
    if (value <= critical) return Math.max(0, 100 - ((value - warning) / (critical - warning)) * 50);
    return Math.max(0, 50 - ((value - critical) / critical) * 50);
  }

  /**
   * Get performance status based on metric value
   */
  static getStatus(metric: PerformanceMetric): 'excellent' | 'good' | 'warning' | 'critical' {
    const score = this.calculateScore(metric);
    
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'critical';
  }

  /**
   * Compare metrics and get trend
   */
  static getTrend(currentMetric: PerformanceMetric, previousMetric: PerformanceMetric): 'improving' | 'stable' | 'degrading' {
    const difference = currentMetric.value - previousMetric.value;
    const threshold = previousMetric.value * 0.05; // 5% threshold
    
    if (Math.abs(difference) <= threshold) return 'stable';
    return difference < 0 ? 'improving' : 'degrading';
  }

  /**
   * Generate performance recommendations
   */
  static generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = [];
    
    metrics.forEach(metric => {
      const status = this.getStatus(metric);
      
      if (status === 'critical' || status === 'warning') {
        switch (metric.type) {
          case 'memory_usage':
            recommendations.push('Consider implementing memory optimization techniques or garbage collection');
            break;
          case 'response_time':
          case 'api_call':
            recommendations.push('Optimize API calls with caching, connection pooling, or reduce payload size');
            break;
          case 'render_time':
            recommendations.push('Optimize React components with memoization, virtualization, or code splitting');
            break;
          case 'page_load':
            recommendations.push('Implement lazy loading, optimize images, or reduce bundle size');
            break;
          case 'database_query':
            recommendations.push('Add database indexes, optimize queries, or implement query caching');
            break;
        }
      }
    });
    
    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Export performance data for external analysis
   */
  static exportMetrics(metrics: PerformanceMetric[], format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['id', 'type', 'name', 'value', 'unit', 'timestamp', 'tags', 'metadata'];
      const rows = metrics.map(metric => [
        metric.id,
        metric.type,
        metric.name,
        metric.value.toString(),
        metric.unit,
        metric.timestamp.toISOString(),
        JSON.stringify(metric.tags),
        JSON.stringify(metric.metadata)
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(metrics, null, 2);
  }
}

/**
 * Metric Collector - Automated metric collection
 */
export class MetricCollector {
  private monitor = getPerformanceMonitor();
  private intervalId: NodeJS.Timeout | null = null;
  private isCollecting = false;

  /**
   * Start collecting system metrics
   */
  startCollection(interval = 10000): void {
    if (this.isCollecting) return;

    this.isCollecting = true;
    this.intervalId = setInterval(() => {
      this.collectSystemMetrics();
    }, interval);

    console.log(`MetricCollector: Started collecting metrics every ${interval}ms`);
  }

  /**
   * Stop collecting metrics
   */
  stopCollection(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isCollecting = false;
    console.log('MetricCollector: Stopped collecting metrics');
  }

  /**
   * Collect system-level metrics
   */
  private collectSystemMetrics(): void {
    // Memory metrics (if available)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage();
      this.monitor.recordMetric(
        'memory_usage',
        'system-memory',
        memory.heapUsed / 1024 / 1024,
        'MB',
        { type: 'heap-used' },
        memory
      );
    }

    // Performance timing metrics (browser)
    if (typeof performance !== 'undefined' && performance.timing) {
      const timing = performance.timing;
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      
      if (pageLoadTime > 0) {
        this.monitor.recordMetric(
          'page_load',
          'page-load-time',
          pageLoadTime,
          'ms',
          { type: 'full-load' },
          { timing }
        );
      }
    }
  }

  /**
   * Check if collector is running
   */
  isRunning(): boolean {
    return this.isCollecting;
  }
}

/**
 * Performance Reporter - Generate reports and summaries
 */
export class PerformanceReporter {
  private monitor = getPerformanceMonitor();

  /**
   * Generate daily performance report
   */
  async generateDailyReport(): Promise<string> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const today = new Date();
    
    const analytics = this.monitor.getAnalytics(yesterday, today);
    
    return this.formatReport(analytics, 'Daily Performance Report');
  }

  /**
   * Generate weekly performance report
   */
  async generateWeeklyReport(): Promise<string> {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    
    const analytics = this.monitor.getAnalytics(lastWeek, today);
    
    return this.formatReport(analytics, 'Weekly Performance Report');
  }

  /**
   * Format analytics into readable report
   */
  private formatReport(analytics: PerformanceAnalytics, title: string): string {
    const { summary, bottlenecks, recommendations } = analytics;
    
    let report = `# ${title}\n\n`;
    report += `**Period**: ${analytics.period.start.toLocaleDateString()} - ${analytics.period.end.toLocaleDateString()}\n\n`;
    
    // Summary section
    report += `## Summary\n`;
    report += `- Total Metrics: ${summary.totalMetrics}\n`;
    report += `- Average Response Time: ${summary.averageResponseTime.toFixed(2)}ms\n`;
    report += `- Peak Memory Usage: ${summary.peakMemoryUsage.toFixed(2)}MB\n`;
    report += `- Total Errors: ${summary.totalErrors}\n\n`;
    
    // Bottlenecks section
    if (bottlenecks.length > 0) {
      report += `## Performance Bottlenecks\n`;
      bottlenecks.forEach((bottleneck, index) => {
        report += `${index + 1}. **${bottleneck.operation}** (${bottleneck.type})\n`;
        report += `   - Average Time: ${bottleneck.averageTime.toFixed(2)}ms\n`;
        report += `   - Frequency: ${bottleneck.frequency} times\n`;
        report += `   - Impact: ${bottleneck.impact}\n`;
        report += `   - Suggestion: ${bottleneck.suggestion}\n\n`;
      });
    }
    
    // Recommendations section
    if (recommendations.length > 0) {
      report += `## Recommendations\n`;
      recommendations.forEach((rec, index) => {
        report += `${index + 1}. **${rec.title}** (${rec.priority})\n`;
        report += `   - Description: ${rec.description}\n`;
        report += `   - Action: ${rec.action}\n`;
        report += `   - Estimated Impact: ${rec.estimatedImpact}\n`;
        report += `   - Difficulty: ${rec.difficulty}\n\n`;
      });
    }
    
    return report;
  }
}

/**
 * Performance Integration - Integration with other ResearchHub systems
 */
export class PerformanceIntegration {
  private monitor = getPerformanceMonitor();

  /**
   * Integrate with Dev Tools for enhanced debugging
   */
  integrateWithDevTools(): void {
    if (globalDevTools) {
      // Subscribe to dev tools events
      globalDevTools.on('api-call-logged', (data) => {
        this.monitor.recordMetric(
          'api_call',
          `devtools-${data.method}-${data.url}`,
          data.duration || 0,
          'ms',
          { 
            method: data.method, 
            url: data.url,
            status: data.status?.toString() || 'unknown'
          },
          { source: 'dev-tools', ...data }
        );
      });

      console.log('PerformanceIntegration: Integrated with DevTools');
    }
  }

  /**
   * Integrate with Job Manager for background job performance
   */
  integrateWithJobManager(): void {
    const jobManager = getJobManager();
    
    if (jobManager) {
      // Monitor job execution times
      jobManager.on('job-completed', (job) => {
        const duration = job.completedAt ? job.completedAt.getTime() - job.createdAt.getTime() : 0;
        
        this.monitor.recordMetric(
          'study_creation',
          `job-${job.type}`,
          duration,
          'ms',
          { 
            jobType: job.type,
            jobId: job.id,
            status: job.status
          },
          {
            source: 'job-manager',
            job: {
              id: job.id,
              type: job.type,
              priority: job.priority
            }
          }
        );
      });

      console.log('PerformanceIntegration: Integrated with JobManager');
    }
  }

  /**
   * Integrate with Notification Manager for real-time alerts
   */
  integrateWithNotificationManager(): void {
    if (globalNotificationManager) {
      // Subscribe to performance alerts
      this.monitor.on('alert-triggered', (alert) => {
        globalNotificationManager.sendNotification({
          id: `perf-alert-${alert.id}`,
          type: 'performance',
          title: 'Performance Alert',
          message: alert.message,
          severity: alert.severity,
          timestamp: alert.timestamp,
          metadata: {
            metric: alert.metric,
            alertId: alert.id
          }
        });
      });

      console.log('PerformanceIntegration: Integrated with NotificationManager');
    }
  }

  /**
   * Initialize all integrations
   */
  initializeAll(): void {
    this.integrateWithDevTools();
    this.integrateWithJobManager();
    this.integrateWithNotificationManager();
    
    console.log('PerformanceIntegration: All integrations initialized');
  }
}
