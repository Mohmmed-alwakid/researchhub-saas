/**
 * Usage Analytics Service
 * User behavior tracking and engagement analytics for ResearchHub
 * Part of Vibe-Coder-MCP Phase 4 Task 4.4 implementation
 */

export interface UserAction {
  id: string;
  userId: string;
  action: string;
  category: 'navigation' | 'interaction' | 'study' | 'system';
  details: Record<string, unknown>;
  timestamp: Date;
  sessionId: string;
  userAgent?: string;
  ip?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  actions: number;
  studiesViewed: number;
  studiesCompleted: number;
  bounced: boolean;
  source: string;
  device: string;
  location?: string;
}

export interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  conditions: {
    actions: string[];
    timeframe: number; // minutes
    frequency: number;
  };
  users: string[];
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface EngagementMetrics {
  period: {
    start: Date;
    end: Date;
  };
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  pageViewsPerSession: number;
  conversionRate: number;
  retentionRate: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export class UsageAnalyticsService {
  private actions: UserAction[] = [];
  private sessions: Map<string, UserSession> = new Map();
  private patterns: BehaviorPattern[] = [];

  /**
   * Track a user action
   */
  async trackAction(
    userId: string,
    action: string,
    category: UserAction['category'],
    details: Record<string, unknown> = {},
    sessionId: string,
    metadata?: {
      userAgent?: string;
      ip?: string;
    }
  ): Promise<void> {
    const userAction: UserAction = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      category,
      details,
      timestamp: new Date(),
      sessionId,
      userAgent: metadata?.userAgent,
      ip: metadata?.ip
    };

    this.actions.push(userAction);
    await this.updateSession(sessionId, userId, userAction);
    await this.detectBehaviorPatterns(userId);
  }

  /**
   * Start a new user session
   */
  async startSession(
    userId: string,
    source: string = 'direct',
    device: string = 'unknown',
    location?: string
  ): Promise<string> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: UserSession = {
      id: sessionId,
      userId,
      startTime: new Date(),
      pageViews: 0,
      actions: 0,
      studiesViewed: 0,
      studiesCompleted: 0,
      bounced: false,
      source,
      device,
      location
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * End a user session
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.endTime = new Date();
    session.duration = session.endTime.getTime() - session.startTime.getTime();
    
    // Determine if session was a bounce (less than 30 seconds, single page view)
    session.bounced = (session.duration < 30000 && session.pageViews <= 1);

    this.sessions.set(sessionId, session);
  }

  /**
   * Update session with action data
   */
  private async updateSession(
    sessionId: string,
    userId: string,
    action: UserAction
  ): Promise<void> {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      // Create session if it doesn't exist
      session = {
        id: sessionId,
        userId,
        startTime: new Date(),
        pageViews: 0,
        actions: 0,
        studiesViewed: 0,
        studiesCompleted: 0,
        bounced: false,
        source: 'unknown',
        device: 'unknown'
      };
    }

    session.actions += 1;

    // Update specific metrics based on action
    switch (action.action) {
      case 'page_view':
        session.pageViews += 1;
        break;
      case 'study_view':
        session.studiesViewed += 1;
        break;
      case 'study_complete':
        session.studiesCompleted += 1;
        break;
    }

    this.sessions.set(sessionId, session);
  }

  /**
   * Detect behavior patterns in user actions
   */
  private async detectBehaviorPatterns(userId: string): Promise<void> {
    const userActions = this.getUserActions(userId, 24 * 60); // Last 24 hours
    
    // Pattern: Power User (multiple studies completed in short time)
    const recentCompletions = userActions.filter(
      action => action.action === 'study_complete' && 
      Date.now() - action.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    );

    if (recentCompletions.length >= 3) {
      await this.addBehaviorPattern({
        id: `pattern-power-user-${userId}-${Date.now()}`,
        name: 'Power User',
        description: 'User completed multiple studies in a short timeframe',
        conditions: {
          actions: ['study_complete'],
          timeframe: 60,
          frequency: 3
        },
        users: [userId],
        confidence: 0.9,
        impact: 'high',
        recommendation: 'Offer premium features or advanced studies'
      });
    }

    // Pattern: Struggling User (many attempts, few completions)
    const attempts = userActions.filter(action => action.action === 'study_start').length;
    const completions = userActions.filter(action => action.action === 'study_complete').length;
    
    if (attempts >= 5 && completions === 0) {
      await this.addBehaviorPattern({
        id: `pattern-struggling-user-${userId}-${Date.now()}`,
        name: 'Struggling User',
        description: 'User starts but does not complete studies',
        conditions: {
          actions: ['study_start', 'study_abandon'],
          timeframe: 24 * 60,
          frequency: 5
        },
        users: [userId],
        confidence: 0.8,
        impact: 'medium',
        recommendation: 'Provide tutorials or simpler onboarding studies'
      });
    }
  }

  /**
   * Add a behavior pattern
   */
  private async addBehaviorPattern(pattern: BehaviorPattern): Promise<void> {
    // Check if similar pattern already exists
    const existingPattern = this.patterns.find(
      p => p.name === pattern.name && p.users.includes(pattern.users[0])
    );

    if (!existingPattern) {
      this.patterns.push(pattern);
    }
  }

  /**
   * Get user actions within a timeframe
   */
  private getUserActions(userId: string, timeframeMinutes: number): UserAction[] {
    const cutoffTime = new Date(Date.now() - timeframeMinutes * 60 * 1000);
    
    return this.actions.filter(
      action => action.userId === userId && action.timestamp >= cutoffTime
    );
  }

  /**
   * Calculate engagement metrics for a period
   */
  async calculateEngagementMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<EngagementMetrics> {
    const periodSessions = Array.from(this.sessions.values()).filter(
      session => session.startTime >= startDate && session.startTime <= endDate
    );

    const uniqueUsers = new Set(periodSessions.map(session => session.userId));
    const totalUsers = uniqueUsers.size;

    // Calculate new vs returning users
    const userFirstSessions = new Map<string, Date>();
    periodSessions.forEach(session => {
      const currentFirst = userFirstSessions.get(session.userId);
      if (!currentFirst || session.startTime < currentFirst) {
        userFirstSessions.set(session.userId, session.startTime);
      }
    });

    const newUsers = Array.from(userFirstSessions.values()).filter(
      firstSession => firstSession >= startDate
    ).length;

    const returningUsers = totalUsers - newUsers;

    // Calculate averages
    const completedSessions = periodSessions.filter(session => session.duration);
    const averageSessionDuration = completedSessions.length > 0 
      ? completedSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / completedSessions.length
      : 0;

    const bounceRate = periodSessions.length > 0
      ? (periodSessions.filter(session => session.bounced).length / periodSessions.length) * 100
      : 0;

    const pageViewsPerSession = periodSessions.length > 0
      ? periodSessions.reduce((sum, session) => sum + session.pageViews, 0) / periodSessions.length
      : 0;

    const conversions = periodSessions.filter(session => session.studiesCompleted > 0).length;
    const conversionRate = periodSessions.length > 0 ? (conversions / periodSessions.length) * 100 : 0;

    return {
      period: { start: startDate, end: endDate },
      totalUsers,
      activeUsers: totalUsers, // All users in period are considered active
      newUsers,
      returningUsers,
      averageSessionDuration,
      bounceRate,
      pageViewsPerSession,
      conversionRate,
      retentionRate: await this.calculateRetentionRates(Array.from(uniqueUsers))
    };
  }

  /**
   * Calculate user retention rates
   */
  private async calculateRetentionRates(userIds: string[]): Promise<{
    day1: number;
    day7: number;
    day30: number;
  }> {
    const retention = {
      day1: 0,
      day7: 0,
      day30: 0
    };

    for (const userId of userIds) {
      const userSessions = Array.from(this.sessions.values())
        .filter(session => session.userId === userId)
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      if (userSessions.length === 0) continue;

      const firstSession = userSessions[0];
      
      // Check if user returned within 1 day
      const day1Cutoff = new Date(firstSession.startTime.getTime() + 24 * 60 * 60 * 1000);
      const returnedDay1 = userSessions.some(session => 
        session.startTime > firstSession.startTime && session.startTime <= day1Cutoff
      );
      if (returnedDay1) retention.day1++;

      // Check if user returned within 7 days
      const day7Cutoff = new Date(firstSession.startTime.getTime() + 7 * 24 * 60 * 60 * 1000);
      const returnedDay7 = userSessions.some(session => 
        session.startTime > firstSession.startTime && session.startTime <= day7Cutoff
      );
      if (returnedDay7) retention.day7++;

      // Check if user returned within 30 days
      const day30Cutoff = new Date(firstSession.startTime.getTime() + 30 * 24 * 60 * 60 * 1000);
      const returnedDay30 = userSessions.some(session => 
        session.startTime > firstSession.startTime && session.startTime <= day30Cutoff
      );
      if (returnedDay30) retention.day30++;
    }

    const userCount = userIds.length;
    return {
      day1: userCount > 0 ? (retention.day1 / userCount) * 100 : 0,
      day7: userCount > 0 ? (retention.day7 / userCount) * 100 : 0,
      day30: userCount > 0 ? (retention.day30 / userCount) * 100 : 0
    };
  }

  /**
   * Get behavior patterns
   */
  getBehaviorPatterns(impact?: BehaviorPattern['impact']): BehaviorPattern[] {
    if (impact) {
      return this.patterns.filter(pattern => pattern.impact === impact);
    }
    return this.patterns;
  }

  /**
   * Get user journey for a specific user
   */
  getUserJourney(userId: string, timeframeHours: number = 24): {
    sessions: UserSession[];
    actions: UserAction[];
    patterns: BehaviorPattern[];
  } {
    const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);
    
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.startTime >= cutoffTime);
    
    const userActions = this.actions
      .filter(action => action.userId === userId && action.timestamp >= cutoffTime);
    
    const userPatterns = this.patterns
      .filter(pattern => pattern.users.includes(userId));

    return {
      sessions: userSessions,
      actions: userActions,
      patterns: userPatterns
    };
  }

  /**
   * Export analytics data
   */
  exportAnalyticsData(format: 'json' | 'csv' = 'json'): {
    actions: string;
    sessions: string;
    patterns: string;
  } {
    const actionsData = this.actions;
    const sessionsData = Array.from(this.sessions.values());
    const patternsData = this.patterns;

    if (format === 'csv') {
      // Convert to CSV format
      const actionsCsv = this.convertToCSV(actionsData, [
        'id', 'userId', 'action', 'category', 'timestamp', 'sessionId'
      ]);
      
      const sessionsCsv = this.convertToCSV(sessionsData, [
        'id', 'userId', 'startTime', 'endTime', 'duration', 'pageViews', 'actions'
      ]);
      
      const patternsCsv = this.convertToCSV(patternsData, [
        'id', 'name', 'description', 'confidence', 'impact'
      ]);

      return {
        actions: actionsCsv,
        sessions: sessionsCsv,
        patterns: patternsCsv
      };
    }

    return {
      actions: JSON.stringify(actionsData, null, 2),
      sessions: JSON.stringify(sessionsData, null, 2),
      patterns: JSON.stringify(patternsData, null, 2)
    };
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: unknown[], headers: string[]): string {
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
      const row = headers.map(header => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (item as any)[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Clear old analytics data
   */
  async cleanupOldData(olderThanDays: number = 90): Promise<{
    actionsRemoved: number;
    sessionsRemoved: number;
    patternsRemoved: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Remove old actions
    const originalActionsLength = this.actions.length;
    this.actions = this.actions.filter(action => action.timestamp >= cutoffDate);
    const actionsRemoved = originalActionsLength - this.actions.length;

    // Remove old sessions
    const originalSessionsSize = this.sessions.size;
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.startTime < cutoffDate) {
        this.sessions.delete(sessionId);
      }
    }
    const sessionsRemoved = originalSessionsSize - this.sessions.size;

    // Remove old patterns (keep patterns as they represent ongoing insights)
    const patternsRemoved = 0; // Patterns are kept for historical analysis

    return {
      actionsRemoved,
      sessionsRemoved,
      patternsRemoved
    };
  }

  /**
   * Get service status
   */
  getStatus(): {
    isHealthy: boolean;
    actionsCount: number;
    sessionsCount: number;
    patternsCount: number;
    lastUpdated: Date;
  } {
    return {
      isHealthy: true,
      actionsCount: this.actions.length,
      sessionsCount: this.sessions.size,
      patternsCount: this.patterns.length,
      lastUpdated: new Date()
    };
  }
}
