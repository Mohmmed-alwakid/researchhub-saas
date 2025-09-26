import { ProductionPerformanceMonitor, PerformanceReport, PerformanceMetrics } from './ProductionPerformanceMonitor';
import { RealTimeAnalytics, AnalyticsReport } from './RealTimeAnalytics';


/**
 * Production Monitoring Dashboard
 * Unified monitoring system combining performance monitoring and real-time analytics
 * 
 * Features:
 * - Integrated performance and analytics monitoring
 * - Real-time dashboard with alerts and notifications
 * - Automated optimization recommendations
 * - Executive summary and business intelligence
 * - Health status and system overview
 */

export interface DashboardConfig {
  performance: {
    enabled: boolean;
    monitoringInterval: number;
    alertThresholds: Record<string, number>;
  };
  analytics: {
    enabled: boolean;
    trackingEnabled: boolean;
    sampleRate: number;
    flushInterval: number;
  };
  dashboard: {
    refreshInterval: number;
    alertRetentionDays: number;
    reportRetentionDays: number;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  lastUpdated: number;
  components: {
    performance: ComponentHealth;
    analytics: ComponentHealth;
    database: ComponentHealth;
    api: ComponentHealth;
    frontend: ComponentHealth;
  };
  alerts: DashboardAlert[];
  recommendations: SystemRecommendation[];
}

export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  metrics: Record<string, number>;
  lastCheck: number;
  issues: string[];
}

export interface DashboardAlert {
  id: string;
  type: 'performance' | 'analytics' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
  source: string;
  affectedComponents: string[];
  recommendations: string[];
}

export interface SystemRecommendation {
  id: string;
  category: 'performance' | 'analytics' | 'security' | 'cost' | 'user_experience';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: string;
  effort: string;
  estimatedValue: number;
  implementationSteps: string[];
  metrics: Record<string, number>;
}

export interface ExecutiveSummary {
  period: string;
  overallScore: number;
  keyMetrics: {
    performanceScore: number;
    analyticsScore: number;
    userSatisfaction: number;
    systemReliability: number;
    businessGrowth: number;
  };
  achievements: Achievement[];
  concerns: Concern[];
  opportunities: Opportunity[];
  forecasts: Forecast[];
}

export interface Achievement {
  title: string;
  description: string;
  impact: number;
  metric: string;
  value: number;
  trend: number;
}

export interface Concern {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedMetrics: string[];
  recommendations: string[];
}

export interface Opportunity {
  title: string;
  description: string;
  potentialImpact: number;
  estimatedEffort: string;
  confidence: number;
  expectedRoi: number;
}

export interface Forecast {
  metric: string;
  current: number;
  predicted: number;
  timeframe: string;
  confidence: number;
  factors: string[];
}

export class ProductionMonitoringDashboard {
  private performanceMonitor: ProductionPerformanceMonitor;
  private analytics: RealTimeAnalytics;
  private config: DashboardConfig;
  private systemHealth: SystemHealth;
  private alerts: DashboardAlert[] = [];
  private isRunning: boolean = false;
  private dashboardInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<DashboardConfig>) {
    this.config = {
      performance: {
        enabled: true,
        monitoringInterval: 30000, // 30 seconds
        alertThresholds: {
          responseTime: 500,
          errorRate: 0.01,
          cpuUsage: 0.8,
          memoryUsage: 0.8
        }
      },
      analytics: {
        enabled: true,
        trackingEnabled: true,
        sampleRate: 1.0,
        flushInterval: 30000
      },
      dashboard: {
        refreshInterval: 60000, // 1 minute
        alertRetentionDays: 30,
        reportRetentionDays: 90
      },
      ...config
    };

    this.performanceMonitor = new ProductionPerformanceMonitor(
      this.config.performance.alertThresholds
    );

    this.analytics = new RealTimeAnalytics({
      trackingEnabled: this.config.analytics.trackingEnabled,
      sampleRate: this.config.analytics.sampleRate,
      flushInterval: this.config.analytics.flushInterval
    });

    this.systemHealth = this.initializeSystemHealth();
  }

  /**
   * Initialize the monitoring dashboard
   */
  async initialize(): Promise<void> {
    try {
      console.log('[ProductionMonitoringDashboard] Initializing monitoring dashboard...');

      // Initialize performance monitoring
      if (this.config.performance.enabled) {
        await this.performanceMonitor.initialize();
        await this.performanceMonitor.startMonitoring(this.config.performance.monitoringInterval);
      }

      // Initialize analytics
      if (this.config.analytics.enabled) {
        await this.analytics.initialize();
      }

      // Start dashboard updates
      await this.startDashboardUpdates();

      this.isRunning = true;
      console.log('[ProductionMonitoringDashboard] Monitoring dashboard initialized successfully');
    } catch (error) {
      console.error('[ProductionMonitoringDashboard] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Start dashboard updates
   */
  private async startDashboardUpdates(): Promise<void> {
    this.dashboardInterval = setInterval(async () => {
      await this.updateSystemHealth();
    }, this.config.dashboard.refreshInterval);

    // Initial update
    await this.updateSystemHealth();
  }

  /**
   * Update system health status
   */
  private async updateSystemHealth(): Promise<void> {
    try {
      console.log('[ProductionMonitoringDashboard] Updating system health...');

      // Get current performance metrics
      const performanceMetrics = this.performanceMonitor.getCurrentMetrics();
      
      // Update component health
      this.systemHealth.components.performance = await this.evaluatePerformanceHealth(performanceMetrics);
      this.systemHealth.components.analytics = await this.evaluateAnalyticsHealth();
      this.systemHealth.components.database = await this.evaluateDatabaseHealth();
      this.systemHealth.components.api = await this.evaluateApiHealth();
      this.systemHealth.components.frontend = await this.evaluateFrontendHealth();

      // Calculate overall health
      this.systemHealth = await this.calculateOverallHealth();
      this.systemHealth.lastUpdated = Date.now();

      // Process alerts
      await this.processSystemAlerts();

      console.log(`[ProductionMonitoringDashboard] System health updated - Status: ${this.systemHealth.status}, Score: ${this.systemHealth.score}`);
    } catch (error) {
      console.error('[ProductionMonitoringDashboard] Failed to update system health:', error);
    }
  }

  /**
   * Generate comprehensive dashboard report
   */
  async generateDashboardReport(period: string = '24h'): Promise<{
    performance: PerformanceReport;
    analytics: AnalyticsReport;
    systemHealth: SystemHealth;
    executive: ExecutiveSummary;
  }> {
    try {
      console.log(`[ProductionMonitoringDashboard] Generating dashboard report for period: ${period}`);

      // Generate performance report
      const performanceReport = await this.performanceMonitor.generateReport(period);
      
      // Generate analytics report
      const analyticsReport = await this.analytics.generateReport(period);
      
      // Generate executive summary
      const executiveSummary = await this.generateExecutiveSummary(
        period,
        performanceReport,
        analyticsReport
      );

      return {
        performance: performanceReport,
        analytics: analyticsReport,
        systemHealth: this.systemHealth,
        executive: executiveSummary
      };
    } catch (error) {
      console.error('[ProductionMonitoringDashboard] Failed to generate dashboard report:', error);
      throw error;
    }
  }

  /**
   * Generate executive summary
   */
  private async generateExecutiveSummary(
    period: string,
    performanceReport: PerformanceReport,
    analyticsReport: AnalyticsReport
  ): Promise<ExecutiveSummary> {
    const overallScore = (performanceReport.score + analyticsReport.trends.score) / 2;

    const keyMetrics = {
      performanceScore: performanceReport.score,
      analyticsScore: analyticsReport.trends.score,
      userSatisfaction: this.calculateUserSatisfaction(analyticsReport),
      systemReliability: this.calculateSystemReliability(performanceReport),
      businessGrowth: analyticsReport.trends.revenueTrend * 100
    };

    const achievements = this.identifyAchievements(performanceReport, analyticsReport);
    const concerns = this.identifyConcerns(performanceReport, analyticsReport);
    const opportunities = this.identifyOpportunities(performanceReport, analyticsReport);
    const forecasts = this.generateForecasts(performanceReport, analyticsReport);

    return {
      period,
      overallScore,
      keyMetrics,
      achievements,
      concerns,
      opportunities,
      forecasts
    };
  }

  /**
   * Get real-time system status
   */
  getSystemStatus(): {
    status: string;
    uptime: number;
    health: SystemHealth;
    alerts: DashboardAlert[];
    lastUpdate: number;
  } {
    return {
      status: this.systemHealth.status,
      uptime: this.isRunning ? Date.now() - this.systemHealth.lastUpdated : 0,
      health: this.systemHealth,
      alerts: this.getActiveAlerts(),
      lastUpdate: this.systemHealth.lastUpdated
    };
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      console.log(`[ProductionMonitoringDashboard] Alert acknowledged: ${alertId}`);
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`[ProductionMonitoringDashboard] Alert resolved: ${alertId}`);
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): DashboardAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Stop monitoring dashboard
   */
  async stop(): Promise<void> {
    console.log('[ProductionMonitoringDashboard] Stopping monitoring dashboard...');

    this.isRunning = false;

    if (this.dashboardInterval) {
      clearInterval(this.dashboardInterval);
      this.dashboardInterval = null;
    }

    this.performanceMonitor.stopMonitoring();
    this.analytics.stop();

    console.log('[ProductionMonitoringDashboard] Monitoring dashboard stopped');
  }

  /**
   * Helper methods for health evaluation
   */
  private async evaluatePerformanceHealth(metrics: PerformanceMetrics | null): Promise<ComponentHealth> {
    if (!metrics) {
      return {
        status: 'warning',
        score: 50,
        metrics: {},
        lastCheck: Date.now(),
        issues: ['No performance metrics available']
      };
    }

    const score = this.calculateComponentScore({
      responseTime: metrics.responseTime,
      errorRate: metrics.errorRate,
      cpuUsage: metrics.cpuUsage
    });

    return {
      status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
      score,
      metrics: {
        responseTime: metrics.responseTime,
        errorRate: metrics.errorRate,
        cpuUsage: metrics.cpuUsage
      },
      lastCheck: Date.now(),
      issues: score < 80 ? ['Performance metrics below threshold'] : []
    };
  }

  private async evaluateAnalyticsHealth(): Promise<ComponentHealth> {
    const bufferSize = this.analytics.getBufferSize();
    const score = bufferSize < 100 ? 90 : bufferSize < 500 ? 70 : 50;

    return {
      status: score >= 80 ? 'healthy' : 'warning',
      score,
      metrics: { bufferSize },
      lastCheck: Date.now(),
      issues: bufferSize > 100 ? ['Analytics buffer growing'] : []
    };
  }

  private async evaluateDatabaseHealth(): Promise<ComponentHealth> {
    // Simulate database health check
    return {
      status: 'healthy',
      score: 95,
      metrics: { connectionCount: 10, queryTime: 25 },
      lastCheck: Date.now(),
      issues: []
    };
  }

  private async evaluateApiHealth(): Promise<ComponentHealth> {
    // Simulate API health check
    return {
      status: 'healthy',
      score: 88,
      metrics: { responseTime: 120, successRate: 0.99 },
      lastCheck: Date.now(),
      issues: []
    };
  }

  private async evaluateFrontendHealth(): Promise<ComponentHealth> {
    // Simulate frontend health check
    return {
      status: 'healthy',
      score: 92,
      metrics: { loadTime: 1200, errorRate: 0.005 },
      lastCheck: Date.now(),
      issues: []
    };
  }

  private async calculateOverallHealth(): Promise<SystemHealth> {
    const components = this.systemHealth.components;
    const scores = Object.values(components).map(c => c.score);
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const status = overallScore >= 80 ? 'healthy' : overallScore >= 60 ? 'warning' : 'critical';

    return {
      ...this.systemHealth,
      status,
      score: overallScore
    };
  }

  private async processSystemAlerts(): Promise<void> {
    // Process performance alerts
    const performanceAlerts = this.performanceMonitor.getAlerts(10);
    performanceAlerts.forEach(alert => {
      const dashboardAlert: DashboardAlert = {
        id: alert.id,
        type: 'performance',
        severity: alert.type === 'critical' ? 'critical' : 'medium',
        title: `Performance Alert: ${alert.metric}`,
        message: alert.message,
        timestamp: alert.timestamp,
        acknowledged: false,
        resolved: false,
        source: 'performance_monitor',
        affectedComponents: ['performance'],
        recommendations: alert.recommendations
      };

      if (!this.alerts.find(a => a.id === dashboardAlert.id)) {
        this.alerts.push(dashboardAlert);
      }
    });

    // Clean up old alerts
    this.cleanupOldAlerts();
  }

  private cleanupOldAlerts(): void {
    const cutoff = Date.now() - (this.config.dashboard.alertRetentionDays * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => alert.timestamp >= cutoff);
  }

  private calculateComponentScore(metrics: Record<string, number>): number {
    // Simplified scoring algorithm
    const thresholds = this.config.performance.alertThresholds;
    let score = 100;

    Object.entries(metrics).forEach(([key, value]) => {
      const threshold = thresholds[key];
      if (threshold && value > threshold) {
        score -= Math.min(30, (value / threshold - 1) * 50);
      }
    });

    return Math.max(0, score);
  }

  private calculateUserSatisfaction(analyticsReport: AnalyticsReport): number {
    const { bounceRate, conversionRate, timeOnPage } = analyticsReport.userBehavior;
    return Math.max(0, 100 - bounceRate * 100 + conversionRate * 100 + Math.min(timeOnPage / 60000, 1) * 20);
  }

  private calculateSystemReliability(performanceReport: PerformanceReport): number {
    return Math.max(0, 100 - performanceReport.averages.errorRate * 10000);
  }

  private identifyAchievements(
    performanceReport: PerformanceReport,
    analyticsReport: AnalyticsReport
  ): Achievement[] {
    const achievements: Achievement[] = [];

    if (performanceReport.score > 90) {
      achievements.push({
        title: 'Excellent Performance',
        description: 'System performance is exceeding targets',
        impact: 10,
        metric: 'performance_score',
        value: performanceReport.score,
        trend: performanceReport.trends.improvement
      });
    }

    if (analyticsReport.trends.userGrowth > 0.1) {
      achievements.push({
        title: 'Strong User Growth',
        description: 'User base is growing significantly',
        impact: 15,
        metric: 'user_growth',
        value: analyticsReport.trends.userGrowth * 100,
        trend: analyticsReport.trends.userGrowth
      });
    }

    return achievements;
  }

  private identifyConcerns(
    performanceReport: PerformanceReport,
    analyticsReport: AnalyticsReport
  ): Concern[] {
    const concerns: Concern[] = [];

    if (performanceReport.score < 70) {
      concerns.push({
        title: 'Performance Issues',
        description: 'System performance is below acceptable levels',
        severity: 'high',
        affectedMetrics: ['response_time', 'error_rate'],
        recommendations: ['Optimize database queries', 'Scale infrastructure']
      });
    }

    if (analyticsReport.userBehavior.bounceRate > 0.7) {
      concerns.push({
        title: 'High Bounce Rate',
        description: 'Users are leaving the site quickly',
        severity: 'medium',
        affectedMetrics: ['bounce_rate', 'engagement'],
        recommendations: ['Improve page loading speed', 'Enhance user experience']
      });
    }

    return concerns;
  }

  private identifyOpportunities(
    _performanceReport: PerformanceReport,
    analyticsReport: AnalyticsReport
  ): Opportunity[] {
    const opportunities: Opportunity[] = [];

    if (analyticsReport.userBehavior.conversionRate < 0.05) {
      opportunities.push({
        title: 'Conversion Rate Optimization',
        description: 'Significant opportunity to improve conversion rates',
        potentialImpact: 25,
        estimatedEffort: 'Medium',
        confidence: 0.8,
        expectedRoi: 3.2
      });
    }

    return opportunities;
  }

  private generateForecasts(
    performanceReport: PerformanceReport,
    analyticsReport: AnalyticsReport
  ): Forecast[] {
    return [
      {
        metric: 'User Growth',
        current: analyticsReport.userBehavior.uniqueVisitors,
        predicted: analyticsReport.userBehavior.uniqueVisitors * (1 + analyticsReport.trends.userGrowth),
        timeframe: '30 days',
        confidence: 0.75,
        factors: ['Current growth trend', 'Seasonal patterns']
      },
      {
        metric: 'Performance Score',
        current: performanceReport.score,
        predicted: performanceReport.score + performanceReport.trends.improvement * 30,
        timeframe: '30 days',
        confidence: 0.65,
        factors: ['Recent optimization efforts', 'Infrastructure scaling']
      }
    ];
  }

  private initializeSystemHealth(): SystemHealth {
    return {
      status: 'warning',
      score: 0,
      lastUpdated: Date.now(),
      components: {
        performance: {
          status: 'warning',
          score: 0,
          metrics: {},
          lastCheck: Date.now(),
          issues: []
        },
        analytics: {
          status: 'warning',
          score: 0,
          metrics: {},
          lastCheck: Date.now(),
          issues: []
        },
        database: {
          status: 'warning',
          score: 0,
          metrics: {},
          lastCheck: Date.now(),
          issues: []
        },
        api: {
          status: 'warning',
          score: 0,
          metrics: {},
          lastCheck: Date.now(),
          issues: []
        },
        frontend: {
          status: 'warning',
          score: 0,
          metrics: {},
          lastCheck: Date.now(),
          issues: []
        }
      },
      alerts: [],
      recommendations: []
    };
  }
}
