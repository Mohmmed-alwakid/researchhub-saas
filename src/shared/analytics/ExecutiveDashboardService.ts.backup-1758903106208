/**
 * Executive Dashboard Service
 * Creates executive dashboards and reports for ResearchHub leadership
 * Part of Vibe-Coder-MCP Phase 4 Task 4.4 implementation
 */

import type { BusinessIntelligenceService, ExecutiveSummary } from './BusinessIntelligenceService';
import type { UsageAnalyticsService, EngagementMetrics } from './UsageAnalyticsService';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'insight';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  data: unknown;
  config: {
    showTrend?: boolean;
    showTarget?: boolean;
    chartType?: 'line' | 'bar' | 'pie' | 'area';
    timeframe?: string;
  };
}

export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  target_audience: 'executive' | 'manager' | 'analyst';
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    autoRefresh: boolean;
    refreshInterval: number; // minutes
  };
  permissions: {
    view: string[];
    edit: string[];
  };
}

export interface DashboardReport {
  id: string;
  name: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    keyFindings: string[];
    recommendations: string[];
    alerts: string[];
  };
  sections: {
    overview: DashboardWidget[];
    performance: DashboardWidget[];
    insights: DashboardWidget[];
  };
  metadata: {
    dataPoints: number;
    accuracy: number;
    completeness: number;
  };
}

export class ExecutiveDashboardService {
  private dashboards: Map<string, DashboardConfig> = new Map();
  private reports: DashboardReport[] = [];

  constructor(
    private businessIntelligence: BusinessIntelligenceService,
    private usageAnalytics: UsageAnalyticsService
  ) {
    this.initializeDefaultDashboards();
  }

  /**
   * Initialize default executive dashboards
   */
  private initializeDefaultDashboards(): void {
    // Executive Overview Dashboard
    const executiveDashboard: DashboardConfig = {
      id: 'executive-overview',
      name: 'Executive Overview',
      description: 'High-level metrics and insights for executive team',
      target_audience: 'executive',
      widgets: [
        {
          id: 'monthly-active-users',
          title: 'Monthly Active Users',
          type: 'metric',
          size: 'medium',
          position: { x: 0, y: 0 },
          data: null,
          config: { showTrend: true, showTarget: true }
        },
        {
          id: 'revenue-growth',
          title: 'Revenue Growth',
          type: 'chart',
          size: 'large',
          position: { x: 1, y: 0 },
          data: null,
          config: { chartType: 'line', timeframe: '12months' }
        },
        {
          id: 'user-engagement',
          title: 'User Engagement Trends',
          type: 'chart',
          size: 'medium',
          position: { x: 0, y: 1 },
          data: null,
          config: { chartType: 'area', timeframe: '3months' }
        },
        {
          id: 'key-insights',
          title: 'Key Business Insights',
          type: 'insight',
          size: 'large',
          position: { x: 1, y: 1 },
          data: null,
          config: {}
        }
      ],
      layout: {
        columns: 2,
        autoRefresh: true,
        refreshInterval: 15
      },
      permissions: {
        view: ['executive', 'manager'],
        edit: ['executive']
      }
    };

    // Performance Analytics Dashboard
    const performanceDashboard: DashboardConfig = {
      id: 'performance-analytics',
      name: 'Performance Analytics',
      description: 'Detailed performance metrics and operational data',
      target_audience: 'manager',
      widgets: [
        {
          id: 'study-completion-rate',
          title: 'Study Completion Rate',
          type: 'metric',
          size: 'small',
          position: { x: 0, y: 0 },
          data: null,
          config: { showTrend: true }
        },
        {
          id: 'user-acquisition-cost',
          title: 'User Acquisition Cost',
          type: 'metric',
          size: 'small',
          position: { x: 1, y: 0 },
          data: null,
          config: { showTrend: true, showTarget: true }
        },
        {
          id: 'session-analytics',
          title: 'Session Analytics',
          type: 'table',
          size: 'large',
          position: { x: 0, y: 1 },
          data: null,
          config: { timeframe: '7days' }
        }
      ],
      layout: {
        columns: 2,
        autoRefresh: true,
        refreshInterval: 5
      },
      permissions: {
        view: ['executive', 'manager', 'analyst'],
        edit: ['manager']
      }
    };

    this.dashboards.set(executiveDashboard.id, executiveDashboard);
    this.dashboards.set(performanceDashboard.id, performanceDashboard);
  }

  /**
   * Create a custom dashboard
   */
  async createDashboard(config: Omit<DashboardConfig, 'id'>): Promise<string> {
    const dashboardId = `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const dashboard: DashboardConfig = {
      id: dashboardId,
      ...config
    };

    this.dashboards.set(dashboardId, dashboard);
    return dashboardId;
  }

  /**
   * Update dashboard widget data
   */
  async updateDashboardData(dashboardId: string): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return;

    // Update each widget with current data
    for (const widget of dashboard.widgets) {
      widget.data = await this.getWidgetData(widget);
    }

    this.dashboards.set(dashboardId, dashboard);
  }

  /**
   * Get data for a specific widget
   */
  private async getWidgetData(widget: DashboardWidget): Promise<unknown> {
    switch (widget.id) {
      case 'monthly-active-users': {
        const userMetrics = this.businessIntelligence.getMetrics('user');
        return userMetrics.find(m => m.name.includes('Monthly Active Users'));
      }

      case 'revenue-growth': {
        const revenueMetrics = this.businessIntelligence.getMetrics('financial');
        return revenueMetrics.filter(m => m.name.includes('Revenue'));
      }

      case 'user-engagement': {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
        return await this.usageAnalytics.calculateEngagementMetrics(startDate, endDate);
      }

      case 'key-insights':
        return this.businessIntelligence.getInsights(5);

      case 'study-completion-rate': {
        const studyMetrics = this.businessIntelligence.getMetrics('study');
        return studyMetrics.find(m => m.name.includes('Completion Rate'));
      }

      case 'user-acquisition-cost': {
        const costMetrics = this.businessIntelligence.getMetrics('financial');
        return costMetrics.find(m => m.name.includes('Acquisition Cost'));
      }

      case 'session-analytics': {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const now = new Date();
        return await this.usageAnalytics.calculateEngagementMetrics(weekAgo, now);
      }

      default:
        return null;
    }
  }

  /**
   * Generate comprehensive dashboard report
   */
  async generateReport(startDate: Date, endDate: Date): Promise<DashboardReport> {
    const reportId = `report-${Date.now()}`;
    
    // Get executive summary and engagement metrics
    const [executiveSummary, engagementMetrics] = await Promise.all([
      this.businessIntelligence.generateExecutiveSummary(startDate, endDate),
      this.usageAnalytics.calculateEngagementMetrics(startDate, endDate)
    ]);

    // Generate key findings and recommendations
    const keyFindings = this.generateKeyFindings(executiveSummary, engagementMetrics);
    const recommendations = this.generateRecommendations(executiveSummary, engagementMetrics);
    const alerts = this.generateAlerts(executiveSummary);

    // Create dashboard widgets for the report
    const overviewWidgets = await this.createReportWidgets('overview', executiveSummary);
    const performanceWidgets = await this.createReportWidgets('performance', engagementMetrics);
    const insightWidgets = await this.createReportWidgets('insights', executiveSummary.insights);

    const report: DashboardReport = {
      id: reportId,
      name: `Executive Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      summary: {
        keyFindings,
        recommendations,
        alerts
      },
      sections: {
        overview: overviewWidgets,
        performance: performanceWidgets,
        insights: insightWidgets
      },
      metadata: {
        dataPoints: executiveSummary.keyMetrics.length + engagementMetrics.totalUsers,
        accuracy: 0.95, // High accuracy for synthetic data
        completeness: 0.98 // High completeness
      }
    };

    this.reports.push(report);
    return report;
  }

  /**
   * Generate key findings from data
   */
  private generateKeyFindings(
    executiveSummary: ExecutiveSummary,
    engagementMetrics: EngagementMetrics
  ): string[] {
    const findings: string[] = [];

    // User growth findings
    if (engagementMetrics.newUsers > engagementMetrics.returningUsers) {
      findings.push(`Strong user acquisition: ${engagementMetrics.newUsers} new users acquired`);
    }

    // Engagement findings
    if (engagementMetrics.averageSessionDuration > 300000) { // 5 minutes
      findings.push('High user engagement with average session duration exceeding 5 minutes');
    }

    // Revenue findings
    const revenueGrowth = executiveSummary.trends.revenue;
    if (revenueGrowth > 10) {
      findings.push(`Significant revenue growth of ${revenueGrowth.toFixed(1)}%`);
    }

    // Conversion findings
    if (engagementMetrics.conversionRate > 80) {
      findings.push(`Excellent conversion rate of ${engagementMetrics.conversionRate.toFixed(1)}%`);
    }

    // Default finding if no specific patterns
    if (findings.length === 0) {
      findings.push('Steady performance across all key metrics');
    }

    return findings;
  }

  /**
   * Generate recommendations based on data
   */
  private generateRecommendations(
    executiveSummary: ExecutiveSummary,
    engagementMetrics: EngagementMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Bounce rate recommendations
    if (engagementMetrics.bounceRate > 50) {
      recommendations.push('Consider improving landing page experience to reduce bounce rate');
    }

    // Retention recommendations
    if (engagementMetrics.retentionRate.day7 < 50) {
      recommendations.push('Implement user onboarding improvements to increase 7-day retention');
    }

    // Growth recommendations
    if (executiveSummary.trends.userGrowth > 20) {
      recommendations.push('Scale infrastructure and customer support for continued growth');
    }

    // Revenue recommendations
    if (executiveSummary.trends.revenue > 15) {
      recommendations.push('Explore premium features and enterprise packages');
    }

    // Default recommendation
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring key metrics and maintain current strategies');
    }

    return recommendations;
  }

  /**
   * Generate alerts from executive summary
   */
  private generateAlerts(executiveSummary: ExecutiveSummary): string[] {
    const alerts: string[] = [];

    if (executiveSummary.alerts.critical > 0) {
      alerts.push(`${executiveSummary.alerts.critical} critical alerts require immediate attention`);
    }

    if (executiveSummary.alerts.warning > 2) {
      alerts.push(`${executiveSummary.alerts.warning} warning alerts need review`);
    }

    return alerts;
  }

  /**
   * Create widgets for report sections
   */
  private async createReportWidgets(
    section: 'overview' | 'performance' | 'insights',
    data: unknown
  ): Promise<DashboardWidget[]> {
    const widgets: DashboardWidget[] = [];

    switch (section) {
      case 'overview':
        widgets.push({
          id: 'overview-summary',
          title: 'Executive Summary',
          type: 'metric',
          size: 'large',
          position: { x: 0, y: 0 },
          data,
          config: { showTrend: true }
        });
        break;

      case 'performance':
        widgets.push({
          id: 'performance-metrics',
          title: 'Performance Metrics',
          type: 'table',
          size: 'large',
          position: { x: 0, y: 0 },
          data,
          config: { timeframe: 'current' }
        });
        break;

      case 'insights':
        widgets.push({
          id: 'business-insights',
          title: 'Business Insights',
          type: 'insight',
          size: 'large',
          position: { x: 0, y: 0 },
          data,
          config: {}
        });
        break;
    }

    return widgets;
  }

  /**
   * Get dashboard by ID
   */
  getDashboard(dashboardId: string): DashboardConfig | undefined {
    return this.dashboards.get(dashboardId);
  }

  /**
   * Get all dashboards for a user role
   */
  getDashboardsForRole(role: string): DashboardConfig[] {
    return Array.from(this.dashboards.values()).filter(
      dashboard => dashboard.permissions.view.includes(role)
    );
  }

  /**
   * Get recent reports
   */
  getReports(limit: number = 10): DashboardReport[] {
    return this.reports
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Export dashboard configuration
   */
  exportDashboard(dashboardId: string): string {
    const dashboard = this.dashboards.get(dashboardId);
    return dashboard ? JSON.stringify(dashboard, null, 2) : '';
  }

  /**
   * Import dashboard configuration
   */
  async importDashboard(configJson: string): Promise<string> {
    try {
      const config = JSON.parse(configJson) as DashboardConfig;
      const newId = `imported-${Date.now()}`;
      config.id = newId;
      
      this.dashboards.set(newId, config);
      return newId;
    } catch {
      throw new Error('Invalid dashboard configuration');
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    isHealthy: boolean;
    dashboardsCount: number;
    reportsCount: number;
    lastUpdated: Date;
  } {
    return {
      isHealthy: true,
      dashboardsCount: this.dashboards.size,
      reportsCount: this.reports.length,
      lastUpdated: new Date()
    };
  }
}
