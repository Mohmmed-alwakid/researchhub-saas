/**
 * Application Performance Monitoring (APM) Service
 * Comprehensive APM system for production monitoring and optimization
 * 
 * Features:
 * - Application performance tracking and analysis
 * - Database performance monitoring
 * - API endpoint performance monitoring
 * - Error tracking and categorization
 * - Distributed tracing support
 * - Performance bottleneck identification
 */

export interface APMConfig {
  enabled: boolean;
  samplingRate: number;
  enableTracing: boolean;
  enableErrorTracking: boolean;
  enableDatabaseMonitoring: boolean;
  enableApiMonitoring: boolean;
  flushInterval: number;
}

export interface TransactionTrace {
  id: string;
  name: string;
  type: 'web' | 'api' | 'database' | 'background';
  startTime: number;
  endTime: number;
  duration: number;
  status: 'success' | 'error' | 'timeout';
  spans: SpanTrace[];
  metadata: TraceMetadata;
  errorDetails?: ErrorDetails;
}

export interface SpanTrace {
  id: string;
  parentId?: string;
  operation: string;
  service: string;
  startTime: number;
  endTime: number;
  duration: number;
  tags: Record<string, string>;
  logs: LogEntry[];
}

export interface TraceMetadata {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  responseSize?: number;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fingerprint: string;
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
  affectedUsers: number;
}

export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  fields: Record<string, string | number | boolean>;
}

interface PerformanceIssueData {
  type: 'slow_query' | 'memory_leak' | 'high_error_rate' | 'slow_response' | 'resource_exhaustion';
  duration?: number;
  query?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  success?: boolean;
  metadata?: Record<string, string | number | boolean>;
}

export interface APMMetrics {
  timestamp: number;
  transactions: {
    total: number;
    successful: number;
    failed: number;
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
    throughput: number;
  };
  errors: {
    total: number;
    rate: number;
    uniqueErrors: number;
    criticalErrors: number;
  };
  database: {
    queries: number;
    avgQueryTime: number;
    slowQueries: number;
    connectionPoolSize: number;
  };
  memory: {
    used: number;
    available: number;
    gcCount: number;
    gcDuration: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
}

export interface PerformanceIssue {
  id: string;
  type: 'slow_query' | 'memory_leak' | 'high_error_rate' | 'slow_response' | 'resource_exhaustion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedTransactions: string[];
  firstDetected: number;
  lastDetected: number;
  recommendations: string[];
  metrics: Record<string, number>;
}

export class APMService {
  private config: APMConfig;
  private traces: TransactionTrace[] = [];
  private activeSpans: Map<string, SpanTrace> = new Map();
  private errors: Map<string, ErrorDetails> = new Map();
  private metrics: APMMetrics[] = [];
  private issues: PerformanceIssue[] = [];
  private isActive: boolean = false;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<APMConfig>) {
    this.config = {
      enabled: true,
      samplingRate: 1.0,
      enableTracing: true,
      enableErrorTracking: true,
      enableDatabaseMonitoring: true,
      enableApiMonitoring: true,
      flushInterval: 30000,
      ...config
    };
  }

  /**
   * Initialize APM service
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('[APMService] APM is disabled');
      return;
    }

    console.log('[APMService] Initializing APM service...');

    try {
      // Set up error tracking
      if (this.config.enableErrorTracking) {
        await this.setupErrorTracking();
      }

      // Set up performance monitoring
      await this.setupPerformanceMonitoring();

      // Start metrics collection
      await this.startMetricsCollection();

      // Start automatic flushing
      this.startAutoFlush();

      this.isActive = true;
      console.log('[APMService] APM service initialized successfully');
    } catch (error) {
      console.error('[APMService] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Start a new transaction trace
   */
  startTransaction(
    name: string,
    type: 'web' | 'api' | 'database' | 'background',
    metadata?: Partial<TraceMetadata>
  ): string {
    if (!this.isActive || Math.random() > this.config.samplingRate) {
      return '';
    }

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    const trace: TransactionTrace = {
      id: transactionId,
      name,
      type,
      startTime,
      endTime: 0,
      duration: 0,
      status: 'success',
      spans: [],
      metadata: {
        ...metadata
      }
    };

    this.traces.push(trace);
    return transactionId;
  }

  /**
   * End a transaction trace
   */
  endTransaction(transactionId: string, status: 'success' | 'error' | 'timeout' = 'success'): void {
    if (!transactionId || !this.isActive) {
      return;
    }

    const trace = this.traces.find(t => t.id === transactionId);
    if (!trace) {
      return;
    }

    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;
    trace.status = status;

    console.log(`[APMService] Transaction completed: ${trace.name} (${trace.duration}ms)`);
  }

  /**
   * Start a span within a transaction
   */
  startSpan(
    transactionId: string,
    operation: string,
    service: string,
    parentSpanId?: string
  ): string {
    if (!transactionId || !this.isActive) {
      return '';
    }

    const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    const span: SpanTrace = {
      id: spanId,
      parentId: parentSpanId,
      operation,
      service,
      startTime,
      endTime: 0,
      duration: 0,
      tags: {},
      logs: []
    };

    this.activeSpans.set(spanId, span);

    // Add span to transaction
    const trace = this.traces.find(t => t.id === transactionId);
    if (trace) {
      trace.spans.push(span);
    }

    return spanId;
  }

  /**
   * End a span
   */
  endSpan(spanId: string, tags?: Record<string, string>): void {
    if (!spanId || !this.isActive) {
      return;
    }

    const span = this.activeSpans.get(spanId);
    if (!span) {
      return;
    }

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    
    if (tags) {
      span.tags = { ...span.tags, ...tags };
    }

    this.activeSpans.delete(spanId);
    console.log(`[APMService] Span completed: ${span.operation} (${span.duration}ms)`);
  }

  /**
   * Track an error
   */
  trackError(
    error: Error,
    transactionId?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    _metadata?: Record<string, string | number | boolean>
  ): void {
    if (!this.config.enableErrorTracking || !this.isActive) {
      return;
    }

    const fingerprint = this.generateErrorFingerprint(error);
    const now = Date.now();

    let errorDetails = this.errors.get(fingerprint);
    if (!errorDetails) {
      errorDetails = {
        message: error.message,
        stack: error.stack,
        type: error.name || 'Error',
        severity,
        fingerprint,
        occurrences: 0,
        firstSeen: now,
        lastSeen: now,
        affectedUsers: 0
      };
      this.errors.set(fingerprint, errorDetails);
    }

    errorDetails.occurrences++;
    errorDetails.lastSeen = now;

    // Add error to transaction if provided
    if (transactionId) {
      const trace = this.traces.find(t => t.id === transactionId);
      if (trace) {
        trace.errorDetails = errorDetails;
        trace.status = 'error';
      }
    }

    console.error(`[APMService] Error tracked: ${error.message} (${errorDetails.occurrences} occurrences)`);
  }

  /**
   * Track database query performance
   */
  trackDatabaseQuery(
    query: string,
    duration: number,
    success: boolean,
    _metadata?: Record<string, string | number | boolean>
  ): void {
    if (!this.config.enableDatabaseMonitoring || !this.isActive) {
      return;
    }

    // Track slow queries
    if (duration > 1000) { // 1 second threshold
      this.detectPerformanceIssue({
        type: 'slow_query',
        query,
        duration,
        success
      });
    }

    console.log(`[APMService] Database query tracked: ${duration}ms (${success ? 'success' : 'failed'})`);
  }

  /**
   * Track API endpoint performance
   */
  trackAPIEndpoint(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    _metadata?: Record<string, string | number | boolean>
  ): void {
    if (!this.config.enableApiMonitoring || !this.isActive) {
      return;
    }

    // Track slow API responses
    if (duration > 500) { // 500ms threshold
      this.detectPerformanceIssue({
        type: 'slow_response',
        endpoint,
        method,
        statusCode,
        duration
      });
    }

    console.log(`[APMService] API endpoint tracked: ${method} ${endpoint} (${duration}ms, ${statusCode})`);
  }

  /**
   * Get current APM metrics
   */
  getCurrentMetrics(): APMMetrics {
    const now = Date.now();
    const recentTraces = this.traces.filter(t => now - t.startTime <= 60000); // Last minute

    const transactions = {
      total: recentTraces.length,
      successful: recentTraces.filter(t => t.status === 'success').length,
      failed: recentTraces.filter(t => t.status === 'error').length,
      avgDuration: this.calculateAverageDuration(recentTraces),
      p95Duration: this.calculatePercentile(recentTraces, 95),
      p99Duration: this.calculatePercentile(recentTraces, 99),
      throughput: recentTraces.length
    };

    const recentErrors = Array.from(this.errors.values()).filter(e => now - e.lastSeen <= 60000);
    const errors = {
      total: recentErrors.reduce((sum, e) => sum + e.occurrences, 0),
      rate: transactions.total > 0 ? (transactions.failed / transactions.total) : 0,
      uniqueErrors: recentErrors.length,
      criticalErrors: recentErrors.filter(e => e.severity === 'critical').length
    };

    return {
      timestamp: now,
      transactions,
      errors,
      database: {
        queries: 0, // Would be tracked from actual database monitoring
        avgQueryTime: 0,
        slowQueries: 0,
        connectionPoolSize: 10
      },
      memory: {
        used: process.memoryUsage().heapUsed,
        available: process.memoryUsage().heapTotal,
        gcCount: 0,
        gcDuration: 0
      },
      cpu: {
        usage: 0, // Would be tracked from system monitoring
        loadAverage: [0, 0, 0]
      }
    };
  }

  /**
   * Get performance issues
   */
  getPerformanceIssues(): PerformanceIssue[] {
    return this.issues.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Get error summary
   */
  getErrorSummary(): {
    totalErrors: number;
    uniqueErrors: number;
    criticalErrors: number;
    errorRate: number;
    topErrors: ErrorDetails[];
  } {
    const errors = Array.from(this.errors.values());
    const totalErrors = errors.reduce((sum, e) => sum + e.occurrences, 0);
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const recentTransactions = this.traces.filter(t => Date.now() - t.startTime <= 3600000); // Last hour
    const errorRate = recentTransactions.length > 0 
      ? recentTransactions.filter(t => t.status === 'error').length / recentTransactions.length
      : 0;

    const topErrors = errors
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10);

    return {
      totalErrors,
      uniqueErrors: errors.length,
      criticalErrors,
      errorRate,
      topErrors
    };
  }

  /**
   * Generate APM report
   */
  async generateAPMReport(period: string = '1h'): Promise<{
    period: string;
    metrics: APMMetrics;
    transactions: TransactionTrace[];
    errors: ErrorDetails[];
    issues: PerformanceIssue[];
    insights: string[];
  }> {
    const periodMs = this.parsePeriod(period);
    const now = Date.now();
    const startTime = now - periodMs;

    const periodTransactions = this.traces.filter(t => t.startTime >= startTime);
    const periodErrors = Array.from(this.errors.values()).filter(e => e.lastSeen >= startTime);
    const periodIssues = this.issues.filter(i => i.lastDetected >= startTime);

    const insights = this.generateInsights(periodTransactions, periodErrors, periodIssues);

    return {
      period,
      metrics: this.getCurrentMetrics(),
      transactions: periodTransactions.slice(0, 100), // Limit to 100 recent transactions
      errors: periodErrors,
      issues: periodIssues,
      insights
    };
  }

  /**
   * Stop APM service
   */
  stop(): void {
    this.isActive = false;
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    console.log('[APMService] APM service stopped');
  }

  /**
   * Private helper methods
   */
  private async setupErrorTracking(): Promise<void> {
    console.log('[APMService] Setting up error tracking...');
    
    // Set up global error handlers
    if (typeof process !== 'undefined') {
      process.on('uncaughtException', (error) => {
        this.trackError(error, undefined, 'critical');
      });

      process.on('unhandledRejection', (reason) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        this.trackError(error, undefined, 'high');
      });
    }
  }

  private async setupPerformanceMonitoring(): Promise<void> {
    console.log('[APMService] Setting up performance monitoring...');
    // Initialize performance monitoring
  }

  private async startMetricsCollection(): Promise<void> {
    console.log('[APMService] Starting metrics collection...');
    
    setInterval(() => {
      const metrics = this.getCurrentMetrics();
      this.metrics.push(metrics);
      
      // Keep only recent metrics
      const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
    }, 60000); // Collect every minute
  }

  private startAutoFlush(): void {
    this.flushInterval = setInterval(async () => {
      await this.flush();
    }, this.config.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.traces.length === 0) {
      return;
    }

    console.log(`[APMService] Flushing ${this.traces.length} traces...`);
    
    // In production, this would send data to APM service
    // await this.sendToAPMService(this.traces);
    
    // Clean up old traces
    const cutoff = Date.now() - (60 * 60 * 1000); // 1 hour
    this.traces = this.traces.filter(t => t.startTime >= cutoff);
  }

  private generateErrorFingerprint(error: Error): string {
    const message = error.message || '';
    const type = error.name || 'Error';
    
    // Simple fingerprinting based on error type and message
    return `${type}:${message.substring(0, 100)}`.replace(/\s+/g, '_');
  }

  private detectPerformanceIssue(data: PerformanceIssueData): void {
    const issueId = `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const issue: PerformanceIssue = {
      id: issueId,
      type: data.type,
      severity: this.calculateIssueSeverity(data),
      title: this.generateIssueTitle(data),
      description: this.generateIssueDescription(data),
      affectedTransactions: [],
      firstDetected: now,
      lastDetected: now,
      recommendations: this.generateIssueRecommendations(data),
      metrics: data as unknown as Record<string, number>
    };

    this.issues.push(issue);
    console.warn(`[APMService] Performance issue detected: ${issue.title}`);
  }

  private calculateIssueSeverity(data: PerformanceIssueData): 'low' | 'medium' | 'high' | 'critical' {
    if (data.type === 'slow_query' && data.duration && data.duration > 5000) return 'critical';
    if (data.type === 'slow_response' && data.duration && data.duration > 2000) return 'high';
    if (data.type === 'memory_leak') return 'critical';
    if (data.type === 'high_error_rate') return 'high';
    return 'medium';
  }

  private generateIssueTitle(data: PerformanceIssueData): string {
    switch (data.type) {
      case 'slow_query':
        return `Slow Database Query (${data.duration}ms)`;
      case 'slow_response':
        return `Slow API Response (${data.duration}ms)`;
      case 'memory_leak':
        return 'Memory Leak Detected';
      case 'high_error_rate':
        return 'High Error Rate Detected';
      default:
        return 'Performance Issue Detected';
    }
  }

  private generateIssueDescription(data: PerformanceIssueData): string {
    switch (data.type) {
      case 'slow_query':
        return `Database query execution time exceeded threshold: ${data.duration}ms`;
      case 'slow_response':
        return `API endpoint response time exceeded threshold: ${data.duration}ms`;
      default:
        return 'Performance threshold exceeded';
    }
  }

  private generateIssueRecommendations(data: PerformanceIssueData): string[] {
    switch (data.type) {
      case 'slow_query':
        return [
          'Add database indexes for frequently queried columns',
          'Optimize query structure and joins',
          'Consider query result caching',
          'Review database connection pooling'
        ];
      case 'slow_response':
        return [
          'Implement response caching',
          'Optimize API endpoint logic',
          'Add request batching',
          'Scale server resources'
        ];
      default:
        return ['Review performance metrics and optimize accordingly'];
    }
  }

  private calculateAverageDuration(traces: TransactionTrace[]): number {
    if (traces.length === 0) return 0;
    const sum = traces.reduce((total, trace) => total + trace.duration, 0);
    return sum / traces.length;
  }

  private calculatePercentile(traces: TransactionTrace[], percentile: number): number {
    if (traces.length === 0) return 0;
    
    const sorted = traces.map(t => t.duration).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  private generateInsights(
    transactions: TransactionTrace[],
    errors: ErrorDetails[],
    issues: PerformanceIssue[]
  ): string[] {
    const insights: string[] = [];

    // Transaction insights
    if (transactions.length > 0) {
      const avgDuration = this.calculateAverageDuration(transactions);
      const errorRate = transactions.filter(t => t.status === 'error').length / transactions.length;

      if (avgDuration > 1000) {
        insights.push(`Average transaction duration is high: ${avgDuration.toFixed(0)}ms`);
      }
      
      if (errorRate > 0.05) {
        insights.push(`Error rate is elevated: ${(errorRate * 100).toFixed(1)}%`);
      }
    }

    // Error insights
    if (errors.length > 0) {
      const criticalErrors = errors.filter(e => e.severity === 'critical').length;
      if (criticalErrors > 0) {
        insights.push(`${criticalErrors} critical errors detected requiring immediate attention`);
      }
    }

    // Performance issue insights
    if (issues.length > 0) {
      const highSeverityIssues = issues.filter(i => i.severity === 'high' || i.severity === 'critical').length;
      if (highSeverityIssues > 0) {
        insights.push(`${highSeverityIssues} high-severity performance issues need resolution`);
      }
    }

    return insights;
  }

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
}
