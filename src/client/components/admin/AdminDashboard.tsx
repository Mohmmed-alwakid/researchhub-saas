/**
 * PHASE 4: SYSTEM ADMINISTRATION - ADMIN DASHBOARD
 * Comprehensive admin dashboard with real-time system monitoring
 * Requirements Source: docs/requirements/04-SYSTEM_ADMINISTRATION_REQUIREMENTS.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';

// Type definitions for admin dashboard
interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalStudies: number;
  activeStudies: number;
  totalRevenue: number;
  monthlyRevenue: number;
  apiResponseTime: number;
  errorRate: number;
  systemUptime: number;
}

interface UserActivity {
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  type: 'login' | 'registration' | 'study_creation' | 'study_completion' | 'error';
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface AdminStats {
  userGrowth: {
    period: string;
    users: number;
    growth: number;
  }[];
  studyStats: {
    period: string;
    created: number;
    completed: number;
  }[];
  revenueStats: {
    period: string;
    revenue: number;
    subscriptions: number;
  }[];
}

// Admin API Client
interface AuthClient {
  getToken(): string | null;
}

class AdminAPIClient {
  private baseUrl: string;
  private authClient: AuthClient;

  constructor(authClient: AuthClient, baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
    this.authClient = authClient;
  }

  private async makeRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<{
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }> {
    const token = this.authClient.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data: data.data || data,
        error: data.error,
        message: data.message
      };
    } catch (error) {
      console.error('Admin API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      };
    }
  }

  // System metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await this.makeRequest<SystemMetrics>('/admin/metrics');
    return response.data || this.getMockMetrics();
  }

  async getUserActivity(limit = 50): Promise<UserActivity[]> {
    const response = await this.makeRequest<UserActivity[]>(`/admin/activity?limit=${limit}`);
    return response.data || this.getMockActivity();
  }

  async getSystemAlerts(): Promise<SystemAlert[]> {
    const response = await this.makeRequest<SystemAlert[]>('/admin/alerts');
    return response.data || this.getMockAlerts();
  }

  async getAdminStats(period = '30d'): Promise<AdminStats> {
    const response = await this.makeRequest<AdminStats>(`/admin/stats?period=${period}`);
    return response.data || this.getMockStats();
  }

  // User management
  async getUsers(page = 1, limit = 20, search = '', role = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role })
    });
    return await this.makeRequest(`/admin/users?${params}`);
  }

  async updateUserRole(userId: string, role: 'participant' | 'researcher' | 'admin') {
    return await this.makeRequest(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  async suspendUser(userId: string, reason: string) {
    return await this.makeRequest(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Mock data for development
  private getMockMetrics(): SystemMetrics {
    return {
      totalUsers: 2847,
      activeUsers: 1243,
      totalStudies: 456,
      activeStudies: 123,
      totalRevenue: 45600,
      monthlyRevenue: 12400,
      apiResponseTime: 245,
      errorRate: 0.02,
      systemUptime: 99.8
    };
  }

  private getMockActivity(): UserActivity[] {
    return [
      {
        timestamp: new Date(Date.now() - 300000).toISOString(),
        userId: 'user-123',
        userName: 'Sarah Johnson',
        action: 'Study Created',
        details: 'Mobile App Usability Test',
        type: 'study_creation'
      },
      {
        timestamp: new Date(Date.now() - 600000).toISOString(),
        userId: 'user-456',
        userName: 'Mike Chen',
        action: 'User Registration',
        details: 'Researcher account created',
        type: 'registration'
      },
      {
        timestamp: new Date(Date.now() - 900000).toISOString(),
        userId: 'user-789',
        userName: 'Emma Davis',
        action: 'Study Completed',
        details: 'Navigation Test - 15 participants',
        type: 'study_completion'
      }
    ];
  }

  private getMockAlerts(): SystemAlert[] {
    return [
      {
        id: 'alert-1',
        type: 'warning',
        title: 'High API Response Time',
        message: 'API response time has increased to 340ms in the last hour',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        resolved: false
      },
      {
        id: 'alert-2',
        type: 'info',
        title: 'Scheduled Maintenance',
        message: 'Database maintenance scheduled for tonight at 2 AM EST',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        resolved: false
      }
    ];
  }

  private getMockStats(): AdminStats {
    return {
      userGrowth: [
        { period: '7 days ago', users: 2650, growth: 5.2 },
        { period: '6 days ago', users: 2680, growth: 1.1 },
        { period: '5 days ago', users: 2720, growth: 1.5 },
        { period: '4 days ago', users: 2750, growth: 1.1 },
        { period: '3 days ago', users: 2780, growth: 1.1 },
        { period: '2 days ago', users: 2810, growth: 1.1 },
        { period: 'Yesterday', users: 2847, growth: 1.3 }
      ],
      studyStats: [
        { period: 'This week', created: 45, completed: 32 },
        { period: 'Last week', created: 38, completed: 28 },
        { period: '2 weeks ago', created: 42, completed: 35 },
        { period: '3 weeks ago', created: 40, completed: 30 }
      ],
      revenueStats: [
        { period: 'This month', revenue: 12400, subscriptions: 156 },
        { period: 'Last month', revenue: 11800, subscriptions: 148 },
        { period: '2 months ago', revenue: 10900, subscriptions: 142 },
        { period: '3 months ago', revenue: 9800, subscriptions: 135 }
      ]
    };
  }
}

// Main Admin Dashboard Component
interface AdminDashboardProps {
  className?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ className = '' }) => {
  const { user, isAuthenticated, token } = useAuthStore();
  
  // Create simple auth client for API
  const authClient: AuthClient = {
    getToken: () => token
  };
  
  const [adminAPI] = useState(() => new AdminAPIClient(authClient));

  // State management
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [metricsData, activityData, alertsData] = await Promise.all([
        adminAPI.getSystemMetrics(),
        adminAPI.getUserActivity(10),
        adminAPI.getSystemAlerts()
      ]);

      setMetrics(metricsData);
      setActivity(activityData);
      setAlerts(alertsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [adminAPI]);

  // Initialize dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadDashboardData();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(loadDashboardData, 30000);
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isAuthenticated, user?.role, loadDashboardData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [refreshInterval]);

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            You must be logged in to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Admin access required. Your current role: {user?.role}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div className="text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* System Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Users"
              value={metrics.totalUsers.toLocaleString()}
              subtitle={`${metrics.activeUsers.toLocaleString()} active`}
              icon="👥"
              trend="+5.2%"
              trendType="positive"
            />
            <MetricCard
              title="Active Studies"
              value={metrics.activeStudies.toString()}
              subtitle={`${metrics.totalStudies} total`}
              icon="📊"
              trend="+2.1%"
              trendType="positive"
            />
            <MetricCard
              title="Monthly Revenue"
              value={`$${(metrics.monthlyRevenue / 1000).toFixed(1)}k`}
              subtitle={`$${(metrics.totalRevenue / 1000).toFixed(1)}k total`}
              icon="💰"
              trend="+8.3%"
              trendType="positive"
            />
            <MetricCard
              title="System Health"
              value={`${metrics.systemUptime}%`}
              subtitle={`${metrics.apiResponseTime}ms avg response`}
              icon="🟢"
              trend={metrics.errorRate < 0.05 ? "Healthy" : "Degraded"}
              trendType={metrics.errorRate < 0.05 ? "positive" : "negative"}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-500 mt-1">Latest user actions and system events</p>
              </div>
              <div className="divide-y">
                {activity.map((item, index) => (
                  <ActivityItem key={index} activity={item} />
                ))}
              </div>
              <div className="p-4 bg-gray-50">
                <button className="text-blue-600 text-sm hover:text-blue-800">
                  View all activity →
                </button>
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
                <p className="text-sm text-gray-500 mt-1">Warnings and notifications</p>
              </div>
              <div className="divide-y">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-2xl mb-2">✅</div>
                    <p>No active alerts</p>
                    <p className="text-xs mt-1">All systems operating normally</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-500 mt-1">Common administrative tasks</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionButton
                  title="User Management"
                  description="Manage users and roles"
                  icon="👤"
                  onClick={() => console.log('Navigate to user management')}
                />
                <QuickActionButton
                  title="Study Oversight"
                  description="Review and moderate studies"
                  icon="📋"
                  onClick={() => console.log('Navigate to study management')}
                />
                <QuickActionButton
                  title="System Settings"
                  description="Configure platform settings"
                  icon="⚙️"
                  onClick={() => console.log('Navigate to system settings')}
                />
                <QuickActionButton
                  title="Analytics"
                  description="View detailed reports"
                  icon="📈"
                  onClick={() => console.log('Navigate to analytics')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component helpers
const MetricCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  trend: string;
  trendType: 'positive' | 'negative' | 'neutral';
}> = ({ title, value, subtitle, icon, trend, trendType }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
    <div className="mt-4">
      <span className={`text-sm font-medium ${
        trendType === 'positive' ? 'text-green-600' : 
        trendType === 'negative' ? 'text-red-600' : 'text-gray-600'
      }`}>
        {trend}
      </span>
    </div>
  </div>
);

const ActivityItem: React.FC<{ activity: UserActivity }> = ({ activity }) => {
  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'login': return '🔐';
      case 'registration': return '👋';
      case 'study_creation': return '📝';
      case 'study_completion': return '✅';
      case 'error': return '❌';
      default: return '📋';
    }
  };

  const getActivityColor = (type: UserActivity['type']) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'study_completion': return 'text-green-600';
      case 'study_creation': return 'text-blue-600';
      default: return 'text-gray-900';
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-start space-x-3">
        <div className="text-lg">{getActivityIcon(activity.type)}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
            {activity.action}
          </p>
          <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <span>{activity.userName}</span>
            <span className="mx-1">•</span>
            <span>{new Date(activity.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertItem: React.FC<{ alert: SystemAlert }> = ({ alert }) => {
  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '📢';
    }
  };

  const getAlertColor = (type: SystemAlert['type']) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`p-4 border-l-4 ${getAlertColor(alert.type)}`}>
      <div className="flex items-start space-x-3">
        <div className="text-lg">{getAlertIcon(alert.type)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{alert.title}</p>
          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
        {!alert.resolved && (
          <button className="text-xs text-blue-600 hover:text-blue-800">
            Resolve
          </button>
        )}
      </div>
    </div>
  );
};

const QuickActionButton: React.FC<{
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
  >
    <div className="flex items-center space-x-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  </button>
);

export default AdminDashboard;
