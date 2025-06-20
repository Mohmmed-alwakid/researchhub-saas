import { apiService } from './api.service';

export interface PlatformOverview {
  totalUsers: number;
  totalStudies: number;
  totalSessions: number;
  activeStudies: number;
  userGrowth: number;
  studyGrowth: number;
  usersByRole: Record<string, number>;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  subscription?: string;
  studiesCreated?: number;
  studiesParticipated?: number;
}

export interface AdminStudy {
  _id: string;
  title: string;
  description: string;
  status: string;
  researcher: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  participantCount?: number;
}

export interface SystemAnalytics {
  userTrends: Array<{ _id: string; count: number }>;
  studyTrends: Array<{ _id: string; count: number }>;
  sessionTrends: Array<{ _id: string; count: number }>;
  timeframe: string;
}

export interface FinancialReport {
  summary: {
    totalRevenue: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    churnRate: number;
    mrr: number;
    totalCustomers: number;
  };
  trends: {
    revenue: Array<{ date: string; revenue: number }>;
    timeframe: string;
  };
  breakdown: {
    byPlan: Record<string, number>;
    topCustomers: Array<{
      name: string;
      email: string;
      totalRevenue: number;
      subscriptionCount: number;
    }>;
  };
  recentSubscriptions: Array<{
    id: string;
    customerName: string;
    customerEmail: string;
    planType: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AdminActivity {
  id: string;
  type: 'user_signup' | 'study_created' | 'subscription' | 'session_started' | 'payment' | 'error';
  description: string;
  timestamp: string;
  user: string;
  metadata?: Record<string, string | number | boolean>;
}

// Platform Overview
export const getPlatformOverview = async (): Promise<PlatformOverview> => {
  return apiService.get<{ data: PlatformOverview }>('/api/admin?action=overview').then(response => response.data);
};

// User Management
export const getAllUsers = async (params: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  
  return apiService.get<any>(`/api/admin?action=users&${queryParams.toString()}`);
};

export const updateUser = async (userId: string, data: {
  role?: string;
  isActive?: boolean;
  name?: string;
  email?: string;
}): Promise<AdminUser> => {
  return apiService.put<{ data: AdminUser }>(`/api/admin?action=user-actions&userId=${userId}`, data).then(response => response.data);
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}): Promise<AdminUser> => {
  return apiService.post<{ data: AdminUser }>('/api/admin?action=user-actions', data).then(response => response.data);
};

export const deleteUser = async (userId: string): Promise<void> => {
  return apiService.delete(`/api/admin?action=user-actions&userId=${userId}`);
};

export const bulkUpdateUsers = async (data: {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'changeRole';
  value?: string;
}): Promise<{ modifiedCount: number; matchedCount: number }> => {
  return apiService.put<{ data: { modifiedCount: number; matchedCount: number } }>('/api/admin?action=users-bulk', data).then(response => response.data);
};

// System Analytics
export const getSystemAnalytics = async (timeframe: '7d' | '30d' | '90d' = '30d'): Promise<SystemAnalytics> => {
  return apiService.get<{ data: SystemAnalytics }>(`/api/admin/user-behavior?timeframe=${timeframe}`).then(response => response.data);
};

// Study Oversight
export const getAllStudies = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<AdminStudy>> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  
  return apiService.get<{ data: PaginatedResponse<AdminStudy> }>(`/api/admin?action=studies&${queryParams.toString()}`).then(response => response.data);
};

export const updateStudyStatus = async (studyId: string, data: {
  status: string;
  reason?: string;
}): Promise<AdminStudy> => {
  return apiService.put<{ data: { study: AdminStudy } }>(`/api/admin?action=studies&studyId=${studyId}`, data).then(response => response.data.study);
};

// Recent Activity
export const getRecentActivity = async (limit: number = 20): Promise<AdminActivity[]> => {
  return apiService.get<{ data: AdminActivity[] }>(`/api/admin?action=activity&limit=${limit}`).then(response => response.data);
};

// Financial Reporting
export const getFinancialReport = async (timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<FinancialReport> => {
  return apiService.get<{ data: FinancialReport }>(`/api/admin?action=financial&timeframe=${timeframe}`).then(response => response.data);
};

// User Behavior Analytics
export interface UserBehaviorAnalytics {
  userEngagement: Array<{ date: string; activeUsers: number; sessionsPerUser: number }>;
  featureUsage: Record<string, number>;
  deviceTypes: Record<string, number>;
  timeframe: string;
}

export const getUserBehaviorAnalytics = async (timeframe: '7d' | '30d' | '90d' = '30d'): Promise<UserBehaviorAnalytics> => {
  return apiService.get<{ data: UserBehaviorAnalytics }>(`/api/admin?action=user-behavior&timeframe=${timeframe}`).then(response => response.data);
};

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  status: 'healthy' | 'warning' | 'error';
}

export interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  responseTime: number;
  activeUsers: number;
}

export interface UsageStatistic {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  percentage: number;
}

export interface SystemPerformance {
  metrics: SystemMetric[];
  performanceData: PerformanceData[];
  usageStatistics: UsageStatistic[];
  timeframe: string;
  lastUpdated: string;
}

// System Performance Analytics
export const getSystemPerformance = async (timeframe: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<SystemPerformance> => {
  return apiService.get<{ data: SystemPerformance }>(`/api/admin/system-performance?timeframe=${timeframe}`).then(response => response.data);
};
