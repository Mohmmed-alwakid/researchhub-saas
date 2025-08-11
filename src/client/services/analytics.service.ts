import { apiService } from './api.service';

// Types for analytics data
export interface StudyAnalyticsOverview {
  totalSessions: number;
  completedSessions: number;
  averageDuration: number;
  completionRate: number;
  bounceRate: number;
  userSatisfaction: number;
  totalParticipants: number;
}

export interface AnalyticsTrend {
  date: string;
  sessions: number;
  completions: number;
  avgDuration: number;
  satisfaction: number;
}

export interface DeviceBreakdown {
  device: string;
  value: number;
  color: string;
  sessions: number;
}

export interface TaskPerformance {
  task: string;
  completion: number;
  avgTime: number;
  difficulty: number;
  errorRate: number;
}

export interface UserBehavior {
  timeSpent: number;
  pagesVisited: number;
  clicksPerSession: number;
  scrollDepth: number;
}

export interface RealTimeMetrics {
  activeSessions: number;
  sessionsToday: number;
  completionsToday: number;
  averageSessionTime: number;
}

export interface DashboardAnalytics {
  totalStudies: number;
  activeParticipants: number;
  completionRate: number;
  avgSessionTime: number;
  activeStudies: number;
  recentStudies: Array<{
    id: string;
    title: string;
    status: string;
    participants: number;
    completionRate: number;
    lastUpdate: string;
  }>;
}

export interface StudyAnalyticsData {
  overview: StudyAnalyticsOverview;
  trends: AnalyticsTrend[];
  deviceBreakdown: DeviceBreakdown[];
  taskPerformance: TaskPerformance[];
  userBehavior: UserBehavior[];
  realTimeMetrics: RealTimeMetrics;
}

/**
 * Analytics service for fetching real analytics data
 */
export const analyticsService = {
  /**
   * Get study analytics for a specific study
   */
  async getStudyAnalytics(studyId: string, timeframe: string = '7d'): Promise<StudyAnalyticsData> {
    const response = await apiService.get<{ data: StudyAnalyticsData }>(`/studies?action=analytics&studyId=${studyId}&timeframe=${timeframe}`);
    return response.data;
  },

  /**
   * Get advanced analytics metrics
   */
  async getAdvancedAnalytics(options: {
    studyId?: string;
    timeframe?: string;
    refreshInterval?: number;
  } = {}): Promise<StudyAnalyticsData> {
    const { studyId, timeframe = '7d', refreshInterval } = options;
    
    // If specific study, get study analytics
    if (studyId) {
      return this.getStudyAnalytics(studyId, timeframe);
    }
    
    // Otherwise get platform-wide analytics
    const response = await apiService.get<{ data: StudyAnalyticsData }>(`/analytics?timeframe=${timeframe}&refresh=${refreshInterval}`);
    return response.data;
  },  /**
   * Get dashboard analytics summary
   */
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const response = await apiService.get<{ data: DashboardAnalytics }>('/research-consolidated?action=dashboard-analytics');
    return response.data;
  },

  /**
   * Get real-time analytics updates
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const response = await apiService.get<{ data: RealTimeMetrics }>('/analytics/realtime');
    return response.data;
  }
};

export default analyticsService;
