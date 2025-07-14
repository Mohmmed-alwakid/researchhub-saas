/**
 * Performance Monitoring System for ResearchHub
 * Comprehensive performance tracking, metrics collection, and analysis
 * Based on Vibe-Coder-MCP architectural patterns
 */

import { EventEmitter } from 'events';
import { performance, PerformanceObserver } from 'perf_hooks';

// Performance Metric Types
export type MetricType = 
  | 'response_time'
  | 'throughput'
  | 'memory_usage'
  | 'cpu_usage'
  | 'database_query'
  | 'api_call'
  | 'page_load'
  | 'bundle_size'
  | 'render_time'
  | 'study_creation'
  | 'participant_session'
  | 'block_execution';

export type MetricSeverity = 'info' | 'warning' | 'critical';

export interface PerformanceMetric {
  id: string;
  type: MetricType;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  metadata: Record<string, unknown>;
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface PerformanceSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  metrics: PerformanceMetric[];
  tags: Record<string, string>;
  metadata: Record<string, unknown>;
}

export interface PerformanceAlert {
  id: string;
  severity: MetricSeverity;
  message: string;
  metric: PerformanceMetric;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface PerformanceAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalMetrics: number;
    averageResponseTime: number;
    peakMemoryUsage: number;
    totalErrors: number;
    slowestOperations: PerformanceMetric[];
    fastestOperations: PerformanceMetric[];
  };
  trends: {
    responseTimeTrend: number[];
    memoryUsageTrend: number[];
    throughputTrend: number[];
    errorRateTrend: number[];
  };
  bottlenecks: PerformanceBottleneck[];
  recommendations: PerformanceRecommendation[];
}

export interface PerformanceBottleneck {
  type: string;
  operation: string;
  averageTime: number;
  frequency: number;
  impact: 'low' | 'medium' | 'high';
  suggestion: string;
}

export interface PerformanceRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  estimatedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PerformanceConfig {
  enabled: boolean;
  bufferSize: number;
  flushInterval: number;
  enabledMetrics: MetricType[];
  thresholds: Record<MetricType, { warning: number; critical: number }>;
  alerting: {
    enabled: boolean;
    channels: string[];
  };
  storage: {
    enabled: boolean;
    retention: number; // days
    compression: boolean;
  };
}

/**
 * Performance Monitor - Core monitoring and metrics collection
 */
export class PerformanceMonitor extends EventEmitter {
  private config: PerformanceConfig;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private sessions: Map<string, PerformanceSession> = new Map();
  private alerts: Map<string, PerformanceAlert> = new Map();
  private observer: PerformanceObserver | null = null;
  private timers: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();
  private bufferFlushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    super();
    
    this.config = {
      enabled: true,
      bufferSize: 1000,
      flushInterval: 30000, // 30 seconds
      enabledMetrics: [
        'response_time',
        'memory_usage',
        'cpu_usage',
        'database_query',
        'api_call',
        'page_load',
        'study_creation',
        'participant_session'
      ],
      thresholds: {
        response_time: { warning: 1000, critical: 3000 },
        memory_usage: { warning: 512, critical: 1024 },
        cpu_usage: { warning: 70, critical: 90 },
        database_query: { warning: 500, critical: 2000 },
        api_call: { warning: 2000, critical: 5000 },
        page_load: { warning: 3000, critical: 8000 },
        bundle_size: { warning: 1024, critical: 2048 },
        render_time: { warning: 100, critical: 300 },
        study_creation: { warning: 5000, critical: 15000 },
        participant_session: { warning: 10000, critical: 30000 },
        block_execution: { warning: 2000, critical: 5000 },
        throughput: { warning: 10, critical: 5 }
      },
      alerting: {
        enabled: true,
        channels: ['console', 'notification']
      },
      storage: {
        enabled: true,
        retention: 30,
        compression: true
      },
      ...config
    };

    if (this.config.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    // Set up Performance Observer for Node.js performance metrics
    if (typeof PerformanceObserver !== 'undefined') {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          this.recordNodePerformanceEntry(entry);
        }
      });

      this.observer.observe({ entryTypes: ['measure', 'resource'] });
    }

    // Start buffer flush timer
    this.bufferFlushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.config.flushInterval);

    // Monitor memory usage periodically
    this.startMemoryMonitoring();
    
    this.emit('monitor-initialized');
  }

  /**
   * Record a performance metric
   */
  public recordMetric(
    type: MetricType,
    name: string,
    value: number,
    unit: string = 'ms',
    tags: Record<string, string> = {},
    metadata: Record<string, unknown> = {}
  ): PerformanceMetric {
    if (!this.config.enabled || !this.config.enabledMetrics.includes(type)) {
      return {} as PerformanceMetric;
    }

    const metric: PerformanceMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      type,
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
      metadata,
      threshold: this.config.thresholds[type]
    };

    this.metrics.set(metric.id, metric);
    this.emit('metric-recorded', metric);

    // Check thresholds and generate alerts
    this.checkThresholds(metric);

    // Auto-flush if buffer is full
    if (this.metrics.size >= this.config.bufferSize) {
      this.flushMetrics();
    }

    return metric;
  }

  /**
   * Start timing an operation
   */
  public startTimer(name: string, tags: Record<string, string> = {}): string {
    const timerId = `${name}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    this.timers.set(timerId, performance.now());
    
    this.emit('timer-started', { timerId, name, tags });
    return timerId;
  }

  /**
   * End timing an operation and record metric
   */
  public endTimer(
    timerId: string,
    type: MetricType = 'response_time',
    tags: Record<string, string> = {},
    metadata: Record<string, unknown> = {}
  ): PerformanceMetric | null {
    const startTime = this.timers.get(timerId);
    if (!startTime) {
      return null;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(timerId);

    const name = timerId.split('_')[0];
    const metric = this.recordMetric(type, name, duration, 'ms', tags, metadata);
    
    this.emit('timer-ended', { timerId, metric });
    return metric;
  }

  /**
   * Increment a counter
   */
  public incrementCounter(name: string, value: number = 1): number {
    const currentValue = this.counters.get(name) || 0;
    const newValue = currentValue + value;
    this.counters.set(name, newValue);
    
    this.emit('counter-incremented', { name, value: newValue });
    return newValue;
  }

  /**
   * Start a performance session
   */
  public startSession(
    name: string,
    tags: Record<string, string> = {},
    metadata: Record<string, unknown> = {}
  ): PerformanceSession {
    const session: PerformanceSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      name,
      startTime: new Date(),
      metrics: [],
      tags,
      metadata
    };

    this.sessions.set(session.id, session);
    this.emit('session-started', session);
    
    return session;
  }

  /**
   * End a performance session
   */
  public endSession(sessionId: string): PerformanceSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    session.endTime = new Date();
    session.duration = session.endTime.getTime() - session.startTime.getTime();

    // Collect metrics recorded during session
    session.metrics = Array.from(this.metrics.values()).filter(metric =>
      metric.timestamp >= session.startTime &&
      metric.timestamp <= (session.endTime || new Date())
    );

    this.emit('session-ended', session);
    return session;
  }

  /**
   * Get performance analytics for a time period
   */
  public getAnalytics(
    startTime: Date,
    endTime: Date = new Date()
  ): PerformanceAnalytics {
    const periodMetrics = Array.from(this.metrics.values()).filter(metric =>
      metric.timestamp >= startTime && metric.timestamp <= endTime
    );

    const analytics: PerformanceAnalytics = {
      period: { start: startTime, end: endTime },
      summary: this.calculateSummary(periodMetrics),
      trends: this.calculateTrends(periodMetrics),
      bottlenecks: this.identifyBottlenecks(periodMetrics),
      recommendations: this.generateRecommendations(periodMetrics)
    };

    return analytics;
  }

  /**
   * Get current performance snapshot
   */
  public getSnapshot(): {
    metrics: PerformanceMetric[];
    sessions: PerformanceSession[];
    alerts: PerformanceAlert[];
    system: {
      memoryUsage: NodeJS.MemoryUsage;
      uptime: number;
      loadAverage?: number[];
    };
  } {
    return {
      metrics: Array.from(this.metrics.values()).slice(-100), // Last 100 metrics
      sessions: Array.from(this.sessions.values()),
      alerts: Array.from(this.alerts.values()).filter(alert => !alert.resolved),
      system: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        loadAverage: process.platform !== 'win32' ? process.loadavg() : undefined
      }
    };
  }

  /**
   * Clear all metrics and reset
   */
  public clear(): void {
    this.metrics.clear();
    this.sessions.clear();
    this.alerts.clear();
    this.timers.clear();
    this.counters.clear();
    
    this.emit('monitor-cleared');
  }

  /**
   * Stop monitoring and cleanup
   */
  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.bufferFlushTimer) {
      clearInterval(this.bufferFlushTimer);
      this.bufferFlushTimer = null;
    }

    this.emit('monitor-stopped');
  }

  /**
   * Record Node.js performance entry
   */
  private recordNodePerformanceEntry(entry: any): void {
    let type: MetricType;
    let value: number;

    switch (entry.entryType) {
      case 'measure':
        type = 'response_time';
        value = entry.duration;
        break;
      case 'navigation':
        type = 'page_load';
        value = entry.loadEventEnd - entry.fetchStart;
        break;
      case 'resource':
        type = 'api_call';
        value = entry.responseEnd - entry.requestStart;
        break;
      default:
        return;
    }

    this.recordMetric(type, entry.name, value, 'ms', {
      entryType: entry.entryType
    });
  }

  /**
   * Check metric thresholds and generate alerts
   */
  private checkThresholds(metric: PerformanceMetric): void {
    if (!metric.threshold || !this.config.alerting.enabled) {
      return;
    }

    let severity: MetricSeverity | null = null;

    if (metric.value >= metric.threshold.critical) {
      severity = 'critical';
    } else if (metric.value >= metric.threshold.warning) {
      severity = 'warning';
    }

    if (severity) {
      const alert: PerformanceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        severity,
        message: `${metric.name} exceeded ${severity} threshold: ${metric.value}${metric.unit} (threshold: ${metric.threshold[severity]}${metric.unit})`,
        metric,
        timestamp: new Date(),
        resolved: false
      };

      this.alerts.set(alert.id, alert);
      this.emit('alert-generated', alert);

      // Send alert through configured channels
      this.sendAlert(alert);
    }
  }

  /**
   * Send alert through configured channels
   */
  private async sendAlert(alert: PerformanceAlert): Promise<void> {
    for (const channel of this.config.alerting.channels) {
      try {
        switch (channel) {
          case 'console':
            console.warn(`🚨 Performance Alert [${alert.severity.toUpperCase()}]: ${alert.message}`);
            break;
          case 'notification':
            this.emit('notification', {
              type: 'performance-alert',
              severity: alert.severity,
              message: alert.message,
              data: alert
            });
            break;
        }
      } catch (error) {
        console.error(`Failed to send alert via ${channel}:`, error);
      }
    }
  }

  /**
   * Flush metrics buffer
   */
  private flushMetrics(): void {
    if (this.metrics.size === 0) {
      return;
    }

    const metricsToFlush = Array.from(this.metrics.values());
    
    this.emit('metrics-flushed', {
      count: metricsToFlush.length,
      timestamp: new Date()
    });

    // Clear old metrics (keep only recent ones)
    const cutoffTime = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours
    for (const [id, metric] of this.metrics.entries()) {
      if (metric.timestamp < cutoffTime) {
        this.metrics.delete(id);
      }
    }
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    const monitorMemory = () => {
      const memUsage = process.memoryUsage();
      
      this.recordMetric(
        'memory_usage',
        'heap_used',
        memUsage.heapUsed / 1024 / 1024, // Convert to MB
        'MB',
        { type: 'heap' }
      );

      this.recordMetric(
        'memory_usage',
        'heap_total',
        memUsage.heapTotal / 1024 / 1024,
        'MB',
        { type: 'heap' }
      );

      this.recordMetric(
        'memory_usage',
        'rss',
        memUsage.rss / 1024 / 1024,
        'MB',
        { type: 'rss' }
      );
    };

    // Monitor memory every 10 seconds
    setInterval(monitorMemory, 10000);
  }

  /**
   * Calculate performance summary
   */
  private calculateSummary(metrics: PerformanceMetric[]): PerformanceAnalytics['summary'] {
    const responseTimeMetrics = metrics.filter(m => m.type === 'response_time');
    const memoryMetrics = metrics.filter(m => m.type === 'memory_usage');
    const errorMetrics = metrics.filter(m => m.tags.error === 'true');

    const avgResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0;

    const peakMemory = memoryMetrics.length > 0
      ? Math.max(...memoryMetrics.map(m => m.value))
      : 0;

    const sortedByValue = [...metrics].sort((a, b) => b.value - a.value);

    return {
      totalMetrics: metrics.length,
      averageResponseTime: avgResponseTime,
      peakMemoryUsage: peakMemory,
      totalErrors: errorMetrics.length,
      slowestOperations: sortedByValue.slice(0, 5),
      fastestOperations: sortedByValue.slice(-5).reverse()
    };
  }

  /**
   * Calculate performance trends
   */
  private calculateTrends(metrics: PerformanceMetric[]): PerformanceAnalytics['trends'] {
    // Group metrics by hour for trend analysis
    const hourlyGroups = new Map<number, PerformanceMetric[]>();
    
    metrics.forEach(metric => {
      const hour = new Date(metric.timestamp).getHours();
      if (!hourlyGroups.has(hour)) {
        hourlyGroups.set(hour, []);
      }
      hourlyGroups.get(hour)!.push(metric);
    });

    const hours = Array.from(hourlyGroups.keys()).sort();
    
    return {
      responseTimeTrend: hours.map(hour => {
        const hourMetrics = hourlyGroups.get(hour)!.filter(m => m.type === 'response_time');
        return hourMetrics.length > 0
          ? hourMetrics.reduce((sum, m) => sum + m.value, 0) / hourMetrics.length
          : 0;
      }),
      memoryUsageTrend: hours.map(hour => {
        const hourMetrics = hourlyGroups.get(hour)!.filter(m => m.type === 'memory_usage');
        return hourMetrics.length > 0
          ? Math.max(...hourMetrics.map(m => m.value))
          : 0;
      }),
      throughputTrend: hours.map(hour => {
        return hourlyGroups.get(hour)!.length; // Number of operations per hour
      }),
      errorRateTrend: hours.map(hour => {
        const hourMetrics = hourlyGroups.get(hour)!;
        const errorMetrics = hourMetrics.filter(m => m.tags.error === 'true');
        return hourMetrics.length > 0 ? (errorMetrics.length / hourMetrics.length) * 100 : 0;
      })
    };
  }

  /**
   * Identify performance bottlenecks
   */
  private identifyBottlenecks(metrics: PerformanceMetric[]): PerformanceBottleneck[] {
    const operationGroups = new Map<string, PerformanceMetric[]>();
    
    metrics.forEach(metric => {
      const key = `${metric.type}_${metric.name}`;
      if (!operationGroups.has(key)) {
        operationGroups.set(key, []);
      }
      operationGroups.get(key)!.push(metric);
    });

    const bottlenecks: PerformanceBottleneck[] = [];

    operationGroups.forEach((groupMetrics, operation) => {
      const avgTime = groupMetrics.reduce((sum, m) => sum + m.value, 0) / groupMetrics.length;
      const frequency = groupMetrics.length;
      
      // Consider it a bottleneck if average time is high and frequency is significant
      if (avgTime > 1000 && frequency > 5) { // More than 1 second average, more than 5 occurrences
        let impact: 'low' | 'medium' | 'high' = 'low';
        
        if (avgTime > 5000 || frequency > 50) impact = 'high';
        else if (avgTime > 2000 || frequency > 20) impact = 'medium';

        bottlenecks.push({
          type: groupMetrics[0].type,
          operation,
          averageTime: avgTime,
          frequency,
          impact,
          suggestion: this.generateBottleneckSuggestion(groupMetrics[0].type, avgTime, frequency)
        });
      }
    });

    return bottlenecks.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      return (impactWeight[b.impact] * b.averageTime) - (impactWeight[a.impact] * a.averageTime);
    });
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: PerformanceMetric[]): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];
    
    // Analyze response times
    const responseTimeMetrics = metrics.filter(m => m.type === 'response_time');
    if (responseTimeMetrics.length > 0) {
      const avgResponseTime = responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length;
      
      if (avgResponseTime > 2000) {
        recommendations.push({
          priority: 'high',
          title: 'Optimize Response Times',
          description: `Average response time is ${avgResponseTime.toFixed(2)}ms, which is above optimal range`,
          action: 'Implement caching, optimize database queries, and review slow endpoints',
          estimatedImpact: 'Improve user experience and reduce server load',
          difficulty: 'medium'
        });
      }
    }

    // Analyze memory usage
    const memoryMetrics = metrics.filter(m => m.type === 'memory_usage');
    if (memoryMetrics.length > 0) {
      const peakMemory = Math.max(...memoryMetrics.map(m => m.value));
      
      if (peakMemory > 512) { // 512 MB
        recommendations.push({
          priority: 'medium',
          title: 'Optimize Memory Usage',
          description: `Peak memory usage is ${peakMemory.toFixed(2)}MB`,
          action: 'Review memory leaks, optimize data structures, implement garbage collection tuning',
          estimatedImpact: 'Reduce server costs and improve stability',
          difficulty: 'medium'
        });
      }
    }

    // Analyze error rates
    const errorMetrics = metrics.filter(m => m.tags.error === 'true');
    if (errorMetrics.length > metrics.length * 0.05) { // More than 5% error rate
      recommendations.push({
        priority: 'critical',
        title: 'Reduce Error Rate',
        description: `Error rate is ${((errorMetrics.length / metrics.length) * 100).toFixed(2)}%`,
        action: 'Implement better error handling, add input validation, review failing operations',
        estimatedImpact: 'Improve user experience and system reliability',
        difficulty: 'medium'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }

  /**
   * Generate bottleneck suggestion
   */
  private generateBottleneckSuggestion(type: MetricType, avgTime: number, frequency: number): string {
    switch (type) {
      case 'database_query':
        return 'Consider adding database indexes, optimizing queries, or implementing query caching';
      case 'api_call':
        return 'Implement request batching, add response caching, or optimize API endpoints';
      case 'page_load':
        return 'Optimize bundle size, implement lazy loading, or add CDN for static assets';
      case 'study_creation':
        return 'Optimize study creation workflow, implement background processing, or cache common operations';
      case 'participant_session':
        return 'Optimize session handling, implement session pooling, or reduce session overhead';
      default:
        return `Optimize ${type} operations by implementing caching, reducing complexity, or improving algorithms`;
    }
  }
}

// Global performance monitor instance
export let globalPerformanceMonitor: PerformanceMonitor | null = null;

/**
 * Initialize global performance monitor
 */
export function initializePerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor(config);
  }
  return globalPerformanceMonitor;
}

/**
 * Get global performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor();
  }
  return globalPerformanceMonitor;
}
