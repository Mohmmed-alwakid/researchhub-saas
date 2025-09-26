/**
 * Real-time Sentry Monitoring Service
 * Provides live monitoring capabilities and Sentry integration
 */

import * as Sentry from '@sentry/react';

export interface SentryEvent {
  id: string;
  title: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  count: number;
  lastSeen: string;
  status: 'unresolved' | 'resolved' | 'ignored';
  culprit?: string;
  tags?: Record<string, string>;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  slowestEndpoint: string;
  performanceScore: number;
  transactions: Array<{
    name: string;
    avgDuration: number;
    throughput: number;
  }>;
}

export interface UserImpactMetrics {
  affectedUsers: number;
  totalUsers: number;
  impactPercentage: number;
  topAffectedPages: Array<{
    url: string;
    errorCount: number;
    userCount: number;
  }>;
}

export interface SentryDashboardData {
  totalErrors: number;
  criticalErrors: number;
  errorRate: number;
  performance: PerformanceMetrics;
  userImpact: UserImpactMetrics;
  recentIssues: SentryEvent[];
  trends: {
    errorTrend: number; // % change from previous period
    performanceTrend: number;
    userImpactTrend: number;
  };
}

class SentryMonitoringService {
  private static instance: SentryMonitoringService;
  private cache: Map<string, unknown> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private subscribers: Map<string, ((data: unknown) => void)[]> = new Map();

  static getInstance(): SentryMonitoringService {
    if (!SentryMonitoringService.instance) {
      SentryMonitoringService.instance = new SentryMonitoringService();
    }
    return SentryMonitoringService.instance;
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(timeRange: string = '24h'): Promise<SentryDashboardData> {
    const cacheKey = `dashboard-${timeRange}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey) as SentryDashboardData;
    }

    try {
      // In a real implementation, this would call Sentry API
      // For now, we'll simulate realistic data based on current project state
      const data = await this.fetchDashboardMetrics(timeRange);
      
      this.setCache(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes
      this.notifySubscribers('dashboard', data);
      
      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw new Error('Unable to fetch monitoring data');
    }
  }

  /**
   * Get real-time issues
   */
  async getRealtimeIssues(): Promise<SentryEvent[]> {
    const cacheKey = 'realtime-issues';
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey) as SentryEvent[];
    }

    try {
      const issues = await this.fetchRealtimeIssues();
      this.setCache(cacheKey, issues, 30 * 1000); // Cache for 30 seconds
      return issues;
    } catch (error) {
      console.error('Failed to fetch realtime issues:', error);
      return [];
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(timeRange: string = '24h'): Promise<PerformanceMetrics> {
    const cacheKey = `performance-${timeRange}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey) as PerformanceMetrics;
    }

    try {
      const metrics = await this.fetchPerformanceMetrics(timeRange);
      this.setCache(cacheKey, metrics, 2 * 60 * 1000); // Cache for 2 minutes
      return metrics;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      throw new Error('Unable to fetch performance data');
    }
  }

  /**
   * Create a new issue or add context to existing one
   */
  reportIssue(
    message: string, 
    level: 'error' | 'warning' | 'info' = 'error',
    extra?: Record<string, unknown>
  ): void {
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      
      // Add ResearchHub specific context
      scope.setTag('platform', 'researchhub');
      scope.setTag('environment', import.meta.env.MODE);
      
      if (extra) {
        Object.entries(extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      if (level === 'error') {
        Sentry.captureException(new Error(message));
      } else {
        Sentry.captureMessage(message, level);
      }
    });
  }

  /**
   * Track performance transaction
   */
  startTransaction(name: string, operation: string = 'navigation') {
    // Use Sentry.startSpan for modern Sentry SDK
    return Sentry.startSpan({
      name,
      op: operation,
      attributes: {
        platform: 'researchhub',
        environment: import.meta.env.MODE
      }
    }, (span) => span);
  }

  /**
   * Add user context to Sentry
   */
  setUserContext(user: { id: string; email?: string; role?: string }): void {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role
    });
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(channel: string, callback: (data: unknown) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    
    this.subscribers.get(channel)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(channel);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Open Sentry dashboard for specific issue
   */
  openIssueInSentry(issueId: string): void {
    const sentryUrl = `https://afkar.sentry.io/projects/researchhub-saas/issues/${issueId}/`;
    window.open(sentryUrl, '_blank');
  }

  /**
   * Open main Sentry dashboard
   */
  openSentryDashboard(): void {
    const sentryUrl = 'https://afkar.sentry.io/projects/researchhub-saas/';
    window.open(sentryUrl, '_blank');
  }

  // Private methods
  private async fetchDashboardMetrics(_timeRange: string): Promise<SentryDashboardData> {
    // Simulate API call - in production, this would use Sentry's API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      totalErrors: 23,
      criticalErrors: 2,
      errorRate: 0.03,
      performance: {
        avgResponseTime: 245,
        slowestEndpoint: '/api/research-consolidated',
        performanceScore: 92,
        transactions: [
          { name: 'Study Creation', avgDuration: 1200, throughput: 15.2 },
          { name: 'Template Loading', avgDuration: 340, throughput: 45.8 },
          { name: 'User Authentication', avgDuration: 180, throughput: 120.5 }
        ]
      },
      userImpact: {
        affectedUsers: 5,
        totalUsers: 156,
        impactPercentage: 3.2,
        topAffectedPages: [
          { url: '/study-builder', errorCount: 12, userCount: 3 },
          { url: '/dashboard', errorCount: 8, userCount: 2 },
          { url: '/templates', errorCount: 3, userCount: 1 }
        ]
      },
      recentIssues: [
        {
          id: 'STUDY-CREATE-001',
          title: 'TypeError in StudyBuilder component',
          level: 'error',
          count: 8,
          lastSeen: '2 minutes ago',
          status: 'unresolved',
          culprit: 'StudyBuilder.tsx:line 145',
          tags: { component: 'study-builder', browser: 'chrome' },
          user: { id: 'user_123', email: 'researcher@example.com', role: 'researcher' }
        },
        {
          id: 'API-SLOW-002',
          title: 'Slow API response in template loading',
          level: 'warning',
          count: 15,
          lastSeen: '5 minutes ago',
          status: 'unresolved',
          culprit: '/api/templates-consolidated',
          tags: { endpoint: 'templates', method: 'GET' }
        }
      ],
      trends: {
        errorTrend: -12.5, // 12.5% decrease from previous period
        performanceTrend: 8.3,  // 8.3% improvement
        userImpactTrend: -25.0  // 25% decrease in user impact
      }
    };
  }

  private async fetchRealtimeIssues(): Promise<SentryEvent[]> {
    // Simulate real-time issue fetching
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      {
        id: 'REALTIME-001',
        title: 'New authentication error detected',
        level: 'error',
        count: 1,
        lastSeen: 'just now',
        status: 'unresolved',
        culprit: 'auth-consolidated.js:line 67'
      }
    ];
  }

  private async fetchPerformanceMetrics(_timeRange: string): Promise<PerformanceMetrics> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      avgResponseTime: 245,
      slowestEndpoint: '/api/research-consolidated',
      performanceScore: 92,
      transactions: [
        { name: 'Study Creation', avgDuration: 1200, throughput: 15.2 },
        { name: 'Template Loading', avgDuration: 340, throughput: 45.8 },
        { name: 'User Authentication', avgDuration: 180, throughput: 120.5 }
      ]
    };
  }

  private isValidCache(key: string): boolean {
    if (!this.cache.has(key)) return false;
    
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return false;
    }
    
    return true;
  }

  private setCache(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  private notifySubscribers(channel: string, data: unknown): void {
    const callbacks = this.subscribers.get(channel);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

// Export singleton instance
export const sentryMonitoring = SentryMonitoringService.getInstance();
