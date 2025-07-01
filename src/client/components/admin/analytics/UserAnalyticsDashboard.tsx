import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  UserCheck,
  BarChart3,
  Download
} from 'lucide-react';

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  avgSessionDuration: number;
  retentionRate: number;
  churnRate: number;
  topUserSegments: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

interface EngagementData {
  dailyActiveUsers: Array<{
    date: string;
    count: number;
  }>;
  usersByRole: Array<{
    role: string;
    count: number;
    color: string;
  }>;
  registrationTrend: Array<{
    month: string;
    count: number;
    growth: number;
  }>;
}

interface UserAnalyticsDashboardProps {
  dateRange?: string;
  onExport?: () => void;
}

const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({
  dateRange = '30d',
  onExport
}) => {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange);
  const [activeMetric, setActiveMetric] = useState<'users' | 'engagement' | 'retention'>('users');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      const [metricsResponse, engagementResponse] = await Promise.all([
        fetch(`/api/admin/analytics/user-metrics?range=${selectedDateRange}`),
        fetch(`/api/admin/analytics/user-engagement?range=${selectedDateRange}`)
      ]);

      if (!metricsResponse.ok || !engagementResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const metricsData = await metricsResponse.json();
      const engagementDataResult = await engagementResponse.json();

      if (metricsData.success) setMetrics(metricsData.data);
      if (engagementDataResult.success) setEngagementData(engagementDataResult.data);

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedDateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/admin/export/user-analytics?range=${selectedDateRange}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-analytics-${selectedDateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      onExport?.();
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-center text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error || !metrics || !engagementData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load analytics: {error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Analytics</h2>
          <p className="text-gray-600">Comprehensive user behavior and engagement insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+{metrics.userGrowthRate}% from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.activeUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% of total users
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Session</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.avgSessionDuration}m</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">Average session duration</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Retention Rate</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.retentionRate}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {metrics.churnRate < 10 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className="text-sm text-gray-600">{metrics.churnRate}% churn rate</span>
          </div>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'users', label: 'User Growth', icon: Users },
              { key: 'engagement', label: 'Engagement', icon: Activity },
              { key: 'retention', label: 'Retention', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveMetric(key as 'users' | 'engagement' | 'retention')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeMetric === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeMetric === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Trend */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trend</h3>
                <div className="space-y-3">
                  {engagementData.registrationTrend.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.month}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.growth >= 0 ? '+' : ''}{item.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users by Role */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
                <div className="space-y-3">
                  {engagementData.usersByRole.map((role, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: role.color }}
                        ></div>
                        <span className="text-sm text-gray-600 capitalize">{role.role}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{role.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMetric === 'engagement' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Active Users</h3>
              <div className="space-y-2">
                {engagementData.dailyActiveUsers.slice(-7).map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${(day.count / Math.max(...engagementData.dailyActiveUsers.map(d => d.count))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">{day.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMetric === 'retention' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Segments</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.topUserSegments.map((segment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{segment.name}</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{segment.count}</p>
                    <p className="text-sm text-gray-600">{segment.percentage}% of users</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAnalyticsDashboard;
