/**
 * Performance Utilities
 * Helper classes and utilities for performance monitoring
 */

import { PerformanceMetric, MetricType, getPerformanceMonitor } from './PerformanceMonitor';

export class PerformanceUtils {
  /**
   * Format performance metric for display
   */
  static formatMetric(metric: PerformanceMetric): string {
    return `${metric.name}: ${metric.value}${metric.unit}`;
  }

  /**
   * Calculate metric severity based on thresholds
   */
  static calculateSeverity(value: number, thresholds: { warning: number; critical: number }): 'low' | 'medium' | 'high' | 'critical' {
    if (value > thresholds.critical) return 'critical';
    if (value > thresholds.warning) return 'high';
    if (value > thresholds.warning * 0.8) return 'medium';
    return 'low';
  }

  /**
   * Generate performance report
   */
  static generateReport(metrics: PerformanceMetric[]): string {
    const report = [
      'Performance Report',
      '==================',
      `Total Metrics: ${metrics.length}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Metrics:',
      ...metrics.map(m => `- ${this.formatMetric(m)}`)
    ];
    
    return report.join('\n');
  }
}

export class MetricCollector {
  private metrics: PerformanceMetric[] = [];

  collect(type: MetricType, name: string, value: number, unit: string = 'ms'): void {
    const monitor = getPerformanceMonitor();
    const metric = monitor.recordMetric(type, name, value, unit);
    this.metrics.push(metric);
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics = [];
  }
}

export class PerformanceReporter {
  /**
   * Log performance metrics to console
   */
  static logMetrics(metrics: PerformanceMetric[]): void {
    console.group('Performance Metrics');
    metrics.forEach(metric => {
      console.log(`${metric.name}: ${metric.value}${metric.unit}`, metric);
    });
    console.groupEnd();
  }

  /**
   * Send metrics to external service (placeholder)
   */
  static async sendMetrics(metrics: PerformanceMetric[], endpoint?: string): Promise<boolean> {
    try {
      // Placeholder implementation
      console.log('Sending metrics to endpoint:', endpoint, metrics);
      return true;
    } catch (error) {
      console.error('Failed to send metrics:', error);
      return false;
    }
  }
}

export class PerformanceIntegration {
  /**
   * Initialize performance monitoring integrations
   */
  static init(): void {
    // Placeholder for various performance monitoring integrations
    console.log('Performance integrations initialized');
  }

  /**
   * Connect to external monitoring services
   */
  static connectToService(serviceName: string, config: Record<string, unknown>): boolean {
    console.log(`Connecting to ${serviceName}:`, config);
    return true;
  }
}
