/**
 * Production Performance Monitor
 * Comprehensive performance monitoring and optimization for production environments
 * 
 * Features:
 * - Real-time performance metrics collection
 * - Automated performance alerts and notifications
 * - Database and API performance optimization
 * - Frontend performance monitoring and analysis
 * - Performance baseline tracking and regression detection
 */

export interface PerformanceMetrics {
  timestamp: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  databaseLatency: number;
  apiLatency: number;
  frontendMetrics: FrontendMetrics;
}

export interface FrontendMetrics {
  pageLoadTime: number;
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  bundleSize: number;
  renderTime: number;
}

export interface PerformanceThresholds {
  responseTime: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  databaseLatency: number;
  pageLoadTime: number;
  cumulativeLayoutShift: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  message: string;
  recommendations: string[];
}

export interface PerformanceReport {
  period: string;
  metrics: PerformanceMetrics[];
  averages: PerformanceMetrics;
  trends: PerformanceTrends;
  alerts: PerformanceAlert[];
  optimizations: PerformanceOptimization[];
  score: number;
}

export interface PerformanceTrends {
  responseTimeTrend: number;
  throughputTrend: number;
  errorRateTrend: number;
  performanceScore: number;
  improvement: number;
}

export interface PerformanceOptimization {
  id: string;
  type: 'database' | 'api' | 'frontend' | 'cache' | 'network';
  issue: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
}

export class ProductionPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private alerts: PerformanceAlert[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = {
      responseTime: 500, // 500ms
      errorRate: 0.01, // 1%
      cpuUsage: 0.8, // 80%
      memoryUsage: 0.8, // 80%
      databaseLatency: 100, // 100ms
      pageLoadTime: 2000, // 2 seconds
      cumulativeLayoutShift: 0.1, // CLS score
      ...thresholds
    };
  }

  /**
   * Initialize performance monitoring
   */
  async initialize(): Promise<void> {
    try {
      console.log('[ProductionPerformanceMonitor] Initializing performance monitoring...');
      
      // Set up metric collection
      await this.setupMetricCollection();
      
      // Configure performance alerts
      await this.configureAlerts();
      
      // Initialize frontend monitoring
      await this.initializeFrontendMonitoring();
      
      console.log('[ProductionPerformanceMonitor] Performance monitoring initialized successfully');
    } catch (error) {
      console.error('[ProductionPerformanceMonitor] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Start performance monitoring
   */
  async startMonitoring(interval: number = 30000): Promise<void> {
    if (this.isMonitoring) {
      console.warn('[ProductionPerformanceMonitor] Monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log(`[ProductionPerformanceMonitor] Starting performance monitoring (interval: ${interval}ms)`);

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
    }, interval);

    // Collect initial metrics
    await this.collectMetrics();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('[ProductionPerformanceMonitor] Performance monitoring stopped');
  }

  /**
   * Collect performance metrics
   */
  private async collectMetrics(): Promise<PerformanceMetrics> {
    try {
      const timestamp = Date.now();
      
      // Collect system metrics
      const systemMetrics = await this.collectSystemMetrics();
      
      // Collect application metrics
      const appMetrics = await this.collectApplicationMetrics();
      
      // Collect frontend metrics
      const frontendMetrics = await this.collectFrontendMetrics();

      const metrics: PerformanceMetrics = {
        timestamp,
        responseTime: 0,
        throughput: 0,
        errorRate: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        databaseLatency: 0,
        apiLatency: 0,
        frontendMetrics,
        ...systemMetrics,
        ...appMetrics
      };

      // Store metrics
      this.metrics.push(metrics);
      
      // Keep only recent metrics (last 24 hours)
      this.cleanupOldMetrics();
      
      // Check for performance issues
      await this.checkPerformanceThresholds(metrics);

      return metrics;
    } catch (error) {
      console.error('[ProductionPerformanceMonitor] Failed to collect metrics:', error);
      throw error;
    }
  }

  /**
   * Collect system-level metrics
   */
  private async collectSystemMetrics(): Promise<Partial<PerformanceMetrics>> {
    // Simulate system metrics collection
    // In production, this would integrate with system monitoring tools
    return {
      cpuUsage: Math.random() * 0.6 + 0.1, // 10-70%
      memoryUsage: Math.random() * 0.5 + 0.2, // 20-70%
    };
  }

  /**
   * Collect application-level metrics
   */
  private async collectApplicationMetrics(): Promise<Partial<PerformanceMetrics>> {
    // Simulate application metrics collection
    // In production, this would integrate with APM tools
    return {
      responseTime: Math.random() * 300 + 100, // 100-400ms
      throughput: Math.random() * 1000 + 500, // 500-1500 req/min
      errorRate: Math.random() * 0.02, // 0-2%
      databaseLatency: Math.random() * 50 + 20, // 20-70ms
      apiLatency: Math.random() * 200 + 50, // 50-250ms
    };
  }

  /**
   * Collect frontend performance metrics
   */
  private async collectFrontendMetrics(): Promise<FrontendMetrics> {
    // Simulate frontend metrics collection
    // In production, this would use Web Vitals and Performance APIs
    return {
      pageLoadTime: Math.random() * 1000 + 500, // 500-1500ms
      timeToFirstByte: Math.random() * 200 + 100, // 100-300ms
      firstContentfulPaint: Math.random() * 800 + 400, // 400-1200ms
      largestContentfulPaint: Math.random() * 1500 + 800, // 800-2300ms
      cumulativeLayoutShift: Math.random() * 0.15, // 0-0.15
      firstInputDelay: Math.random() * 50 + 10, // 10-60ms
      bundleSize: Math.random() * 500 + 1000, // 1000-1500kb
      renderTime: Math.random() * 100 + 50, // 50-150ms
    };
  }

  /**
   * Check performance thresholds and generate alerts
   */
  private async checkPerformanceThresholds(metrics: PerformanceMetrics): Promise<void> {
    const checks = [
      {
        metric: 'responseTime',
        value: metrics.responseTime,
        threshold: this.thresholds.responseTime,
        message: `Response time (${metrics.responseTime.toFixed(0)}ms) exceeds threshold`,
        recommendations: [
          'Optimize database queries',
          'Implement caching strategy',
          'Scale server resources'
        ]
      },
      {
        metric: 'errorRate',
        value: metrics.errorRate,
        threshold: this.thresholds.errorRate,
        message: `Error rate (${(metrics.errorRate * 100).toFixed(2)}%) exceeds threshold`,
        recommendations: [
          'Review error logs for patterns',
          'Implement circuit breakers',
          'Add input validation'
        ]
      },
      {
        metric: 'cpuUsage',
        value: metrics.cpuUsage,
        threshold: this.thresholds.cpuUsage,
        message: `CPU usage (${(metrics.cpuUsage * 100).toFixed(1)}%) exceeds threshold`,
        recommendations: [
          'Scale horizontally',
          'Optimize algorithms',
          'Implement load balancing'
        ]
      },
      {
        metric: 'pageLoadTime',
        value: metrics.frontendMetrics.pageLoadTime,
        threshold: this.thresholds.pageLoadTime,
        message: `Page load time (${metrics.frontendMetrics.pageLoadTime.toFixed(0)}ms) exceeds threshold`,
        recommendations: [
          'Optimize bundle size',
          'Implement code splitting',
          'Use CDN for static assets'
        ]
      }
    ];

    for (const check of checks) {
      if (check.value > check.threshold) {
        const alert: PerformanceAlert = {
          id: `alert_${Date.now()}_${check.metric}`,
          type: check.value > check.threshold * 1.5 ? 'critical' : 'warning',
          metric: check.metric,
          value: check.value,
          threshold: check.threshold,
          timestamp: Date.now(),
          message: check.message,
          recommendations: check.recommendations
        };

        this.alerts.push(alert);
        await this.sendAlert(alert);
      }
    }
  }

  /**
   * Send performance alert
   */
  private async sendAlert(alert: PerformanceAlert): Promise<void> {
    console.warn(`[PERFORMANCE ALERT] ${alert.type.toUpperCase()}: ${alert.message}`);
    console.warn(`[PERFORMANCE ALERT] Recommendations:`, alert.recommendations);
    
    // In production, this would integrate with alerting systems
    // (email, Slack, PagerDuty, etc.)
  }

  /**
   * Generate performance report
   */
  async generateReport(period: string = '24h'): Promise<PerformanceReport> {
    const now = Date.now();
    const periodMs = this.parsePeriod(period);
    const startTime = now - periodMs;

    const periodMetrics = this.metrics.filter(m => m.timestamp >= startTime);
    
    if (periodMetrics.length === 0) {
      throw new Error(`No metrics available for period: ${period}`);
    }

    const averages = this.calculateAverages(periodMetrics);
    const trends = this.calculateTrends(periodMetrics);
    const optimizations = await this.generateOptimizations(periodMetrics);
    const score = this.calculatePerformanceScore(averages);

    return {
      period,
      metrics: periodMetrics,
      averages,
      trends,
      alerts: this.alerts.filter(a => a.timestamp >= startTime),
      optimizations,
      score
    };
  }

  /**
   * Calculate average metrics
   */
  private calculateAverages(metrics: PerformanceMetrics[]): PerformanceMetrics {
    const count = metrics.length;
    const sum = metrics.reduce((acc, metric) => ({
      timestamp: acc.timestamp,
      responseTime: acc.responseTime + metric.responseTime,
      throughput: acc.throughput + metric.throughput,
      errorRate: acc.errorRate + metric.errorRate,
      cpuUsage: acc.cpuUsage + metric.cpuUsage,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      databaseLatency: acc.databaseLatency + metric.databaseLatency,
      apiLatency: acc.apiLatency + metric.apiLatency,
      frontendMetrics: {
        pageLoadTime: acc.frontendMetrics.pageLoadTime + metric.frontendMetrics.pageLoadTime,
        timeToFirstByte: acc.frontendMetrics.timeToFirstByte + metric.frontendMetrics.timeToFirstByte,
        firstContentfulPaint: acc.frontendMetrics.firstContentfulPaint + metric.frontendMetrics.firstContentfulPaint,
        largestContentfulPaint: acc.frontendMetrics.largestContentfulPaint + metric.frontendMetrics.largestContentfulPaint,
        cumulativeLayoutShift: acc.frontendMetrics.cumulativeLayoutShift + metric.frontendMetrics.cumulativeLayoutShift,
        firstInputDelay: acc.frontendMetrics.firstInputDelay + metric.frontendMetrics.firstInputDelay,
        bundleSize: acc.frontendMetrics.bundleSize + metric.frontendMetrics.bundleSize,
        renderTime: acc.frontendMetrics.renderTime + metric.frontendMetrics.renderTime,
      }
    }), {
      timestamp: Date.now(),
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      databaseLatency: 0,
      apiLatency: 0,
      frontendMetrics: {
        pageLoadTime: 0,
        timeToFirstByte: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        bundleSize: 0,
        renderTime: 0,
      }
    });

    return {
      timestamp: sum.timestamp,
      responseTime: sum.responseTime / count,
      throughput: sum.throughput / count,
      errorRate: sum.errorRate / count,
      cpuUsage: sum.cpuUsage / count,
      memoryUsage: sum.memoryUsage / count,
      databaseLatency: sum.databaseLatency / count,
      apiLatency: sum.apiLatency / count,
      frontendMetrics: {
        pageLoadTime: sum.frontendMetrics.pageLoadTime / count,
        timeToFirstByte: sum.frontendMetrics.timeToFirstByte / count,
        firstContentfulPaint: sum.frontendMetrics.firstContentfulPaint / count,
        largestContentfulPaint: sum.frontendMetrics.largestContentfulPaint / count,
        cumulativeLayoutShift: sum.frontendMetrics.cumulativeLayoutShift / count,
        firstInputDelay: sum.frontendMetrics.firstInputDelay / count,
        bundleSize: sum.frontendMetrics.bundleSize / count,
        renderTime: sum.frontendMetrics.renderTime / count,
      }
    };
  }

  /**
   * Calculate performance trends
   */
  private calculateTrends(metrics: PerformanceMetrics[]): PerformanceTrends {
    if (metrics.length < 2) {
      return {
        responseTimeTrend: 0,
        throughputTrend: 0,
        errorRateTrend: 0,
        performanceScore: 0,
        improvement: 0
      };
    }

    const first = metrics[0];
    const last = metrics[metrics.length - 1];

    return {
      responseTimeTrend: (last.responseTime - first.responseTime) / first.responseTime,
      throughputTrend: (last.throughput - first.throughput) / first.throughput,
      errorRateTrend: (last.errorRate - first.errorRate) / (first.errorRate || 0.001),
      performanceScore: this.calculatePerformanceScore(last),
      improvement: this.calculatePerformanceScore(last) - this.calculatePerformanceScore(first)
    };
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    const scores = {
      responseTime: Math.max(0, 100 - (metrics.responseTime / this.thresholds.responseTime) * 100),
      errorRate: Math.max(0, 100 - (metrics.errorRate / this.thresholds.errorRate) * 100),
      cpuUsage: Math.max(0, 100 - (metrics.cpuUsage / this.thresholds.cpuUsage) * 100),
      memoryUsage: Math.max(0, 100 - (metrics.memoryUsage / this.thresholds.memoryUsage) * 100),
      pageLoadTime: Math.max(0, 100 - (metrics.frontendMetrics.pageLoadTime / this.thresholds.pageLoadTime) * 100)
    };

    return Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
  }

  /**
   * Generate performance optimizations
   */
  private async generateOptimizations(metrics: PerformanceMetrics[]): Promise<PerformanceOptimization[]> {
    const optimizations: PerformanceOptimization[] = [];
    const averages = this.calculateAverages(metrics);

    // Database optimization recommendations
    if (averages.databaseLatency > this.thresholds.databaseLatency * 0.8) {
      optimizations.push({
        id: 'db_optimization_1',
        type: 'database',
        issue: 'High database latency detected',
        recommendation: 'Add database indexes for frequently queried columns',
        impact: 'high',
        effort: 'medium',
        priority: 1
      });
    }

    // API optimization recommendations
    if (averages.responseTime > this.thresholds.responseTime * 0.8) {
      optimizations.push({
        id: 'api_optimization_1',
        type: 'api',
        issue: 'High API response time',
        recommendation: 'Implement response caching for frequently accessed endpoints',
        impact: 'high',
        effort: 'low',
        priority: 2
      });
    }

    // Frontend optimization recommendations
    if (averages.frontendMetrics.pageLoadTime > this.thresholds.pageLoadTime * 0.8) {
      optimizations.push({
        id: 'frontend_optimization_1',
        type: 'frontend',
        issue: 'Slow page load times',
        recommendation: 'Implement code splitting and lazy loading',
        impact: 'medium',
        effort: 'medium',
        priority: 3
      });
    }

    return optimizations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Set up metric collection infrastructure
   */
  private async setupMetricCollection(): Promise<void> {
    console.log('[ProductionPerformanceMonitor] Setting up metric collection...');
    // Initialize metric collection infrastructure
  }

  /**
   * Configure performance alerts
   */
  private async configureAlerts(): Promise<void> {
    console.log('[ProductionPerformanceMonitor] Configuring performance alerts...');
    // Configure alerting infrastructure
  }

  /**
   * Initialize frontend monitoring
   */
  private async initializeFrontendMonitoring(): Promise<void> {
    console.log('[ProductionPerformanceMonitor] Initializing frontend monitoring...');
    // Initialize frontend performance monitoring
  }

  /**
   * Parse period string to milliseconds
   */
  private parsePeriod(period: string): number {
    const units: Record<string, number> = {
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };

    const match = period.match(/^(\d+)([mhd])$/);
    if (!match) {
      throw new Error(`Invalid period format: ${period}`);
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get alert history
   */
  getAlerts(limit?: number): PerformanceAlert[] {
    return limit ? this.alerts.slice(-limit) : this.alerts;
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }
}
