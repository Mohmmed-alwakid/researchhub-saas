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
  return apiService.get<{ data: PlatformOverview }>('admin-consolidated?action=overview').then(response => response.data);
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
  
  // Get token from localStorage
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      token = state?.token || '';
    } catch (error) {
      console.warn('Failed to parse auth storage:', error);
    }
  }
  
  const response = await fetch(`/api/admin-consolidated?action=users&${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  
  // Return the full response object to match what AdvancedUserManagement expects
  return result;
};

export const updateUser = async (userId: string, data: {
  role?: string;
  isActive?: boolean;
  name?: string;
  email?: string;
}): Promise<{ success: boolean; user?: AdminUser; message: string }> => {
  // Get token from localStorage
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      token = state?.token || '';
    } catch (error) {
      console.warn('Failed to parse auth storage:', error);
    }
  }
  
  const response = await fetch(`/api/admin/user-actions?userId=${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<{ success: boolean; user?: AdminUser; message: string }> => {
  // Get token from localStorage
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      token = state?.token || '';
    } catch (error) {
      console.warn('Failed to parse auth storage:', error);
    }
  }
  
  const response = await fetch('/api/admin/user-actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const deleteUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  // Get token from localStorage
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      token = state?.token || '';
    } catch (error) {
      console.warn('Failed to parse auth storage:', error);
    }
  }
  
  const response = await fetch(`/api/admin/user-actions?userId=${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const bulkUpdateUsers = async (data: {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'changeRole';
  value?: string;
}): Promise<{ modifiedCount: number; matchedCount: number }> => {
  return apiService.put<{ data: { modifiedCount: number; matchedCount: number } }>('/api/admin/users/bulk', data).then(response => response.data);
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
  
  return apiService.get<{ data: PaginatedResponse<AdminStudy> }>(`/api/admin/studies?${queryParams.toString()}`).then(response => response.data);
};

export const updateStudyStatus = async (studyId: string, data: {
  status: string;
  reason?: string;
}): Promise<AdminStudy> => {
  return apiService.put<{ data: { study: AdminStudy } }>(`admin-consolidated?action=studies&studyId=${studyId}`, data).then(response => response.data.study);
};

// Recent Activity
export const getRecentActivity = async (limit: number = 20): Promise<AdminActivity[]> => {
  return apiService.get<{ data: AdminActivity[] }>(`admin-consolidated?action=activity&limit=${limit}`).then(response => response.data);
};

// Financial Reporting - UPDATED FOR NEW REAL MONEY INTEGRATION
export const getFinancialReport = async (timeframe: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<FinancialReport> => {
  // Use new payments API endpoint
  return apiService.get<{ data: FinancialReport }>(`payments-consolidated-full?action=financial-overview&timeframe=${timeframe}`).then(response => response.data);
};

// NEW REAL MONEY INTEGRATION ADMIN FUNCTIONS

export interface WithdrawalRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  fees: number;
  netAmount: number;
  paymentMethod: 'paypal' | 'bank_transfer';
  paymentDetails: Record<string, string>;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  adminNotes?: string;
}

/**
 * Get all withdrawal requests for admin review
 */
export const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  return apiService.get<{ data: WithdrawalRequest[] }>('payments-consolidated-full?action=withdrawals').then(response => response.data);
};

/**
 * Process a withdrawal request (approve or reject)
 */
export const processWithdrawal = async (
  withdrawalId: string, 
  action: 'approve' | 'reject', 
  adminNotes?: string
): Promise<{ success: boolean; data?: WithdrawalRequest; error?: string }> => {
  return apiService.post('payments-consolidated-full?action=process-withdrawal', {
    withdrawalId,
    action,
    adminNotes
  });
};

/**
 * Get enhanced financial overview with real money data
 */
export const getEnhancedFinancialOverview = async () => {
  const response = await apiService.get('payments-consolidated-full?action=financial-overview');
  return response;
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

// Payment Management
export interface PaymentRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  planType: 'basic' | 'pro' | 'enterprise';
  amount: number;
  currency: string;
  status: 'pending' | 'verified' | 'rejected';
  paymentMethod: string;
  paymentProofUrl?: string;
  adminNotes?: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export interface PaymentStats {
  totalRequests: number;
  pendingRequests: number;
  verifiedRequests: number;
  rejectedRequests: number;
  totalRevenue: number;
  thisMonthRevenue: number;
}

export const getPaymentRequests = async (): Promise<PaymentRequest[]> => {
  // Get token from localStorage
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      token = state?.token || '';
    } catch (error) {
      console.warn('Failed to parse auth storage:', error);
    }
  }
  
  const response = await fetch('/api/admin/payments/requests', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  return result.data;
};

export const getPaymentAnalytics = async (): Promise<PaymentStats> => {
  // Get token from localStorage
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      token = state?.token || '';
    } catch (error) {
      console.warn('Failed to parse auth storage:', error);
    }
  }
  
  const response = await fetch('/api/admin/payments/analytics', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  return result.data;
};

export const verifyPayment = async (requestId: string, adminNotes?: string): Promise<PaymentRequest> => {
  // Get token from localStorage
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      token = state?.token || '';
    } catch (error) {
      console.warn('Failed to parse auth storage:', error);
    }
  }
  
  const response = await fetch(`/api/admin/payments/requests/${requestId}/verify`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ adminNotes })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  return result.data;
};

export const rejectPayment = async (requestId: string, adminNotes?: string): Promise<PaymentRequest> => {
  // Get token from localStorage
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      token = state?.token || '';
    } catch (error) {
      console.warn('Failed to parse auth storage:', error);
    }
  }
  
  const response = await fetch(`/api/admin/payments/requests/${requestId}/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ adminNotes })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  return result.data;
};

export const addCreditsManually = async (data: {
  email: string;
  credits: number;
  planType?: 'basic' | 'pro' | 'enterprise';
  expiresAt?: string;
}): Promise<{
  message: string;
  user: { id: string; email: string; name: string };
  creditsAdded: number;
  planType: string;
  expiresAt: string | null;
  addedAt: string;
  addedBy: string;
}> => {
  // Get token from localStorage
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      token = state?.token || '';
    } catch (error) {
      console.warn('Failed to parse auth storage:', error);
    }
  }
  
  const response = await fetch('/api/admin/payments/credits/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  return result.data;
};


// Export as default service object
export const adminService = {
  getPlatformOverview,
  getAllUsers,
  updateUser,
  createUser,
  deleteUser,
  bulkUpdateUsers,
  getSystemAnalytics,
  getAllStudies,
  updateStudyStatus,
  getRecentActivity,
  getFinancialReport,
  getUserBehaviorAnalytics,
  getSystemPerformance,
  getPaymentRequests,
  getPaymentAnalytics,
  verifyPayment,
  rejectPayment,
  addCreditsManually,
  // NEW REAL MONEY INTEGRATION
  getWithdrawalRequests,
  processWithdrawal,
  getEnhancedFinancialOverview
};

export default adminService;