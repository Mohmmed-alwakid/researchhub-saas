/**
 * Performance Monitor - Browser-focused performance monitoring
 * Simplified implementation for React application performance tracking
 */

export type MetricType = 
  | 'render_time' 
  | 'api_response_time' 
  | 'memory_usage' 
  | 'bundle_size' 
  | 'custom';

export type MetricSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface PerformanceMetric {
  id: string;
  type: MetricType;
  name: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  metadata: Record<string, unknown>;
  timestamp: Date;
  severity?: MetricSeverity;
}

export interface PerformanceSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  metrics: PerformanceMetric[];
  tags: Record<string, string>;
  metadata: Record<string, unknown>;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical';
  metric: PerformanceMetric;
  threshold: number;
  message: string;
  timestamp: Date;
}

export interface PerformanceAnalytics {
  avgRenderTime: number;
  avgApiResponseTime: number;
  memoryUsagePattern: number[];
  errorRate: number;
  bottlenecks: PerformanceBottleneck[];
  recommendations: PerformanceRecommendation[];
}

export interface PerformanceBottleneck {
  component: string;
  type: string;
  severity: MetricSeverity;
  impact: number;
  suggestions: string[];
}

export interface PerformanceRecommendation {
  id: string;
  title: string;
  description: string;
  priority: MetricSeverity;
  estimatedImpact: number;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  sampleRate: number;
  maxMetrics: number;
  alertThresholds: Record<string, number>;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private sessions: PerformanceSession[] = [];
  private alerts: PerformanceAlert[] = [];
  private timers: Map<string, number> = new Map();
  private config: PerformanceConfig;

  constructor(config?: Partial<PerformanceConfig>) {
    this.config = {
      enableMetrics: true,
      sampleRate: 1.0,
      maxMetrics: 1000,
      alertThresholds: {
        render_time: 100,
        api_response_time: 2000,
        memory_usage: 100 * 1024 * 1024 // 100MB
      },
      ...config
    };
  }

  recordMetric(
    type: MetricType,
    name: string,
    value: number,
    unit: string = 'ms',
    tags: Record<string, string> = {},
    metadata: Record<string, unknown> = {}
  ): PerformanceMetric {
    const metric: PerformanceMetric = {
      id: `${type}-${name}-${Date.now()}`,
      type,
      name,
      value,
      unit,
      tags,
      metadata,
      timestamp: new Date(),
      severity: this.calculateSeverity(type, value)
    };

    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }

    // Check for alerts
    this.checkAlerts(metric);

    return metric;
  }

  startTimer(timerId: string): void {
    this.timers.set(timerId, performance.now());
  }

  endTimer(
    timerId: string,
    type: MetricType = 'render_time',
    tags: Record<string, string> = {},
    metadata: Record<string, unknown> = {}
  ): PerformanceMetric | null {
    const startTime = this.timers.get(timerId);
    if (!startTime) {
      console.warn(`Timer ${timerId} not found`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(timerId);

    return this.recordMetric(type, timerId, duration, 'ms', tags, metadata);
  }

  startSession(tags: Record<string, string> = {}, metadata: Record<string, unknown> = {}): string {
    const sessionId = `session-${Date.now()}`;
    const session: PerformanceSession = {
      id: sessionId,
      startTime: new Date(),
      metrics: [],
      tags,
      metadata
    };

    this.sessions.push(session);
    return sessionId;
  }

  endSession(sessionId: string): PerformanceSession | null {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      return null;
    }

    session.endTime = new Date();
    return session;
  }

  getMetrics(type?: MetricType): PerformanceMetric[] {
    if (type) {
      return this.metrics.filter(m => m.type === type);
    }
    return [...this.metrics];
  }

  getAnalytics(): PerformanceAnalytics {
    const renderMetrics = this.getMetrics('render_time');
    const apiMetrics = this.getMetrics('api_response_time');
    const memoryMetrics = this.getMetrics('memory_usage');

    return {
      avgRenderTime: this.calculateAverage(renderMetrics),
      avgApiResponseTime: this.calculateAverage(apiMetrics),
      memoryUsagePattern: memoryMetrics.map(m => m.value),
      errorRate: this.calculateErrorRate(),
      bottlenecks: this.identifyBottlenecks(),
      recommendations: this.generateRecommendations()
    };
  }

  private calculateSeverity(type: MetricType, value: number): MetricSeverity {
    const threshold = this.config.alertThresholds[type];
    if (!threshold) return 'low';

    if (value > threshold * 2) return 'critical';
    if (value > threshold * 1.5) return 'high';
    if (value > threshold) return 'medium';
    return 'low';
  }

  private checkAlerts(metric: PerformanceMetric): void {
    const threshold = this.config.alertThresholds[metric.type];
    if (threshold && metric.value > threshold) {
      const alert: PerformanceAlert = {
        id: `alert-${Date.now()}`,
        type: metric.value > threshold * 2 ? 'critical' : 'warning',
        metric,
        threshold,
        message: `${metric.name} exceeded threshold: ${metric.value}${metric.unit} > ${threshold}${metric.unit}`,
        timestamp: new Date()
      };

      this.alerts.push(alert);
      console.warn('Performance Alert:', alert);
    }
  }

  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  private calculateErrorRate(): number {
    // Simple implementation - could be enhanced
    return 0;
  }

  private identifyBottlenecks(): PerformanceBottleneck[] {
    // Simple implementation - could be enhanced
    return [];
  }

  private generateRecommendations(): PerformanceRecommendation[] {
    // Simple implementation - could be enhanced
    return [];
  }
}

// Global instance
let globalMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor();
  }
  return globalMonitor;
}

export function initializePerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  globalMonitor = new PerformanceMonitor(config);
  return globalMonitor;
}

export const globalPerformanceMonitor = getPerformanceMonitor();
