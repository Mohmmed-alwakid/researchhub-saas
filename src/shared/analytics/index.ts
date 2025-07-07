/**
 * Analytics System Index
 * Exports all analytics services and types for ResearchHub
 * Part of Vibe-Coder-MCP Phase 4 Task 4.4 implementation
 */

// Business Intelligence Service
export {
  BusinessIntelligenceService,
  type BusinessMetric,
  type KPIConfiguration,
  type BusinessInsight,
  type ExecutiveSummary
} from './BusinessIntelligenceService';

// Usage Analytics Service
export {
  UsageAnalyticsService,
  type UserAction,
  type UserSession,
  type BehaviorPattern,
  type EngagementMetrics
} from './UsageAnalyticsService';

// Executive Dashboard Service
export {
  ExecutiveDashboardService,
  type DashboardWidget,
  type DashboardConfig,
  type DashboardReport
} from './ExecutiveDashboardService';

/**
 * Initialize and configure the complete analytics system
 */
export class AnalyticsSystem {
  public readonly businessIntelligence: BusinessIntelligenceService;
  public readonly usageAnalytics: UsageAnalyticsService;
  public readonly executiveDashboard: ExecutiveDashboardService;

  constructor() {
    this.businessIntelligence = new BusinessIntelligenceService();
    this.usageAnalytics = new UsageAnalyticsService();
    this.executiveDashboard = new ExecutiveDashboardService(
      this.businessIntelligence,
      this.usageAnalytics
    );
  }

  /**
   * Initialize the analytics system
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing ResearchHub Analytics System...');
    
    // Initialize all services
    await this.setupBusinessIntelligence();
    await this.setupUsageAnalytics();
    await this.setupExecutiveDashboard();
    
    console.log('✅ Analytics System initialized successfully');
  }

  /**
   * Setup business intelligence with sample data
   */
  private async setupBusinessIntelligence(): Promise<void> {
    // Track sample business metrics
    await this.businessIntelligence.trackMetric('Monthly Active Users', 1250, 'user', 'users');
    await this.businessIntelligence.trackMetric('Study Completion Rate', 87.5, 'study', '%');
    await this.businessIntelligence.trackMetric('Revenue Per User', 18.75, 'financial', '$');
    await this.businessIntelligence.trackMetric('User Acquisition Cost', 22.50, 'financial', '$');
    await this.businessIntelligence.trackMetric('Study Quality Score', 4.6, 'study', 'stars');
  }

  /**
   * Setup usage analytics with sample sessions
   */
  private async setupUsageAnalytics(): Promise<void> {
    // Create sample user sessions and actions
    const sessionId = await this.usageAnalytics.startSession('user123', 'google', 'desktop');
    
    await this.usageAnalytics.trackAction(
      'user123',
      'page_view',
      'navigation',
      { page: '/dashboard' },
      sessionId
    );
    
    await this.usageAnalytics.trackAction(
      'user123',
      'study_start',
      'study',
      { studyId: 'study456' },
      sessionId
    );
  }

  /**
   * Setup executive dashboard
   */
  private async setupExecutiveDashboard(): Promise<void> {
    // Dashboard will be configured automatically based on available data
    console.log('📊 Executive Dashboard configured');
  }

  /**
   * Get comprehensive analytics status
   */
  getSystemStatus(): {
    businessIntelligence: ReturnType<BusinessIntelligenceService['getStatus']>;
    usageAnalytics: ReturnType<UsageAnalyticsService['getStatus']>;
    executiveDashboard: ReturnType<ExecutiveDashboardService['getStatus']>;
    systemHealth: 'healthy' | 'warning' | 'error';
  } {
    const biStatus = this.businessIntelligence.getStatus();
    const uaStatus = this.usageAnalytics.getStatus();
    const edStatus = this.executiveDashboard.getStatus();

    const systemHealth = (biStatus.isHealthy && uaStatus.isHealthy && edStatus.isHealthy) 
      ? 'healthy' 
      : 'warning';

    return {
      businessIntelligence: biStatus,
      usageAnalytics: uaStatus,
      executiveDashboard: edStatus,
      systemHealth
    };
  }

  /**
   * Generate comprehensive analytics report
   */
  async generateComprehensiveReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    executiveSummary: ExecutiveSummary;
    engagementMetrics: EngagementMetrics;
    dashboardReport: DashboardReport;
  }> {
    const [executiveSummary, engagementMetrics, dashboardReport] = await Promise.all([
      this.businessIntelligence.generateExecutiveSummary(startDate, endDate),
      this.usageAnalytics.calculateEngagementMetrics(startDate, endDate),
      this.executiveDashboard.generateReport(startDate, endDate)
    ]);

    return {
      executiveSummary,
      engagementMetrics,
      dashboardReport
    };
  }

  /**
   * Export all analytics data
   */
  exportSystemData(format: 'json' | 'csv' = 'json'): {
    businessMetrics: string;
    usageAnalytics: ReturnType<UsageAnalyticsService['exportAnalyticsData']>;
  } {
    return {
      businessMetrics: this.businessIntelligence.exportMetricsData(format),
      usageAnalytics: this.usageAnalytics.exportAnalyticsData(format)
    };
  }

  /**
   * Cleanup old data across all services
   */
  async cleanupOldData(olderThanDays: number = 90): Promise<{
    businessIntelligence: number;
    usageAnalytics: ReturnType<UsageAnalyticsService['cleanupOldData']>;
  }> {
    const [biCleanup, uaCleanup] = await Promise.all([
      this.businessIntelligence.cleanupOldMetrics(olderThanDays),
      this.usageAnalytics.cleanupOldData(olderThanDays)
    ]);

    return {
      businessIntelligence: biCleanup,
      usageAnalytics: uaCleanup
    };
  }
}

// Create and export default analytics system instance
export const analyticsSystem = new AnalyticsSystem();
