import React, { useState, useEffect, useCallback } from 'react';
import { 
  Route, 
  Clock,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface UserJourneyStep {
  id: string;
  name: string;
  page: string;
  users: number;
  dropoffRate: number;
  avgTimeSpent: number;
  conversionRate: number;
}

interface UserFlow {
  id: string;
  name: string;
  steps: UserJourneyStep[];
  totalUsers: number;
  completionRate: number;
}

interface FunnelData {
  step: string;
  users: number;
  percentage: number;
  dropoff: number;
}

interface UserJourneyData {
  overview: {
    totalJourneys: number;
    avgCompletionRate: number;
    avgJourneyTime: number;
    bounceRate: number;
  };
  userFlows: UserFlow[];
  funnelAnalysis: FunnelData[];
  topExitPages: {
    page: string;
    exits: number;
    exitRate: number;
  }[];
  conversionPaths: {
    path: string;
    users: number;
    conversionRate: number;
  }[];
}

export const UserJourneyAnalytics: React.FC = () => {
  const [data, setData] = useState<UserJourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedFlow, setSelectedFlow] = useState<string>('');

  const fetchJourneyData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/journey?timeRange=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        if (!selectedFlow && result.data.userFlows.length > 0) {
          setSelectedFlow(result.data.userFlows[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user journey data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedFlow]);

  useEffect(() => {
    fetchJourneyData();
  }, [fetchJourneyData]);

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

  const selectedFlowData = data?.userFlows.find(flow => flow.id === selectedFlow);

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
        <p className="text-gray-500">Failed to load user journey data</p>
        <button 
          onClick={fetchJourneyData}
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
          </select>
          
          {data.userFlows.length > 0 && (
            <select
              value={selectedFlow}
              onChange={(e) => setSelectedFlow(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {data.userFlows.map((flow) => (
                <option key={flow.id} value={flow.id}>
                  {flow.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={fetchJourneyData}
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
              <p className="text-sm font-medium text-gray-600">Total Journeys</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.overview.totalJourneys)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Route className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.avgCompletionRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Journey Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(data.overview.avgJourneyTime)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.bounceRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* User Flow Visualization */}
      {selectedFlowData && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Flow: {selectedFlowData.name}
          </h3>
          <div className="mb-4 text-sm text-gray-600">
            {formatNumber(selectedFlowData.totalUsers)} users • {selectedFlowData.completionRate.toFixed(1)}% completion rate
          </div>
          
          <div className="space-y-4">
            {selectedFlowData.steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{step.name}</h4>
                      <p className="text-sm text-gray-600">{step.page}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatNumber(step.users)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDuration(step.avgTimeSpent)}
                      </p>
                    </div>
                  </div>
                  
                  {step.dropoffRate > 0 && (
                    <div className="mt-2 flex items-center space-x-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">
                        {step.dropoffRate.toFixed(1)}% drop-off rate
                      </span>
                    </div>
                  )}
                </div>
                
                {index < selectedFlowData.steps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Funnel Analysis & Exit Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funnel Analysis</h3>
          <div className="space-y-4">
            {data.funnelAnalysis.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{step.step}</span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(step.users)} ({step.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${step.percentage}%` }}
                  />
                </div>
                {step.dropoff > 0 && (
                  <div className="text-xs text-red-600">
                    -{formatNumber(step.dropoff)} users dropped off
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Exit Pages</h3>
          <div className="space-y-3">
            {data.topExitPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{page.page}</p>
                  <p className="text-xs text-gray-600">{page.exitRate.toFixed(1)}% exit rate</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatNumber(page.exits)}
                  </p>
                  <p className="text-xs text-gray-600">exits</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Paths */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Conversion Paths</h3>
        <div className="space-y-3">
          {data.conversionPaths.map((path, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{path.path}</p>
                <p className="text-xs text-gray-600">
                  {formatNumber(path.users)} users
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">
                  {path.conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">conversion</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
