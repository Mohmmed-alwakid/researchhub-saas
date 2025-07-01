import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Database, 
  Clock, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Server
} from 'lucide-react';
import { useFeatureFlags } from '../../../shared/config/featureFlags.ts';
import { ComingSoon } from '../common/ComingSoon';
import { getSystemPerformance, type SystemMetric, type UsageStatistic } from '../../services/admin.service';

// Reuse existing analytics dashboard
import AdvancedAnalyticsDashboard from '../analytics/AdvancedAnalyticsDashboard';

// Local interfaces for component-specific data with icon
interface LocalSystemMetric extends SystemMetric {
  icon: React.ElementType;
}

interface LocalPerformanceData {
  timestamp: Date;
  cpu: number;
  memory: number;
  responseTime: number;
  activeUsers: number;
}

const SystemAnalytics: React.FC = () => {
  const { ENABLE_SYSTEM_ANALYTICS } = useFeatureFlags();
  const [systemMetrics, setSystemMetrics] = useState<LocalSystemMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<LocalPerformanceData[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStatistic[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getSystemPerformance(selectedTimeRange);
      
      // Convert API data to component format
      const metricsWithIcons: LocalSystemMetric[] = data.metrics.map(metric => ({
        ...metric,
        icon: getIconForMetric(metric.id)
      }));
      
      const formattedPerformanceData: LocalPerformanceData[] = data.performanceData.map(pd => ({
        ...pd,
        timestamp: new Date(pd.timestamp)
      }));
      
      setSystemMetrics(metricsWithIcons);
      setPerformanceData(formattedPerformanceData);
      setUsageStats(data.usageStatistics);
      
    } catch (err) {
      console.error('Failed to fetch system performance data:', err);
      setError('Failed to load system performance data');
      
      // Fallback to basic mock data
      const fallbackMetrics: LocalSystemMetric[] = [
        { id: 'cpu', name: 'CPU Usage', value: 68, unit: '%', change: 5.2, status: 'healthy', icon: Activity },
        { id: 'memory', name: 'Memory Usage', value: 74, unit: '%', change: -2.1, status: 'healthy', icon: Database },
        { id: 'response_time', name: 'Response Time', value: 145, unit: 'ms', change: -15, status: 'healthy', icon: Clock },
        { id: 'active_users', name: 'Active Users', value: 0, unit: '', change: 0, status: 'healthy', icon: Users }
      ];
      
      setSystemMetrics(fallbackMetrics);
      setPerformanceData([]);
      setUsageStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemPerformanceData();
  }, [selectedTimeRange]);

  const getIconForMetric = (metricId: string): React.ElementType => {
    switch (metricId) {
      case 'cpu': return Activity;
      case 'memory': return Database;
      case 'response_time': return Clock;
      case 'active_users': return Users;
      case 'error_rate': return AlertTriangle;
      case 'uptime': 
      case 'server_status': return Server;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Coming Soon Overlay */}
      {!ENABLE_SYSTEM_ANALYTICS && (
        <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm">
          <ComingSoon
            variant="overlay"
            title="System Analytics"
            description="Monitor system performance, resource usage, and platform health with comprehensive analytics and real-time metrics."
            features={[
              "Real-time system performance monitoring",
              "Resource usage analytics and trends",
              "User activity and engagement metrics",
              "Platform health and uptime tracking",
              "Performance optimization insights",
              "Automated alerts and notifications"
            ]}
            expectedRelease="Q4 2024"
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading System Analytics</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button 
                onClick={fetchSystemPerformanceData}
                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600">Platform performance and usage insights</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-white border border-gray-300 rounded-lg">
          {[
            { key: '1h', label: '1H' },
            { key: '24h', label: '24H' },
            { key: '7d', label: '7D' },
            { key: '30d', label: '30D' }
          ].map((range) => (
            <button
              key={range.key}
              onClick={() => setSelectedTimeRange(range.key as '1h' | '24h' | '7d' | '30d')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedTimeRange === range.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              } ${range.key === '1h' ? 'rounded-l-lg' : ''} ${range.key === '30d' ? 'rounded-r-lg' : ''}`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* System Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon;
          const statusColor = getStatusColor(metric.status);
          const StatusIcon = getStatusIcon(metric.status);
          
          return (
            <div key={metric.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${statusColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{metric.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {metric.value.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">{metric.unit}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center space-x-1 ${statusColor} rounded-full px-2 py-1`}>
                    {StatusIcon}
                    <span className="text-xs font-medium">{metric.status}</span>
                  </div>
                  <div className={`flex items-center mt-2 text-sm ${
                    metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-600">CPU & Memory usage chart would be rendered here</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-600">Response time chart would be rendered here</p>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      {usageStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>
            <p className="text-sm text-gray-600">Platform activity breakdown</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usageStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {stat.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {stat.value.toLocaleString()} {stat.unit}
                    </td>
                    <td className={`px-6 py-4 text-sm ${
                      stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change >= 0 ? '+' : ''}{stat.change}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {stat.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advanced Analytics Integration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Platform Analytics</h3>
          <p className="text-sm text-gray-600">Detailed performance and user behavior insights</p>
        </div>
        <AdvancedAnalyticsDashboard />
      </div>

      {/* System Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                All systems operational
              </p>
              <p className="text-xs text-green-600">
                System performance is within normal parameters
              </p>
            </div>
          </div>
        </div>

        {/* Performance Data Summary */}
        {performanceData.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Latest Performance Metrics</h4>
            <div className="text-sm text-gray-600">
              Last recorded: {performanceData[performanceData.length - 1]?.timestamp.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemAnalytics;
