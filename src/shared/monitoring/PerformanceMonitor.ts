/**
 * Performance Monitor - General performance monitoring service
 * Part of Vibe-Coder-MCP implementation
 */

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  timestamp: Date;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical';
  metric: keyof PerformanceMetrics;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  message: string;
}

export interface PerformanceConfig {
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
  };
  samplingInterval: number;
  retentionPeriod: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private config: PerformanceConfig;
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config?: Partial<PerformanceConfig>) {
    this.config = {
      alertThresholds: {
        responseTime: 1000, // 1 second
        errorRate: 5, // 5%
        cpuUsage: 80, // 80%
        memoryUsage: 90 // 90%
      },
      samplingInterval: 30000, // 30 seconds
      retentionPeriod: 86400000, // 24 hours
      ...config
    };
  }

  /**
   * Start performance monitoring
   */
  public async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.samplingInterval);

    console.log('🚀 Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  public async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    console.log('⏹️ Performance monitoring stopped');
  }

  /**
   * Collect current performance metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const metrics: PerformanceMetrics = {
        responseTime: await this.measureResponseTime(),
        throughput: await this.measureThroughput(),
        errorRate: await this.calculateErrorRate(),
        cpuUsage: await this.getCpuUsage(),
        memoryUsage: await this.getMemoryUsage(),
        timestamp: new Date()
      };

      this.metrics.push(metrics);
      this.checkAlerts(metrics);
      this.cleanupOldMetrics();

    } catch (error) {
      console.error('❌ Failed to collect performance metrics:', error);
    }
  }

  /**
   * Measure average response time
   */
  private async measureResponseTime(): Promise<number> {
    // Simulate response time measurement
    // In real implementation, would track actual API response times
    return 150 + Math.random() * 100; // 150-250ms
  }

  /**
   * Measure system throughput
   */
  private async measureThroughput(): Promise<number> {
    // Simulate throughput measurement
    // In real implementation, would track actual requests per second
    return 100 + Math.random() * 50; // 100-150 req/sec
  }

  /**
   * Calculate error rate percentage
   */
  private async calculateErrorRate(): Promise<number> {
    // Simulate error rate calculation
    // In real implementation, would track actual error rates
    return Math.random() * 2; // 0-2% error rate
  }

  /**
   * Get CPU usage percentage
   */
  private async getCpuUsage(): Promise<number> {
    try {
      // Simple CPU usage simulation
      // In real implementation, would use system monitoring
      return 20 + Math.random() * 30; // 20-50% usage
    } catch {
      return 0;
    }
  }

  /**
   * Get memory usage percentage
   */
  private async getMemoryUsage(): Promise<number> {
    try {
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memUsage = process.memoryUsage();
        const totalMemory = memUsage.heapTotal + memUsage.external;
        const usedMemory = memUsage.heapUsed;
        return (usedMemory / totalMemory) * 100;
      }
      return 45 + Math.random() * 15; // 45-60% usage
    } catch {
      return 0;
    }
  }

  /**
   * Check metrics against alert thresholds
   */
  private checkAlerts(metrics: PerformanceMetrics): void {
    // Check response time
    if (metrics.responseTime > this.config.alertThresholds.responseTime) {
      this.createAlert('critical', 'responseTime', metrics.responseTime);
    }

    // Check error rate
    if (metrics.errorRate > this.config.alertThresholds.errorRate) {
      this.createAlert('critical', 'errorRate', metrics.errorRate);
    }

    // Check CPU usage
    if (metrics.cpuUsage > this.config.alertThresholds.cpuUsage) {
      this.createAlert('warning', 'cpuUsage', metrics.cpuUsage);
    }

    // Check memory usage
    if (metrics.memoryUsage > this.config.alertThresholds.memoryUsage) {
      this.createAlert('critical', 'memoryUsage', metrics.memoryUsage);
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(
    type: 'warning' | 'critical',
    metric: keyof PerformanceMetrics,
    value: number
  ): void {
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      metric,
      threshold: this.config.alertThresholds[metric as keyof typeof this.config.alertThresholds],
      currentValue: value,
      timestamp: new Date(),
      message: `Performance alert: ${metric} exceeded threshold (${value.toFixed(2)})`
    };

    this.alerts.push(alert);
    console.warn(`🚨 Performance Alert: ${alert.message}`);
  }

  /**
   * Get current performance metrics
   */
  public getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get metrics history
   */
  public getMetricsHistory(limit = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get active alerts
   */
  public getAlerts(): PerformanceAlert[] {
    return this.alerts.slice();
  }

  /**
   * Clear all alerts
   */
  public clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    averageResponseTime: number;
    averageThroughput: number;
    averageErrorRate: number;
    averageCpuUsage: number;
    averageMemoryUsage: number;
    totalAlerts: number;
    criticalAlerts: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 0,
        averageThroughput: 0,
        averageErrorRate: 0,
        averageCpuUsage: 0,
        averageMemoryUsage: 0,
        totalAlerts: 0,
        criticalAlerts: 0
      };
    }

    const recentMetrics = this.metrics.slice(-20); // Last 20 readings

    return {
      averageResponseTime: recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length,
      averageThroughput: recentMetrics.reduce((sum, m) => sum + m.throughput, 0) / recentMetrics.length,
      averageErrorRate: recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length,
      averageCpuUsage: recentMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / recentMetrics.length,
      averageMemoryUsage: recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length,
      totalAlerts: this.alerts.length,
      criticalAlerts: this.alerts.filter(a => a.type === 'critical').length
    };
  }

  /**
   * Clean up old metrics beyond retention period
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoffTime);
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Export metrics to JSON
   */
  public exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      alerts: this.alerts,
      summary: this.getPerformanceSummary(),
      config: this.config,
      exportTime: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Reset all data
   */
  public reset(): void {
    this.metrics = [];
    this.alerts = [];
  }

  /**
   * Get monitoring status
   */
  public getStatus(): {
    isMonitoring: boolean;
    metricsCount: number;
    alertsCount: number;
    lastMetricTime: Date | null;
  } {
    return {
      isMonitoring: this.isMonitoring,
      metricsCount: this.metrics.length,
      alertsCount: this.alerts.length,
      lastMetricTime: this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].timestamp : null
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Default export
export default PerformanceMonitor;
