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
import { getSystemPerformance, type SystemMetric, type PerformanceData } from '../../services/admin.service';

// Reuse existing analytics dashboard
import AdvancedAnalyticsDashboard from '../analytics/AdvancedAnalyticsDashboard';

// Local interfaces for component-specific data
interface LocalSystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;  status: 'healthy' | 'warning' | 'critical';
  icon: React.ElementType;
}

interface LocalPerformanceData {
  timestamp: Date;
  cpu: number;
  memory: number;
  responseTime: number;
  activeUsers: number;
}

interface LocalUsageStatistic {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  percentage: number;
}

interface UsageStatistic {
  period: string;
  newUsers: number;
  activeUsers: number;
  studiesCreated: number;
  recordingsGenerated: number;
  dataProcessed: number; // in GB
}

const SystemAnalytics: React.FC = () => {
  const { ENABLE_SYSTEM_ANALYTICS } = useFeatureFlags();
  const [systemMetrics, setSystemMetrics] = useState<LocalSystemMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<LocalPerformanceData[]>([]);
  const [usageStats, setUsageStats] = useState<LocalUsageStatistic[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemPerformanceData();
  }, [selectedTimeRange]);

  const fetchSystemPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getSystemPerformance(selectedTimeRange);        // Convert API data to component format
      const metricsWithIcons: LocalSystemMetric[] = data.metrics.map(metric => ({
        ...metric,
        status: metric.status === 'error' ? 'critical' : metric.status === 'warning' ? 'warning' : 'healthy',
        icon: getIconForMetric(metric.id)
      }));
      
      const formattedPerformanceData: LocalPerformanceData[] = data.performanceData.map(pd => ({
        ...pd,
        timestamp: new Date(pd.timestamp)
      }));
      
      setSystemMetrics(metricsWithIcons);
      setPerformanceData(formattedPerformanceData);
      setUsageStats(data.usageStatistics as LocalUsageStatistic[]);
      
    } catch (err) {
      console.error('Failed to fetch system performance data:', err);
      setError('Failed to load system performance data');
      
      // Fallback to basic mock data
      setSystemMetrics([
        { id: 'cpu', name: 'CPU Usage', value: 68, unit: '%', change: 5.2, status: 'healthy', icon: Activity },
        { id: 'memory', name: 'Memory Usage', value: 74, unit: '%', change: -2.1, status: 'healthy', icon: Database },
        { id: 'response_time', name: 'Response Time', value: 145, unit: 'ms', change: -15, status: 'healthy', icon: Clock },
        { id: 'active_users', name: 'Active Users', value: 23, unit: '', change: 3, status: 'healthy', icon: Users }
      ]);
      
      setPerformanceData([]);
      setUsageStats([
        { id: 'total_users', name: 'Total Users', value: 1247, unit: 'users', change: 23, percentage: 100 },
        { id: 'active_studies', name: 'Active Studies', value: 89, unit: 'studies', change: 7, percentage: 78 }
      ]);
      
    } finally {
      setLoading(false);
    }
  };

  const getIconForMetric = (metricId: string): React.ElementType => {
    switch (metricId) {
      case 'cpu': return Activity;
      case 'memory': return Database;
      case 'response_time': return Clock;
      case 'active_users': return Users;
      case 'errors': return AlertTriangle;
      case 'server_status': return Server;
      default: return CheckCircle;
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockMetrics: SystemMetric[] = [
        {
          id: 'cpu',
          name: 'CPU Usage',
          value: 68,
          unit: '%',
          change: 5.2,
          status: 'healthy',
          icon: Activity
        },
        {
          id: 'memory',
          name: 'Memory Usage',
          value: 74,
          unit: '%',
          change: -2.1,
          status: 'healthy',
          icon: Database
        },
        {
          id: 'response_time',
          name: 'Avg Response Time',
          value: 245,
          unit: 'ms',
          change: 12.5,
          status: 'warning',
          icon: Clock
        },
        {
          id: 'active_users',
          name: 'Active Users',
          value: 1847,
          unit: '',
          change: 8.7,
          status: 'healthy',
          icon: Users
        },
        {
          id: 'error_rate',
          name: 'Error Rate',
          value: 0.23,
          unit: '%',
          change: -15.3,
          status: 'healthy',
          icon: AlertTriangle
        },
        {
          id: 'uptime',
          name: 'System Uptime',
          value: 99.97,
          unit: '%',
          change: 0.02,
          status: 'healthy',
          icon: Server
        }
      ];
      setSystemMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      // Mock performance data
      const mockData: PerformanceData[] = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        mockData.push({
          timestamp,
          cpuUsage: 60 + Math.random() * 20,
          memoryUsage: 70 + Math.random() * 15,
          activeUsers: 1500 + Math.random() * 500,
          responseTime: 200 + Math.random() * 100
        });
      }
      setPerformanceData(mockData);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    }
  };

  const fetchUsageStatistics = async () => {
    try {
      // Mock usage statistics
      const mockStats: UsageStatistic[] = [
        {
          period: 'Today',
          newUsers: 45,
          activeUsers: 1847,
          studiesCreated: 23,
          recordingsGenerated: 156,
          dataProcessed: 12.4
        },
        {
          period: 'Yesterday',
          newUsers: 38,
          activeUsers: 1792,
          studiesCreated: 19,
          recordingsGenerated: 142,
          dataProcessed: 11.8
        },
        {
          period: 'This Week',
          newUsers: 287,
          activeUsers: 1847,
          studiesCreated: 145,
          recordingsGenerated: 982,
          dataProcessed: 78.6
        },
        {
          period: 'Last Week',
          newUsers: 324,
          activeUsers: 1734,
          studiesCreated: 167,
          recordingsGenerated: 1124,
          dataProcessed: 89.2
        }
      ];
      setUsageStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch usage statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
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
      case 'critical':
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
                  Period
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Users
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Users
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Studies Created
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recordings
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Processed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usageStats.map((stat, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {stat.period}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stat.newUsers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stat.activeUsers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stat.studiesCreated.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stat.recordingsGenerated.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stat.dataProcessed.toFixed(1)} GB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
          <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Response time increased by 12.5%
              </p>
              <p className="text-xs text-yellow-600">
                Average response time is above normal threshold - 5 minutes ago
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                System backup completed successfully
              </p>
              <p className="text-xs text-green-600">
                Daily backup finished without errors - 2 hours ago
              </p>
            </div>
          </div>        </div>

        {/* Performance Data Summary */}
        {performanceData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Latest Performance Metrics</h3>
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
