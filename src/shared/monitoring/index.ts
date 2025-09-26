import { createMonitoringSystem } from './monitoring';
import { ProductionMonitoringDashboard, DashboardConfig } from './ProductionMonitoringDashboard';


/**
 * Production Monitoring System
 * Complete monitoring infrastructure for ResearchHub production environment
 * 
 * This module provides a comprehensive monitoring solution that combines:
 * - Performance monitoring and optimization
 * - Real-time analytics and user behavior tracking
 * - Unified dashboard with health status and alerts
 * - Executive reporting and business intelligence
 * 
 * Usage:
 * ```typescript
 *  * 
 * const monitoring = createMonitoringSystem({
 *   performance: { enabled: true },
 *   analytics: { enabled: true },
 *   dashboard: { refreshInterval: 60000 }
 * });
 * 
 * await monitoring.initialize();
 * ```
 */

export { ProductionMonitor } from './ProductionMonitor';
export { ProductionPerformanceMonitor } from './ProductionPerformanceMonitor';
export { PerformanceMonitor } from './PerformanceMonitor';
export { RealTimeAnalytics } from './RealTimeAnalytics';
export { ProductionMonitoringDashboard } from './ProductionMonitoringDashboard';
export { APMService } from './APMService';
export { HealthCheckService } from './HealthCheckService';
export { ProductionDeploymentManager } from './ProductionDeploymentManager';

export type {
  PerformanceMetrics,
  PerformanceThresholds,
  PerformanceAlert,
  PerformanceReport,
  PerformanceTrends,
  PerformanceOptimization,
  FrontendMetrics
} from './ProductionPerformanceMonitor';

export type {
  AnalyticsEvent,
  EventMetadata,
  DeviceInfo,
  UserBehaviorMetrics,
  BusinessMetrics,
  AnalyticsReport,
  PageAnalytics,
  EventAnalytics,
  AnalyticsTrends,
  AnalyticsInsight,
  AnalyticsConfig
} from './RealTimeAnalytics';

export type {
  DashboardConfig,
  SystemHealth,
  ComponentHealth,
  DashboardAlert,
  SystemRecommendation,
  ExecutiveSummary,
  Achievement,
  Concern,
  Opportunity,
  Forecast
} from './ProductionMonitoringDashboard';

export type {
  APMConfig,
  TransactionTrace,
  SpanTrace,
  TraceMetadata,
  ErrorDetails,
  APMMetrics,
  PerformanceIssue
} from './APMService';

export type {
  HealthCheckConfig,
  HealthCheck,
  HealthCheckResult,
  SystemHealthStatus,
  HealthCheckStatus,
  HealthIncident,
  HealthSummary
} from './HealthCheckService';

/**
 * Create a complete monitoring system with recommended defaults
 */
export function createMonitoringSystem(config?: Partial<DashboardConfig>): ProductionMonitoringDashboard {
  return new ProductionMonitoringDashboard(config);
}

/**
 * Production monitoring configuration presets
 */
export const MonitoringPresets = {
  /**
   * Development environment preset
   */
  development: {
    performance: {
      enabled: true,
      monitoringInterval: 60000, // 1 minute
      alertThresholds: {
        responseTime: 1000, // More relaxed thresholds
        errorRate: 0.05,
        cpuUsage: 0.9,
        memoryUsage: 0.9
      }
    },
    analytics: {
      enabled: true,
      trackingEnabled: true,
      sampleRate: 0.1, // 10% sampling
      flushInterval: 60000
    },
    dashboard: {
      refreshInterval: 120000, // 2 minutes
      alertRetentionDays: 7,
      reportRetentionDays: 30
    }
  },

  /**
   * Production environment preset
   */
  production: {
    performance: {
      enabled: true,
      monitoringInterval: 30000, // 30 seconds
      alertThresholds: {
        responseTime: 500, // Strict thresholds
        errorRate: 0.01,
        cpuUsage: 0.8,
        memoryUsage: 0.8
      }
    },
    analytics: {
      enabled: true,
      trackingEnabled: true,
      sampleRate: 1.0, // 100% sampling
      flushInterval: 30000
    },
    dashboard: {
      refreshInterval: 60000, // 1 minute
      alertRetentionDays: 30,
      reportRetentionDays: 90
    }
  },

  /**
   * High-traffic environment preset
   */
  highTraffic: {
    performance: {
      enabled: true,
      monitoringInterval: 15000, // 15 seconds
      alertThresholds: {
        responseTime: 300, // Very strict thresholds
        errorRate: 0.005,
        cpuUsage: 0.7,
        memoryUsage: 0.7
      }
    },
    analytics: {
      enabled: true,
      trackingEnabled: true,
      sampleRate: 0.5, // 50% sampling for performance
      flushInterval: 15000
    },
    dashboard: {
      refreshInterval: 30000, // 30 seconds
      alertRetentionDays: 60,
      reportRetentionDays: 180
    }
  }
} as const;

/**
 * Create monitoring system with preset configuration
 */
export function createMonitoringSystemWithPreset(
  preset: keyof typeof MonitoringPresets,
  overrides?: Partial<DashboardConfig>
): ProductionMonitoringDashboard {
  const baseConfig = MonitoringPresets[preset];
  const finalConfig = overrides ? { ...baseConfig, ...overrides } : baseConfig;
  return new ProductionMonitoringDashboard(finalConfig);
}

/**
 * Monitoring utilities
 */
export const MonitoringUtils = {
  /**
   * Validate monitoring configuration
   */
  validateConfig(config: DashboardConfig): boolean {
    try {
      // Validate performance config
      if (config.performance.enabled && config.performance.monitoringInterval < 5000) {
        console.warn('Performance monitoring interval should be at least 5 seconds');
        return false;
      }

      // Validate analytics config
      if (config.analytics.enabled && config.analytics.sampleRate > 1.0) {
        console.warn('Analytics sample rate should not exceed 1.0');
        return false;
      }

      // Validate dashboard config
      if (config.dashboard.refreshInterval < 10000) {
        console.warn('Dashboard refresh interval should be at least 10 seconds');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Configuration validation failed:', error);
      return false;
    }
  },

  /**
   * Calculate optimal monitoring intervals based on traffic
   */
  calculateOptimalIntervals(requestsPerMinute: number): {
    performanceInterval: number;
    analyticsFlushInterval: number;
    dashboardRefreshInterval: number;
  } {
    // Adjust monitoring frequency based on traffic volume
    const basePerformanceInterval = 30000; // 30 seconds
    const baseAnalyticsInterval = 30000;   // 30 seconds  
    const baseDashboardInterval = 60000;   // 1 minute

    // High traffic = more frequent monitoring
    const trafficMultiplier = Math.max(0.5, Math.min(2.0, 1000 / requestsPerMinute));

    return {
      performanceInterval: Math.round(basePerformanceInterval * trafficMultiplier),
      analyticsFlushInterval: Math.round(baseAnalyticsInterval * trafficMultiplier),
      dashboardRefreshInterval: Math.round(baseDashboardInterval * trafficMultiplier)
    };
  },

  /**
   * Generate monitoring health check
   */
  async healthCheck(dashboard: ProductionMonitoringDashboard): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      message: string;
      duration: number;
    }>;
    overall: {
      score: number;
      uptime: number;
      lastUpdate: number;
    };
  }> {
    const startTime = Date.now();
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      message: string;
      duration: number;
    }> = [];

    try {
      // Check dashboard status
      const systemStatus = dashboard.getSystemStatus();
      checks.push({
        name: 'Dashboard Status',
        status: systemStatus.status === 'healthy' ? 'pass' : 'fail',
        message: `System status: ${systemStatus.status}`,
        duration: Date.now() - startTime
      });

      // Check active alerts
      const activeAlerts = dashboard.getActiveAlerts();
      const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
      checks.push({
        name: 'Critical Alerts',
        status: criticalAlerts.length === 0 ? 'pass' : 'fail',
        message: `${criticalAlerts.length} critical alerts active`,
        duration: Date.now() - startTime
      });

      // Calculate overall health
      const passedChecks = checks.filter(c => c.status === 'pass').length;
      const healthPercentage = (passedChecks / checks.length) * 100;
      
      let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
      if (healthPercentage >= 80) {
        overallStatus = 'healthy';
      } else if (healthPercentage >= 60) {
        overallStatus = 'degraded';
      } else {
        overallStatus = 'unhealthy';
      }

      return {
        status: overallStatus,
        checks,
        overall: {
          score: systemStatus.health.score,
          uptime: systemStatus.uptime,
          lastUpdate: systemStatus.lastUpdate
        }
      };
    } catch (error) {
      console.error('Health check failed:', error);
      
      return {
        status: 'unhealthy',
        checks: [{
          name: 'Health Check',
          status: 'fail',
          message: `Health check failed: ${error}`,
          duration: Date.now() - startTime
        }],
        overall: {
          score: 0,
          uptime: 0,
          lastUpdate: Date.now()
        }
      };
    }
  }
};

/**
 * Default monitoring configuration for ResearchHub
 */
export const defaultMonitoringConfig: DashboardConfig = {
  performance: {
    enabled: true,
    monitoringInterval: 30000,
    alertThresholds: {
      responseTime: 500,
      errorRate: 0.01,
      cpuUsage: 0.8,
      memoryUsage: 0.8,
      databaseLatency: 100,
      pageLoadTime: 2000,
      cumulativeLayoutShift: 0.1
    }
  },
  analytics: {
    enabled: true,
    trackingEnabled: true,
    sampleRate: 1.0,
    flushInterval: 30000
  },
  dashboard: {
    refreshInterval: 60000,
    alertRetentionDays: 30,
    reportRetentionDays: 90
  }
};
