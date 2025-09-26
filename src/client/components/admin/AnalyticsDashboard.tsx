import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Users,
  Activity,
  Download
} from 'lucide-react';
import { getSystemAnalytics, type SystemAnalytics } from '../../services/admin.service';


interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSystemAnalytics(timeframe);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      default: return 'Last 30 Days';
    }
  };

  const calculateTotal = (data: Array<{ count: number }>) => {
    return data.reduce((sum, item) => sum + item.count, 0);
  };

  const calculateGrowth = (data: Array<{ count: number }>) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-7).reduce((sum, item) => sum + item.count, 0);
    const previous = data.slice(-14, -7).reduce((sum, item) => sum + item.count, 0);
    if (previous === 0) return recent > 0 ? 100 : 0;
    return Math.round(((recent - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const userGrowth = calculateGrowth(analytics.userTrends);
  const studyGrowth = calculateGrowth(analytics.studyTrends);
  const sessionGrowth = calculateGrowth(analytics.sessionTrends);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">System Analytics</h2>
          <p className="text-gray-600">Platform performance and trends</p>
        </div>        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select timeframe for analytics"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button 
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            title="Download analytics report"
            aria-label="Download analytics report"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className={`text-sm font-medium ${userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {userGrowth >= 0 ? '+' : ''}{userGrowth}%
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {calculateTotal(analytics.userTrends)}
            </div>
            <div className="text-sm text-gray-600">New Users ({getTimeframeLabel(timeframe)})</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-500 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className={`text-sm font-medium ${studyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {studyGrowth >= 0 ? '+' : ''}{studyGrowth}%
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {calculateTotal(analytics.studyTrends)}
            </div>
            <div className="text-sm text-gray-600">Studies Created ({getTimeframeLabel(timeframe)})</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className={`text-sm font-medium ${sessionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {sessionGrowth >= 0 ? '+' : ''}{sessionGrowth}%
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {calculateTotal(analytics.sessionTrends)}
            </div>
            <div className="text-sm text-gray-600">Sessions ({getTimeframeLabel(timeframe)})</div>
          </div>
        </div>
      </div>

      {/* Trends Chart - Simple visualization */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Trends Over Time</h3>
        
        {/* User Trends */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">User Registrations</span>
            <span className="text-sm text-gray-500">Daily Average: {Math.round(calculateTotal(analytics.userTrends) / analytics.userTrends.length)}</span>
          </div>          <div className="h-16 bg-gray-100 rounded-lg p-2 flex items-end space-x-1">
            {analytics.userTrends.map((trend, index) => {
              const maxCount = Math.max(...analytics.userTrends.map(t => t.count));
              const heightPercent = Math.max((trend.count / maxCount) * 100, 5);
              return (
                <div
                  key={index}
                  className={`bg-blue-500 rounded-t flex-1 transition-all hover:bg-blue-600`}
                  style={{ height: `${heightPercent}%` }}
                  title={`${trend._id}: ${trend.count} users`}
                />
              );
            })}
          </div>
        </div>

        {/* Study Trends */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Study Creation</span>
            <span className="text-sm text-gray-500">Daily Average: {Math.round(calculateTotal(analytics.studyTrends) / analytics.studyTrends.length)}</span>
          </div>
          <div className="h-16 bg-gray-100 rounded-lg p-2 flex items-end space-x-1">
            {analytics.studyTrends.map((trend, index) => (
              <div
                key={index}
                className="bg-green-500 rounded-t flex-1 transition-all hover:bg-green-600"
                style={{
                  height: `${Math.max((trend.count / Math.max(...analytics.studyTrends.map(t => t.count))) * 100, 5)}%`
                }}
                title={`${trend._id}: ${trend.count} studies`}
              />
            ))}
          </div>
        </div>

        {/* Session Trends */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Session Activity</span>
            <span className="text-sm text-gray-500">Daily Average: {Math.round(calculateTotal(analytics.sessionTrends) / analytics.sessionTrends.length)}</span>
          </div>
          <div className="h-16 bg-gray-100 rounded-lg p-2 flex items-end space-x-1">
            {analytics.sessionTrends.map((trend, index) => (
              <div
                key={index}
                className="bg-purple-500 rounded-t flex-1 transition-all hover:bg-purple-600"
                style={{
                  height: `${Math.max((trend.count / Math.max(...analytics.sessionTrends.map(t => t.count))) * 100, 5)}%`
                }}
                title={`${trend._id}: ${trend.count} sessions`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>  );
};

export default AnalyticsDashboard;
