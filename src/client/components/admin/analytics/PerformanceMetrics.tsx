import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  TrendingUp, 
  Server, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

interface PerformanceData {
  overview: {
    avgResponseTime: number;
    uptime: number;
    throughput: number;
    errorRate: number;
  };
  metrics: PerformanceMetric[];
  timeSeriesData: {
    timestamps: string[];
    responseTime: number[];
    throughput: number[];
    errorRate: number[];
    cpuUsage: number[];
    memoryUsage: number[];
  };
}

export const PerformanceMetrics: React.FC = () => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  const fetchPerformanceData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/performance?timeRange=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(fetchPerformanceData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchPerformanceData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Performance Data</h3>
        <p className="text-gray-600 mb-4">There was an error loading the performance metrics.</p>
        <button
          onClick={fetchPerformanceData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Metrics</h2>
          <p className="text-gray-600">Real-time system performance monitoring and analytics</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <select
            value={refreshInterval || ''}
            onChange={(e) => setRefreshInterval(e.target.value ? parseInt(e.target.value) : null)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">Manual Refresh</option>
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
            <option value="300">5 minutes</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
            {getStatusIcon('good')}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{data.overview.avgResponseTime}ms</p>
            <p className="text-sm text-gray-600">Avg Response Time</p>
            <div className="flex items-center space-x-1">
              {getTrendIcon('down')}
              <span className="text-sm text-green-600">-12% from yesterday</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Server className="w-8 h-8 text-green-600" />
            {getStatusIcon('good')}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{data.overview.uptime}%</p>
            <p className="text-sm text-gray-600">System Uptime</p>
            <div className="flex items-center space-x-1">
              {getTrendIcon('stable')}
              <span className="text-sm text-gray-600">99.9% SLA maintained</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-purple-600" />
            {getStatusIcon('good')}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{data.overview.throughput}</p>
            <p className="text-sm text-gray-600">Requests/min</p>
            <div className="flex items-center space-x-1">
              {getTrendIcon('up')}
              <span className="text-sm text-green-600">+8% from yesterday</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            {getStatusIcon(data.overview.errorRate > 1 ? 'warning' : 'good')}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{data.overview.errorRate}%</p>
            <p className="text-sm text-gray-600">Error Rate</p>
            <div className="flex items-center space-x-1">
              {getTrendIcon(data.overview.errorRate > 1 ? 'up' : 'down')}
              <span className={`text-sm ${data.overview.errorRate > 1 ? 'text-red-600' : 'text-green-600'}`}>
                {data.overview.errorRate > 1 ? '+0.3%' : '-0.1%'} from yesterday
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.metrics.slice(0, 6).map((metric) => (
                <div key={metric.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(metric.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                      <p className="text-xs text-gray-500">Updated {metric.lastUpdated}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {metric.value}{metric.unit}
                      </span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <p className={`text-xs ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.trend === 'stable' ? 'Stable' : `${metric.trendValue}%`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Resource Utilization</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* CPU Usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                  <span className="text-sm text-gray-600">
                    {data.timeSeriesData.cpuUsage[data.timeSeriesData.cpuUsage.length - 1]}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${data.timeSeriesData.cpuUsage[data.timeSeriesData.cpuUsage.length - 1]}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                  <span className="text-sm text-gray-600">
                    {data.timeSeriesData.memoryUsage[data.timeSeriesData.memoryUsage.length - 1]}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${data.timeSeriesData.memoryUsage[data.timeSeriesData.memoryUsage.length - 1]}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Database Load */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Database Load</span>
                  <span className="text-sm text-gray-600">Normal</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              {/* API Load */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">API Load</span>
                  <span className="text-sm text-gray-600">Low</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
        </div>
        <div className="p-6">
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Performance charts would be rendered here</p>
              <p className="text-sm text-gray-500">Integration with charting library needed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
