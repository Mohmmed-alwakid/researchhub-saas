import { EventEmitter } from 'events';


/**
 * Production Monitoring Framework
 * Comprehensive monitoring and analytics for ResearchHub production deployment
 * Part of Vibe-Coder-MCP Phase 4 implementation
 */

// Configuration interfaces
export interface MonitoringConfig {
  enabled: boolean;
  apm: APMConfig;
  alerts: AlertConfig;
  metrics: MetricsConfig;
  analytics: AnalyticsConfig;
}

export interface APMConfig {
  enabled: boolean;
  sampleRate: number;
  enableTracing: boolean;
  enableProfiling: boolean;
  customMetrics: string[];
}

export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: AlertThresholds;
  cooldown: number;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook';
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface AlertThresholds {
  errorRate: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface MetricsConfig {
  enabled: boolean;
  interval: number;
  retention: number;
  customMetrics: string[];
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackUserBehavior: boolean;
  trackBusinessMetrics: boolean;
  anonymizeData: boolean;
}

// Core monitoring classes
export class ProductionMonitor extends EventEmitter {
  private config: MonitoringConfig;
  private apm: APMService;
  private alertManager: AlertManager;
  private metricsCollector: MetricsCollector;
  private analytics: AnalyticsService;
  private isInitialized = false;

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;
    this.apm = new APMService(config.apm);
    this.alertManager = new AlertManager(config.alerts);
    this.metricsCollector = new MetricsCollector(config.metrics);
    this.analytics = new AnalyticsService(config.analytics);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🚀 Initializing Production Monitor...');
      
      if (this.config.enabled) {
        await this.setupServices();
        await this.startMonitoring();
        this.isInitialized = true;
        console.log('✅ Production Monitor initialized successfully');
        this.emit('initialized');
      } else {
        console.log('⚠️ Production Monitor disabled in configuration');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Production Monitor:', error);
      this.emit('error', error);
      throw error;
    }
  }

  private async setupServices(): Promise<void> {
    const promises = [];

    if (this.config.apm.enabled) {
      promises.push(this.apm.initialize());
    }

    if (this.config.alerts.enabled) {
      promises.push(this.alertManager.initialize());
    }

    if (this.config.metrics.enabled) {
      promises.push(this.metricsCollector.initialize());
    }

    if (this.config.analytics.enabled) {
      promises.push(this.analytics.initialize());
    }

    await Promise.all(promises);
  }

  private async startMonitoring(): Promise<void> {
    // Start monitoring services
    this.apm.startTracing();
    this.metricsCollector.startCollection();
    this.analytics.startTracking();

    // Set up error handling
    this.setupErrorHandling();

    // Set up health checks
    this.setupHealthChecks();
  }

  private setupErrorHandling(): void {
    // Global error handling
    process.on('uncaughtException', (error) => {
      this.handleCriticalError('uncaughtException', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.handleCriticalError('unhandledRejection', reason, { promise });
    });
  }

  private setupHealthChecks(): void {
    // Periodic health checks
    setInterval(async () => {
      try {
        const health = await this.checkHealth();
        this.emit('healthCheck', health);
        
        if (!health.healthy) {
          await this.alertManager.sendAlert('health', 'System health check failed', health);
        }
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 60000); // Every minute
  }

  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkAPIHealth(),
      this.checkSystemResources(),
    ]);

    const results = checks.map((result, index) => ({
      check: ['database', 'api', 'system'][index],
      status: result.status === 'fulfilled' ? result.value : { healthy: false, error: result.reason }
    }));

    const healthy = results.every(result => result.status.healthy);

    return {
      healthy,
      timestamp: new Date().toISOString(),
      checks: results
    };
  }

  private async checkDatabaseHealth(): Promise<{ healthy: boolean; responseTime?: number; error?: string }> {
    try {
      const start = Date.now();
      // Simple database ping
      await this.pingDatabase();
      const responseTime = Date.now() - start;
      
      return { healthy: true, responseTime };
    } catch (error) {
      return { healthy: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async checkAPIHealth(): Promise<{ healthy: boolean; responseTime?: number; error?: string }> {
    try {
      const start = Date.now();
      // Health endpoint check
      await this.pingAPI();
      const responseTime = Date.now() - start;
      
      return { healthy: true, responseTime };
    } catch (error) {
      return { healthy: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async checkSystemResources(): Promise<{ healthy: boolean; usage?: SystemUsage; error?: string }> {
    try {
      const usage = await this.getSystemUsage();
      const healthy = usage.cpu < 90 && usage.memory < 90 && usage.disk < 95;
      
      return { healthy, usage };
    } catch (error) {
      return { healthy: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async pingDatabase(): Promise<void> {
    // Mock database ping - replace with actual implementation
    return new Promise((resolve) => setTimeout(resolve, 10));
  }

  private async pingAPI(): Promise<void> {
    // Mock API ping - replace with actual implementation
    return new Promise((resolve) => setTimeout(resolve, 5));
  }

  private async getSystemUsage(): Promise<SystemUsage> {
    // Mock system usage - replace with actual implementation
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100
    };
  }

  private handleCriticalError(type: string, error: unknown, context?: unknown): void {
    console.error(`Critical error (${type}):`, error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    this.alertManager.sendAlert('critical', `Critical error: ${type}`, {
      error: errorMessage,
      stack: errorStack,
      context
    }).catch(alertError => {
      console.error('Failed to send critical error alert:', alertError);
    });
  }

  // Public API methods
  async trackMetric(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    return this.metricsCollector.track(name, value, tags);
  }

  async trackEvent(event: string, properties?: Record<string, unknown>): Promise<void> {
    return this.analytics.trackEvent(event, properties);
  }

  async sendAlert(level: string, message: string, data?: unknown): Promise<void> {
    return this.alertManager.sendAlert(level, message, data);
  }

  getMetrics(): Promise<Record<string, MetricData[]>> {
    return this.metricsCollector.getMetrics();
  }

  getAnalytics(): Promise<AnalyticsData> {
    return this.analytics.getAnalytics();
  }
}

// Supporting service classes
class APMService {
  private config: APMConfig;

  constructor(config: APMConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('🔧 Initializing APM Service...');
    // APM initialization logic
  }

  startTracing(): void {
    if (this.config.enableTracing) {
      console.log('📊 APM tracing started');
      // Start tracing
    }
  }
}

class AlertManager {
  private config: AlertConfig;
  private lastAlerts: Map<string, number> = new Map();

  constructor(config: AlertConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('🚨 Initializing Alert Manager...');
    // Alert manager initialization
  }

  async sendAlert(level: string, message: string, data?: unknown): Promise<void> {
    const alertKey = `${level}:${message}`;
    const now = Date.now();
    const lastAlert = this.lastAlerts.get(alertKey);

    // Cooldown check
    if (lastAlert && (now - lastAlert) < this.config.cooldown) {
      return;
    }

    this.lastAlerts.set(alertKey, now);

    // Send to all enabled channels
    const promises = this.config.channels
      .filter(channel => channel.enabled)
      .map(channel => this.sendToChannel(channel, level, message, data));

    await Promise.allSettled(promises);
  }

  private async sendToChannel(channel: AlertChannel, level: string, message: string, data?: unknown): Promise<void> {
    try {
      console.log(`📤 Sending ${level} alert to ${channel.type}: ${message}`);
      // Channel-specific sending logic would use 'data' parameter
      if (data) {
        console.log('Alert data:', data);
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel.type}:`, error);
    }
  }
}

class MetricsCollector {
  private config: MetricsConfig;
  private metrics: Map<string, MetricData> = new Map();

  constructor(config: MetricsConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('📈 Initializing Metrics Collector...');
    // Metrics collector initialization
  }

  startCollection(): void {
    console.log('📊 Metrics collection started');
    
    // Collect system metrics periodically
    setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.interval);
  }

  async track(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    const metric: MetricData = {
      name,
      value,
      tags: tags || {},
      timestamp: new Date().toISOString()
    };

    this.metrics.set(`${name}:${Date.now()}`, metric);
    
    // Cleanup old metrics based on retention policy
    this.cleanupOldMetrics();
  }

  private collectSystemMetrics(): void {
    // Collect built-in system metrics
    
    // Mock system metrics
    this.track('system.cpu', Math.random() * 100);
    this.track('system.memory', Math.random() * 100);
    this.track('system.disk', Math.random() * 100);
  }

  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - this.config.retention;
    
    for (const [key, metric] of this.metrics) {
      if (new Date(metric.timestamp).getTime() < cutoff) {
        this.metrics.delete(key);
      }
    }
  }

  async getMetrics(): Promise<Record<string, MetricData[]>> {
    const grouped: Record<string, MetricData[]> = {};
    
    for (const metric of this.metrics.values()) {
      if (!grouped[metric.name]) {
        grouped[metric.name] = [];
      }
      grouped[metric.name].push(metric);
    }

    return grouped;
  }
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private events: AnalyticsEvent[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('📊 Initializing Analytics Service...');
    // Analytics service initialization
  }

  startTracking(): void {
    console.log('👥 Analytics tracking started');
  }

  async trackEvent(event: string, properties?: Record<string, unknown>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: this.config.anonymizeData ? this.anonymizeProperties(properties) : properties,
      timestamp: new Date().toISOString()
    };

    this.events.push(analyticsEvent);
  }

  private anonymizeProperties(properties?: Record<string, unknown>): Record<string, unknown> {
    if (!properties) return {};
    
    // Simple anonymization - replace with proper implementation
    const anonymized = { ...properties };
    delete anonymized.email;
    delete anonymized.userId;
    delete anonymized.ip;
    
    return anonymized;
  }

  async getAnalytics(): Promise<AnalyticsData> {
    return {
      totalEvents: this.events.length,
      events: this.events.slice(-100), // Last 100 events
      summary: this.generateSummary()
    };
  }

  private generateSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    
    for (const event of this.events) {
      summary[event.event] = (summary[event.event] || 0) + 1;
    }
    
    return summary;
  }
}

// Type definitions
export interface HealthStatus {
  healthy: boolean;
  timestamp: string;
  checks: Array<{
    check: string;
    status: { healthy: boolean; responseTime?: number; usage?: SystemUsage; error?: string };
  }>;
}

export interface SystemUsage {
  cpu: number;
  memory: number;
  disk: number;
}

export interface MetricData {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: string;
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

export interface AnalyticsData {
  totalEvents: number;
  events: AnalyticsEvent[];
  summary: Record<string, number>;
}

// Default configuration
export const defaultMonitoringConfig: MonitoringConfig = {
  enabled: true,
  apm: {
    enabled: true,
    sampleRate: 0.1,
    enableTracing: true,
    enableProfiling: false,
    customMetrics: ['api.response_time', 'db.query_time', 'user.actions']
  },
  alerts: {
    enabled: true,
    channels: [
      {
        type: 'email',
        config: { recipients: ['admin@researchhub.com'] },
        enabled: true
      }
    ],
    thresholds: {
      errorRate: 5.0, // 5% error rate
      responseTime: 2000, // 2 seconds
      cpuUsage: 80,
      memoryUsage: 85,
      diskUsage: 90
    },
    cooldown: 300000 // 5 minutes
  },
  metrics: {
    enabled: true,
    interval: 30000, // 30 seconds
    retention: 86400000, // 24 hours
    customMetrics: ['business.studies_created', 'business.participants_registered']
  },
  analytics: {
    enabled: true,
    trackUserBehavior: true,
    trackBusinessMetrics: true,
    anonymizeData: true
  }
};

// Singleton instance
let productionMonitor: ProductionMonitor | null = null;

export function getProductionMonitor(config?: MonitoringConfig): ProductionMonitor {
  if (!productionMonitor) {
    productionMonitor = new ProductionMonitor(config || defaultMonitoringConfig);
  }
  return productionMonitor;
}

export function initializeProductionMonitoring(config?: MonitoringConfig): Promise<ProductionMonitor> {
  const monitor = getProductionMonitor(config);
  return monitor.initialize().then(() => monitor);
}
