import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
}

interface SystemHealthData {
  overall_status: 'healthy' | 'warning' | 'critical';
  metrics: SystemMetric[];
  last_updated: string;
}

const SystemHealthWidget: React.FC = () => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemHealth();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/admin/system-health');
      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }
      const data = await response.json();
      if (data.success) {
        setHealthData(data.data);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch system health');
      }
    } catch (err) {
      console.error('Error fetching system health:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 'ms') {
      return `${value.toFixed(0)}ms`;
    }
    if (unit === 'MB') {
      return `${(value / 1024 / 1024).toFixed(1)}MB`;
    }
    return `${value}${unit}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <Activity className="w-5 h-5 text-gray-400 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <XCircle className="w-5 h-5 text-red-600" />
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load system health data</p>
          <button
            onClick={fetchSystemHealth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon(healthData.overall_status)}
          <span className={`text-sm font-medium ${getStatusColor(healthData.overall_status).split(' ')[0]}`}>
            {healthData.overall_status.charAt(0).toUpperCase() + healthData.overall_status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {healthData.metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div
              key={metric.id}
              className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <span className="text-xs">{getTrendIcon(metric.trend)}</span>
              </div>
              <div className="text-2xl font-bold">
                {formatValue(metric.value, metric.unit)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Last updated: {new Date(healthData.last_updated).toLocaleTimeString()}</span>
        <button
          onClick={fetchSystemHealth}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Activity className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default SystemHealthWidget;
