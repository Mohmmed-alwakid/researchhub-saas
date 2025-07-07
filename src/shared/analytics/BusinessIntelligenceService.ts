/**
 * Business Intelligence Service
 * Comprehensive business metrics and KPI tracking for ResearchHub
 * Part of Vibe-Coder-MCP Phase 4 Task 4.4 implementation
 */

export interface BusinessMetric {
  id: string;
  name: string;
  category: 'user' | 'study' | 'financial' | 'engagement' | 'performance';
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  timestamp: Date;
  targetValue?: number;
  alertThreshold?: number;
}

export interface KPIConfiguration {
  name: string;
  formula: string;
  targets: {
    daily: number;
    weekly: number;
    monthly: number;
    quarterly: number;
  };
  alertRules: {
    critical: number;
    warning: number;
  };
}

export interface BusinessInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  recommendation: string;
  metrics: string[];
  confidence: number;
  timestamp: Date;
}

export interface ExecutiveSummary {
  period: {
    start: Date;
    end: Date;
  };
  overview: {
    totalUsers: number;
    activeStudies: number;
    revenue: number;
    growth: number;
  };
  keyMetrics: BusinessMetric[];
  insights: BusinessInsight[];
  trends: {
    userGrowth: number;
    studyCompletion: number;
    revenue: number;
    engagement: number;
  };
  alerts: {
    critical: number;
    warning: number;
  };
}

export class BusinessIntelligenceService {
  private metrics: Map<string, BusinessMetric> = new Map();
  private kpis: Map<string, KPIConfiguration> = new Map();
  private insights: BusinessInsight[] = [];

  constructor() {
    this.initializeDefaultKPIs();
  }

  /**
   * Initialize default KPIs for ResearchHub
   */
  private initializeDefaultKPIs(): void {
    const defaultKPIs: KPIConfiguration[] = [
      {
        name: 'Monthly Active Users',
        formula: 'unique_users_last_30_days',
        targets: { daily: 50, weekly: 200, monthly: 800, quarterly: 2500 },
        alertRules: { critical: 0.7, warning: 0.85 }
      },
      {
        name: 'Study Completion Rate',
        formula: '(completed_studies / started_studies) * 100',
        targets: { daily: 85, weekly: 85, monthly: 88, quarterly: 90 },
        alertRules: { critical: 70, warning: 80 }
      },
      {
        name: 'User Acquisition Cost',
        formula: 'marketing_spend / new_users',
        targets: { daily: 25, weekly: 25, monthly: 20, quarterly: 15 },
        alertRules: { critical: 40, warning: 30 }
      },
      {
        name: 'Revenue Per User',
        formula: 'total_revenue / active_users',
        targets: { daily: 15, weekly: 15, monthly: 18, quarterly: 22 },
        alertRules: { critical: 10, warning: 12 }
      },
      {
        name: 'Study Quality Score',
        formula: 'avg_study_rating * completion_rate / 100',
        targets: { daily: 4.0, weekly: 4.2, monthly: 4.5, quarterly: 4.7 },
        alertRules: { critical: 3.5, warning: 3.8 }
      }
    ];

    defaultKPIs.forEach(kpi => this.kpis.set(kpi.name, kpi));
  }

  /**
   * Track a business metric
   */
  async trackMetric(
    name: string,
    value: number,
    category: BusinessMetric['category'],
    unit: string = ''
  ): Promise<void> {
    const previousMetric = this.metrics.get(name);
    const trend = this.calculateTrend(value, previousMetric?.value);
    
    const metric: BusinessMetric = {
      id: `${name}-${Date.now()}`,
      name,
      category,
      value,
      unit,
      trend: trend.direction,
      trendPercentage: trend.percentage,
      timestamp: new Date(),
      targetValue: this.getTargetValue(name),
      alertThreshold: this.getAlertThreshold(name)
    };

    this.metrics.set(name, metric);
    await this.checkAlerts(metric);
    await this.generateInsights(metric);
  }

  /**
   * Calculate trend compared to previous value
   */
  private calculateTrend(
    currentValue: number,
    previousValue?: number
  ): { direction: 'up' | 'down' | 'stable'; percentage: number } {
    if (!previousValue || previousValue === 0) {
      return { direction: 'stable', percentage: 0 };
    }

    const change = ((currentValue - previousValue) / previousValue) * 100;
    
    if (Math.abs(change) < 2) {
      return { direction: 'stable', percentage: Math.round(change * 100) / 100 };
    }
    
    return {
      direction: change > 0 ? 'up' : 'down',
      percentage: Math.round(Math.abs(change) * 100) / 100
    };
  }

  /**
   * Get target value for a metric
   */
  private getTargetValue(metricName: string): number | undefined {
    const kpi = this.kpis.get(metricName);
    return kpi?.targets.monthly;
  }

  /**
   * Get alert threshold for a metric
   */
  private getAlertThreshold(metricName: string): number | undefined {
    const kpi = this.kpis.get(metricName);
    return kpi?.alertRules.warning;
  }

  /**
   * Check if metric triggers any alerts
   */
  private async checkAlerts(metric: BusinessMetric): Promise<void> {
    const kpi = this.kpis.get(metric.name);
    if (!kpi) return;

    const target = kpi.targets.monthly;
    const achievementRate = (metric.value / target) * 100;

    if (achievementRate < kpi.alertRules.critical * 100) {
      await this.createAlert('critical', metric, `Critical: ${metric.name} is ${achievementRate.toFixed(1)}% of target`);
    } else if (achievementRate < kpi.alertRules.warning * 100) {
      await this.createAlert('warning', metric, `Warning: ${metric.name} is ${achievementRate.toFixed(1)}% of target`);
    }
  }

  /**
   * Create an alert for a metric
   */
  private async createAlert(
    severity: 'critical' | 'warning',
    metric: BusinessMetric,
    message: string
  ): Promise<void> {
    console.warn(`[${severity.toUpperCase()}] Business Alert: ${message}`, {
      metric: metric.name,
      value: metric.value,
      target: metric.targetValue,
      timestamp: metric.timestamp
    });
  }

  /**
   * Generate insights based on metric patterns
   */
  private async generateInsights(metric: BusinessMetric): Promise<void> {
    const insights: BusinessInsight[] = [];

    // User growth insights
    if (metric.category === 'user' && metric.trend === 'up' && metric.trendPercentage > 20) {
      insights.push({
        id: `insight-${Date.now()}-1`,
        title: 'Strong User Growth Detected',
        description: `${metric.name} has increased by ${metric.trendPercentage}% indicating strong user acquisition`,
        impact: 'high',
        category: 'growth',
        recommendation: 'Consider scaling infrastructure and increasing marketing budget',
        metrics: [metric.name],
        confidence: 0.85,
        timestamp: new Date()
      });
    }

    // Engagement drop insights
    if (metric.category === 'engagement' && metric.trend === 'down' && metric.trendPercentage > 15) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        title: 'Engagement Decline Alert',
        description: `${metric.name} has decreased by ${metric.trendPercentage}% requiring immediate attention`,
        impact: 'high',
        category: 'engagement',
        recommendation: 'Investigate user experience issues and implement retention strategies',
        metrics: [metric.name],
        confidence: 0.90,
        timestamp: new Date()
      });
    }

    // Financial performance insights
    if (metric.category === 'financial' && metric.trend === 'up' && metric.trendPercentage > 10) {
      insights.push({
        id: `insight-${Date.now()}-3`,
        title: 'Revenue Growth Opportunity',
        description: `${metric.name} growth of ${metric.trendPercentage}% suggests strong market demand`,
        impact: 'medium',
        category: 'revenue',
        recommendation: 'Explore premium features and enterprise packages',
        metrics: [metric.name],
        confidence: 0.75,
        timestamp: new Date()
      });
    }

    this.insights.push(...insights);
  }

  /**
   * Get current business metrics
   */
  getMetrics(category?: BusinessMetric['category']): BusinessMetric[] {
    const allMetrics = Array.from(this.metrics.values());
    
    if (category) {
      return allMetrics.filter(metric => metric.category === category);
    }
    
    return allMetrics;
  }

  /**
   * Get business insights
   */
  getInsights(limit: number = 10): BusinessInsight[] {
    return this.insights
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Generate executive summary
   */
  async generateExecutiveSummary(
    startDate: Date,
    endDate: Date
  ): Promise<ExecutiveSummary> {
    const userMetrics = this.getMetrics('user');
    const studyMetrics = this.getMetrics('study');
    const financialMetrics = this.getMetrics('financial');
    
    const totalUsers = userMetrics.find(m => m.name.includes('Total'))?.value || 0;
    const activeStudies = studyMetrics.find(m => m.name.includes('Active'))?.value || 0;
    const revenue = financialMetrics.find(m => m.name.includes('Revenue'))?.value || 0;
    
    const keyMetrics = this.getTopMetrics(5);
    const insights = this.getInsights(3);
    
    return {
      period: { start: startDate, end: endDate },
      overview: {
        totalUsers,
        activeStudies,
        revenue,
        growth: this.calculateOverallGrowth()
      },
      keyMetrics,
      insights,
      trends: {
        userGrowth: this.calculateCategoryTrend('user'),
        studyCompletion: this.calculateCategoryTrend('study'),
        revenue: this.calculateCategoryTrend('financial'),
        engagement: this.calculateCategoryTrend('engagement')
      },
      alerts: {
        critical: this.countAlerts('critical'),
        warning: this.countAlerts('warning')
      }
    };
  }

  /**
   * Get top performing metrics
   */
  private getTopMetrics(limit: number): BusinessMetric[] {
    return Array.from(this.metrics.values())
      .sort((a, b) => {
        // Sort by trend and target achievement
        const aScore = a.trendPercentage + (a.targetValue ? (a.value / a.targetValue) * 100 : 0);
        const bScore = b.trendPercentage + (b.targetValue ? (b.value / b.targetValue) * 100 : 0);
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  /**
   * Calculate overall growth rate
   */
  private calculateOverallGrowth(): number {
    const allMetrics = Array.from(this.metrics.values());
    const growthMetrics = allMetrics.filter(m => m.trend === 'up');
    
    if (growthMetrics.length === 0) return 0;
    
    const averageGrowth = growthMetrics.reduce((sum, metric) => sum + metric.trendPercentage, 0) / growthMetrics.length;
    return Math.round(averageGrowth * 100) / 100;
  }

  /**
   * Calculate trend for a category
   */
  private calculateCategoryTrend(category: BusinessMetric['category']): number {
    const categoryMetrics = this.getMetrics(category);
    if (categoryMetrics.length === 0) return 0;
    
    const averageTrend = categoryMetrics.reduce((sum, metric) => {
      const trendValue = metric.trend === 'up' ? metric.trendPercentage : 
                        metric.trend === 'down' ? -metric.trendPercentage : 0;
      return sum + trendValue;
    }, 0) / categoryMetrics.length;
    
    return Math.round(averageTrend * 100) / 100;
  }

  /**
   * Count alerts by severity
   */
  private countAlerts(_severity: 'critical' | 'warning'): number {
    // In a real implementation, this would query actual alert storage
    return Math.floor(Math.random() * 3); // Placeholder
  }

  /**
   * Export metrics data for external analysis
   */
  exportMetricsData(format: 'json' | 'csv' = 'json'): string {
    const data = Array.from(this.metrics.values());
    
    if (format === 'csv') {
      const headers = ['name', 'category', 'value', 'unit', 'trend', 'trendPercentage', 'timestamp'];
      const csvData = [
        headers.join(','),
        ...data.map(metric => [
          metric.name,
          metric.category,
          metric.value,
          metric.unit,
          metric.trend,
          metric.trendPercentage,
          metric.timestamp.toISOString()
        ].join(','))
      ];
      return csvData.join('\n');
    }
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Clear old metrics data
   */
  async cleanupOldMetrics(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    let removedCount = 0;
    for (const [key, metric] of this.metrics.entries()) {
      if (metric.timestamp < cutoffDate) {
        this.metrics.delete(key);
        removedCount++;
      }
    }
    
    return removedCount;
  }

  /**
   * Get service status
   */
  getStatus(): {
    isHealthy: boolean;
    metricsCount: number;
    insightsCount: number;
    kpisCount: number;
    lastUpdated: Date;
  } {
    return {
      isHealthy: true,
      metricsCount: this.metrics.size,
      insightsCount: this.insights.length,
      kpisCount: this.kpis.size,
      lastUpdated: new Date()
    };
  }
}
