import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Bell,
  Shield,
  Server,
  CreditCard,
  RefreshCw,
  X,
  Eye
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'system' | 'security' | 'business' | 'maintenance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_by?: string;
  acknowledged_at?: string;
}

interface AlertCenterProps {
  onAlertAction?: (alertId: string, action: string) => void;
}

const AlertCenter: React.FC<AlertCenterProps> = ({ onAlertAction }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch alerts');
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Set up real-time updates every 60 seconds
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge' })
      });
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged' as const, acknowledged_at: new Date().toISOString() }
            : alert
        ));
        if (onAlertAction) {
          onAlertAction(alertId, 'acknowledge');
        }
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve' })
      });
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'resolved' as const }
            : alert
        ));
        if (onAlertAction) {
          onAlertAction(alertId, 'resolve');
        }
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'system':
        return Server;
      case 'security':
        return Shield;
      case 'business':
        return CreditCard;
      case 'maintenance':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColor = (priority: string, status: string) => {
    if (status === 'resolved') {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    if (status === 'acknowledged') {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="w-4 h-4" />;
      case 'acknowledged':
        return <CheckCircle className="w-4 h-4" />;
      case 'resolved':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  const criticalCount = alerts.filter(a => a.priority === 'critical' && a.status === 'active').length;
  const activeCount = alerts.filter(a => a.status === 'active').length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Alert Center</h3>
          <Bell className="w-5 h-5 text-gray-400 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-semibold text-gray-900">Alert Center</h3>
          <XCircle className="w-5 h-5 text-red-600" />
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load alerts</p>
          <button
            onClick={fetchAlerts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Alert Center</h3>
            {criticalCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded-full">
                {criticalCount} Critical
              </span>
            )}
            {activeCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-600 text-white rounded-full">
                {activeCount} Active
              </span>
            )}
          </div>
          <button
            onClick={fetchAlerts}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          {['all', 'active', 'acknowledged', 'resolved'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as typeof filter)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAlerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${getAlertColor(alert.priority, alert.status)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{alert.title}</span>
                    {getStatusIcon(alert.status)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {alert.status === 'active' && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{alert.type} • {alert.priority} priority</span>
                  <span>{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No alerts found</p>
          </div>
        )}
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Title</label>
                <p className="text-gray-900">{selectedAlert.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Message</label>
                <p className="text-gray-900">{selectedAlert.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="text-gray-900 capitalize">{selectedAlert.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <p className="text-gray-900 capitalize">{selectedAlert.priority}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="text-gray-900 capitalize">{selectedAlert.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-gray-900">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedAlert.acknowledged_at && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Acknowledged</label>
                  <p className="text-gray-900">{new Date(selectedAlert.acknowledged_at).toLocaleString()}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              {selectedAlert.status === 'active' && (
                <button
                  onClick={() => {
                    acknowledgeAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Acknowledge
                </button>
              )}
              {selectedAlert.status === 'acknowledged' && (
                <button
                  onClick={() => {
                    resolveAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertCenter;
