import React, { useState, useEffect, useCallback } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { UserManagementPanel } from './UserManagementPanel';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { useAuthStore } from '../../stores/authStore';
import { 
  LayoutDashboard, Users, BarChart3, Settings, 
  AlertTriangle, Bell, Shield, LogOut 
} from 'lucide-react';

// Type for auth store
interface AuthStoreType {
  token: string | null;
  user: unknown;
  // Add other properties as needed
}

// Enhanced Admin API Client with comprehensive backend integration
class ComprehensiveAdminAPIClient {
  private baseUrl: string;
  private authStore: AuthStoreType;

  constructor(authStore: AuthStoreType, baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.authStore = authStore;
  }

  private async makeRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<{
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }> {
    const token = this.authStore.token;
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

  // Dashboard Analytics
  async getDashboardAnalytics(period = '30d') {
    return await this.makeRequest(`/admin-comprehensive?action=dashboard-analytics&period=${period}`);
  }

  // User Management
  async getAllUsers(limit = 100) {
    return await this.makeRequest(`/admin-comprehensive?action=get-all-users&limit=${limit}`);
  }

  async getUserDetails(userId: string) {
    return await this.makeRequest(`/admin-comprehensive?action=get-user-details&userId=${userId}`);
  }

  async updateUserStatus(userId: string, status: string, reason: string) {
    return await this.makeRequest(`/admin-comprehensive?action=update-user-status`, {
      method: 'POST',
      body: JSON.stringify({ userId, status, reason })
    });
  }

  async suspendUser(userId: string, reason: string) {
    return await this.makeRequest(`/admin-comprehensive?action=suspend-user`, {
      method: 'POST',
      body: JSON.stringify({ userId, reason })
    });
  }

  // Revenue Analytics
  async getRevenueAnalytics(period = '30d') {
    return await this.makeRequest(`/admin-comprehensive?action=revenue-analytics&period=${period}`);
  }

  // System Monitoring
  async getSystemAlerts(status = 'open', limit = 20) {
    return await this.makeRequest(`/admin-comprehensive?action=system-alerts&status=${status}&limit=${limit}`);
  }

  async acknowledgeAlert(alertId: string) {
    return await this.makeRequest('/admin-comprehensive?action=acknowledge-alert', {
      method: 'POST',
      body: JSON.stringify({ alertId })
    });
  }

  // Notifications
  async sendNotification(notification: {
    recipientId: string;
    type: string;
    title: string;
    message: string;
  }) {
    return await this.makeRequest('/admin-comprehensive?action=send-notification', {
      method: 'POST',
      body: JSON.stringify(notification)
    });
  }

  // User Activity
  async getUserActivity(limit = 50) {
    return await this.makeRequest(`/admin-comprehensive?action=user-activity&limit=${limit}`);
  }

  // Legacy methods for compatibility
  async getAdminStats(period = '30d') {
    const response = await this.getDashboardAnalytics(period);
    return response;
  }

  async getSystemMetrics() {
    const response = await this.getDashboardAnalytics('30d');
    return response.data;
  }
}

export const ComprehensiveAdminPanel: React.FC = () => {
  const authStore = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'analytics' | 'settings'>('dashboard');
  const [notifications, setNotifications] = useState<number>(0);
  const [apiClient] = useState(() => new ComprehensiveAdminAPIClient(authStore));

  // Check admin permissions
  useEffect(() => {
    if (!authStore.user || authStore.user.role !== 'admin') {
      // Redirect non-admin users
      window.location.href = '/';
      return;
    }

    // Load initial notifications count
    loadNotifications();
  }, [authStore.user, loadNotifications]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await apiClient.getSystemAlerts('open', 10);
      if (response.success && response.data) {
        setNotifications(response.data.alerts?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [apiClient]);

  const handleLogout = () => {
    authStore.logout();
    window.location.href = '/';
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (!authStore.user || authStore.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">ResearchHub Admin</h1>
                <p className="text-sm text-gray-600">System Administration Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button 
                className="relative p-2 text-gray-400 hover:text-gray-500"
                onClick={loadNotifications}
              >
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {authStore.user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{authStore.user.email}</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-500"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'dashboard' | 'users' | 'analytics' | 'settings')}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className={`mr-2 h-5 w-5 ${
                  activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'
                }`} />
                {tab.label}
                {tab.id === 'dashboard' && notifications > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                    {notifications}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'users' && <UserManagementPanel apiClient={apiClient} />}
        {activeTab === 'analytics' && <AnalyticsDashboard apiClient={apiClient} />}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Settings Panel</h3>
            <p className="mt-1 text-sm text-gray-500">System settings and configuration options coming soon...</p>
          </div>
        )}
      </div>

      {/* Alert for system issues */}
      {notifications > 0 && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                System Alerts
              </p>
              <p className="text-sm text-yellow-700">
                {notifications} alert{notifications !== 1 ? 's' : ''} require attention
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
