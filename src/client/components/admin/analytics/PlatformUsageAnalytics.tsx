import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Activity, 
  FileText, 
  TrendingUp,
  Clock,
  Globe,
  Smartphone
} from 'lucide-react';

interface PlatformUsageData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalStudies: number;
    totalSessions: number;
    avgSessionDuration: number;
    userGrowthRate: number;
  };
  userActivity: {
    date: string;
    dailyActiveUsers: number;
    newUsers: number;
    returningUsers: number;
    sessionCount: number;
  }[];
  featureUsage: {
    feature: string;
    usageCount: number;
    uniqueUsers: number;
    percentage: number;
  }[];
  deviceBreakdown: {
    device: string;
    users: number;
    percentage: number;
  }[];
  geographicData: {
    country: string;
    users: number;
    percentage: number;
  }[];
}

export const PlatformUsageAnalytics: React.FC = () => {
  const [data, setData] = useState<PlatformUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const fetchPlatformData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/platform?timeRange=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch platform usage data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchPlatformData();
  }, [fetchPlatformData]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load platform usage data</p>
        <button 
          onClick={fetchPlatformData}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <div className="flex border border-gray-300 rounded">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'detailed' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>

        <button
          onClick={fetchPlatformData}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.overview.totalUsers)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">
              +{data.overview.userGrowthRate}% from last period
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.overview.activeUsers)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {((data.overview.activeUsers / data.overview.totalUsers) * 100).toFixed(1)}% 
              of total users
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Studies</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.overview.totalStudies)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {(data.overview.totalStudies / data.overview.activeUsers).toFixed(1)} 
              studies per active user
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Session</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(data.overview.avgSessionDuration)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {formatNumber(data.overview.totalSessions)} total sessions
            </span>
          </div>
        </div>
      </div>

      {viewMode === 'detailed' && (
        <>
          {/* Feature Usage */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h3>
            <div className="space-y-4">
              {data.featureUsage.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {feature.feature}
                      </span>
                      <span className="text-sm text-gray-600">
                        {feature.percentage}%
                      </span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${feature.percentage}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatNumber(feature.usageCount)} uses by {formatNumber(feature.uniqueUsers)} users
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device & Geographic Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Device Breakdown
              </h3>
              <div className="space-y-3">
                {data.deviceBreakdown.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{device.device}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {formatNumber(device.users)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({device.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Geographic Distribution
              </h3>
              <div className="space-y-3">
                {data.geographicData.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{country.country}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {formatNumber(country.users)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({country.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
