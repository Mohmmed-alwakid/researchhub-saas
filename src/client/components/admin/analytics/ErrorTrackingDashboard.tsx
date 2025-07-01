import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  Bug, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Eye,
  BarChart3,
  Users,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface ErrorItem {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'critical';
  count: number;
  firstOccurred: string;
  lastOccurred: string;
  affectedUsers: number;
  stackTrace?: string;
  context?: {
    userAgent?: string;
    url?: string;
    userId?: string;
    sessionId?: string;
  };
  status: 'new' | 'acknowledged' | 'resolved' | 'ignored';
  assignedTo?: string;
}

interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  affectedUsers: number;
  resolvedToday: number;
  trending: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  byType: {
    critical: number;
    error: number;
    warning: number;
  };
  topErrors: ErrorItem[];
}

export const ErrorTrackingDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null);
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedError, setSelectedError] = useState<ErrorItem | null>(null);
  const [timeRange, setTimeRange] = useState('24h');

  const fetchErrorData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter
      });
      
      const response = await fetch(`/api/admin/analytics/errors?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setMetrics(result.data.metrics);
        setErrors(result.data.errors);
      }
    } catch (error) {
      console.error('Failed to fetch error data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    fetchErrorData();
  }, [fetchErrorData]);

  const updateErrorStatus = async (errorId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/errors/${errorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setErrors(prev => prev.map(error => 
          error.id === errorId ? { ...error, status: status as ErrorItem['status'] } : error
        ));
      }
    } catch (error) {
      console.error('Failed to update error status:', error);
    }
  };

  const exportErrors = async () => {
    try {
      const response = await fetch('/api/admin/errors/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          timeRange, 
          filters: { search: searchTerm, status: statusFilter, type: typeFilter }
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `errors-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export errors:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'ignored':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'warning':
        return <Bug className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredErrors = errors.filter(error => {
    const matchesSearch = searchTerm === '' || 
      error.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || error.status === statusFilter;
    const matchesType = typeFilter === 'all' || error.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Tracking</h2>
          <p className="text-gray-600">Monitor and manage application errors and exceptions</p>
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
          <button
            onClick={exportErrors}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={fetchErrorData}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="flex items-center space-x-1">
                {metrics.trending.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : metrics.trending.direction === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                ) : (
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                )}
                <span className={`text-sm ${
                  metrics.trending.direction === 'up' ? 'text-red-600' : 
                  metrics.trending.direction === 'down' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {metrics.trending.percentage}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{metrics.totalErrors.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Errors</p>
              <p className="text-xs text-gray-500">Error rate: {metrics.errorRate}%</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{metrics.affectedUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Affected Users</p>
              <p className="text-xs text-gray-500">Unique users experiencing errors</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{metrics.resolvedToday}</p>
              <p className="text-sm text-gray-600">Resolved Today</p>
              <p className="text-xs text-gray-500">Issues fixed in last 24h</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Critical:</span>
                <span className="font-medium">{metrics.byType.critical}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-600">Error:</span>
                <span className="font-medium">{metrics.byType.error}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Warning:</span>
                <span className="font-medium">{metrics.byType.warning}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Filter Errors</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
              <option value="ignored">Ignored</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">All Types</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Errors ({filteredErrors.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredErrors.length === 0 ? (
            <div className="p-12 text-center">
              <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Errors Found</h3>
              <p className="text-gray-600">No errors match your current filters.</p>
            </div>
          ) : (
            filteredErrors.map((error) => (
              <div key={error.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {getTypeIcon(error.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {error.message}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(error.status)}`}>
                          {error.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>First: {error.firstOccurred}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Last: {error.lastOccurred}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{error.affectedUsers} users</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {error.count} occurrences
                        </span>
                        {error.context?.url && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {error.context.url}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedError(error)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <select
                      value={error.status}
                      onChange={(e) => updateErrorStatus(error.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="new">New</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="resolved">Resolved</option>
                      <option value="ignored">Ignored</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Error Details</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedError.message}</p>
                </div>
                <button
                  onClick={() => setSelectedError(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Error Information</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Type:</dt>
                      <dd className="font-medium">{selectedError.type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Count:</dt>
                      <dd className="font-medium">{selectedError.count}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Affected Users:</dt>
                      <dd className="font-medium">{selectedError.affectedUsers}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Status:</dt>
                      <dd>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedError.status)}`}>
                          {selectedError.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Context</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">First Occurred:</dt>
                      <dd className="font-medium">{selectedError.firstOccurred}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Last Occurred:</dt>
                      <dd className="font-medium">{selectedError.lastOccurred}</dd>
                    </div>
                    {selectedError.context?.url && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">URL:</dt>
                        <dd className="font-medium truncate">{selectedError.context.url}</dd>
                      </div>
                    )}
                    {selectedError.context?.userAgent && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">User Agent:</dt>
                        <dd className="font-medium truncate">{selectedError.context.userAgent}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {selectedError.stackTrace && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Stack Trace</h4>
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                    {selectedError.stackTrace}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
