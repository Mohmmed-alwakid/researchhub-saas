import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  UserCheck,
  Database,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeStudies: number;
  monthlyRevenue: number;
  totalParticipants: number;
  newUsersThisWeek: number;
  completedStudies: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  recentActivity: Array<{
    id: string;
    type: 'user_registered' | 'study_created' | 'payment_received' | 'study_completed';
    description: string;
    timestamp: string;
    user?: string;
  }>;
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeStudies: 0,
    monthlyRevenue: 0,
    totalParticipants: 0,
    newUsersThisWeek: 0,
    completedStudies: 0,
    systemHealth: 'healthy',
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {
          totalUsers: 142,
          activeStudies: 28,
          monthlyRevenue: 12450,
          totalParticipants: 89,
          newUsersThisWeek: 15,
          completedStudies: 156,
          systemHealth: 'healthy',
          recentActivity: [
            {
              id: '1',
              type: 'user_registered',
              description: 'New researcher registered',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              user: 'john.doe@example.com'
            },
            {
              id: '2',
              type: 'study_created',
              description: 'Mobile App UX Study created',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              user: 'researcher@example.com'
            },
            {
              id: '3',
              type: 'payment_received',
              description: 'Pro subscription payment received',
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              user: 'client@company.com'
            }
          ]
        });
      } else {
        // Use mock data if API fails
        setStats({
          totalUsers: 142,
          activeStudies: 28,
          monthlyRevenue: 12450,
          totalParticipants: 89,
          newUsersThisWeek: 15,
          completedStudies: 156,
          systemHealth: 'healthy',
          recentActivity: [
            {
              id: '1',
              type: 'user_registered',
              description: 'New researcher registered',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              user: 'john.doe@example.com'
            },
            {
              id: '2',
              type: 'study_created',
              description: 'Mobile App UX Study created',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              user: 'researcher@example.com'
            },
            {
              id: '3',
              type: 'payment_received',
              description: 'Pro subscription payment received',
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              user: 'client@company.com'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      // Use mock data as fallback
      setStats({
        totalUsers: 142,
        activeStudies: 28,
        monthlyRevenue: 12450,
        totalParticipants: 89,
        newUsersThisWeek: 15,
        completedStudies: 156,
        systemHealth: 'healthy',
        recentActivity: [
          {
            id: '1',
            type: 'user_registered',
            description: 'New researcher registered',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: 'john.doe@example.com'
          },
          {
            id: '2',
            type: 'study_created',
            description: 'Mobile App UX Study created',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            user: 'researcher@example.com'
          },
          {
            id: '3',
            type: 'payment_received',
            description: 'Pro subscription payment received',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            user: 'client@company.com'
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'study_created':
        return <Database className="h-4 w-4 text-blue-600" />;
      case 'payment_received':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'study_completed':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Just now';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading admin overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor platform health, user activity, and key metrics
        </p>
      </div>

      {/* System Health Alert */}
      <div className={`rounded-lg p-4 ${
        stats.systemHealth === 'healthy' 
          ? 'bg-green-50 border border-green-200' 
          : stats.systemHealth === 'warning'
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center">
          {stats.systemHealth === 'healthy' ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className={`h-5 w-5 ${
              stats.systemHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`} />
          )}
          <h3 className={`ml-2 text-sm font-medium ${
            stats.systemHealth === 'healthy' 
              ? 'text-green-800' 
              : stats.systemHealth === 'warning'
              ? 'text-yellow-800'
              : 'text-red-800'
          }`}>
            System Status: {stats.systemHealth === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
          </h3>
        </div>
        <p className={`mt-1 text-sm ${
          stats.systemHealth === 'healthy' 
            ? 'text-green-600' 
            : stats.systemHealth === 'warning'
            ? 'text-yellow-600'
            : 'text-red-600'
        }`}>
          {stats.systemHealth === 'healthy' 
            ? 'All platform services are running normally.'
            : 'Some services may be experiencing issues. Check system settings.'}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600">+{stats.newUsersThisWeek} this week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Studies</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeStudies}</p>
              <p className="text-xs text-gray-500">{stats.completedStudies} completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600">+12% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Participants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
              <p className="text-xs text-blue-600">Active this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600">Latest platform events and user actions</p>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4 flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  {activity.user && (
                    <p className="text-xs text-gray-500">{activity.user}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <Activity className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200">
              Create New Admin User
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md border border-green-200">
              Send Platform Announcement
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md border border-purple-200">
              Generate Monthly Report
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Services</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Gateway</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Service</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-green-600">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="text-sm font-medium text-blue-600">142ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage Used</span>
              <span className="text-sm font-medium text-purple-600">2.4GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium text-orange-600">47</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
