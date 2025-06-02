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

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Platform Overview
export const getPlatformOverview = async (): Promise<PlatformOverview> => {
  return apiService.get<{ data: PlatformOverview }>('/admin/overview').then(response => response.data);
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
}): Promise<PaginatedResponse<AdminUser>> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  
  return apiService.get<{ data: PaginatedResponse<AdminUser> }>(`/admin/users?${queryParams.toString()}`).then(response => response.data);
};

export const updateUser = async (userId: string, data: {
  role?: string;
  isActive?: boolean;
  name?: string;
  email?: string;
}): Promise<AdminUser> => {
  return apiService.put<{ data: { user: AdminUser } }>(`/admin/users/${userId}`, data).then(response => response.data.user);
};

export const bulkUpdateUsers = async (data: {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'changeRole';
  value?: string;
}): Promise<{ modifiedCount: number; matchedCount: number }> => {
  return apiService.put<{ data: { modifiedCount: number; matchedCount: number } }>('/admin/users/bulk', data).then(response => response.data);
};

// System Analytics
export const getSystemAnalytics = async (timeframe: '7d' | '30d' | '90d' = '30d'): Promise<SystemAnalytics> => {
  return apiService.get<{ data: SystemAnalytics }>(`/admin/analytics?timeframe=${timeframe}`).then(response => response.data);
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
  
  return apiService.get<{ data: PaginatedResponse<AdminStudy> }>(`/admin/studies?${queryParams.toString()}`).then(response => response.data);
};

export const updateStudyStatus = async (studyId: string, data: {
  status: string;
  reason?: string;
}): Promise<AdminStudy> => {
  return apiService.put<{ data: { study: AdminStudy } }>(`/admin/studies/${studyId}/status`, data).then(response => response.data.study);
};
