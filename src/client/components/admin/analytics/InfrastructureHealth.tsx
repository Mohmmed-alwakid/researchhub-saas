import React, { useState, useEffect, useCallback } from 'react';
import { 
  Server, 
  Database, 
  Cloud, 
  Shield, 
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  MapPin,
  Zap
} from 'lucide-react';

interface ServiceStatus {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'down';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  region?: string;
  version?: string;
}

interface DatabaseHealth {
  status: 'healthy' | 'warning' | 'critical';
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  queries: {
    slow: number;
    total: number;
    avgDuration: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
}

interface InfrastructureData {
  services: ServiceStatus[];
  database: DatabaseHealth;
  resources: {
    cpu: { usage: number; cores: number };
    memory: { usage: number; total: number };
    storage: { usage: number; total: number };
    network: { inbound: number; outbound: number };
  };
  regions: {
    name: string;
    status: 'healthy' | 'warning' | 'down';
    latency: number;
    load: number;
  }[];
}

export const InfrastructureHealth: React.FC = () => {
  const [data, setData] = useState<InfrastructureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchInfrastructureData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/analytics/infrastructure');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch infrastructure data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfrastructureData();
  }, [fetchInfrastructureData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchInfrastructureData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchInfrastructureData]);

  const getStatusIcon = (status: string, size = 'w-4 h-4') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className={`${size} text-green-500`} />;
      case 'warning':
        return <AlertTriangle className={`${size} text-yellow-500`} />;
      case 'down':
      case 'critical':
        return <XCircle className={`${size} text-red-500`} />;
      default:
        return <AlertTriangle className={`${size} text-gray-500`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down':
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Infrastructure Data</h3>
        <p className="text-gray-600 mb-4">There was an error loading the infrastructure health information.</p>
        <button
          onClick={fetchInfrastructureData}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Infrastructure Health</h2>
          <p className="text-gray-600">Real-time monitoring of system components and services</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
          <button
            onClick={fetchInfrastructureData}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Services Status */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.services.map((service) => (
            <div
              key={service.id}
              className={`p-4 rounded-lg border ${getStatusColor(service.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {service.name === 'API Gateway' && <Server className="w-5 h-5" />}
                  {service.name === 'Database' && <Database className="w-5 h-5" />}
                  {service.name === 'Authentication' && <Shield className="w-5 h-5" />}
                  {service.name === 'CDN' && <Cloud className="w-5 h-5" />}
                  {service.name === 'File Storage' && <HardDrive className="w-5 h-5" />}
                  {service.name === 'WebSocket' && <Wifi className="w-5 h-5" />}
                  <span className="font-medium">{service.name}</span>
                </div>
                {getStatusIcon(service.status)}
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-medium">{service.uptime}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Response:</span>
                  <span className="font-medium">{service.responseTime}ms</span>
                </div>
                {service.region && (
                  <div className="flex justify-between">
                    <span>Region:</span>
                    <span className="font-medium">{service.region}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Last Check:</span>
                  <span className="font-medium">{service.lastCheck}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Resource Usage</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* CPU */}
              <div className="flex items-center space-x-4">
                <Cpu className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                    <span className="text-sm text-gray-600">
                      {data.resources.cpu.usage}% of {data.resources.cpu.cores} cores
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        data.resources.cpu.usage > 80 ? 'bg-red-500' :
                        data.resources.cpu.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${data.resources.cpu.usage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Memory */}
              <div className="flex items-center space-x-4">
                <MemoryStick className="w-8 h-8 text-green-600" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                    <span className="text-sm text-gray-600">
                      {formatBytes(data.resources.memory.usage)} / {formatBytes(data.resources.memory.total)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (data.resources.memory.usage / data.resources.memory.total * 100) > 80 ? 'bg-red-500' :
                        (data.resources.memory.usage / data.resources.memory.total * 100) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(data.resources.memory.usage / data.resources.memory.total * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div className="flex items-center space-x-4">
                <HardDrive className="w-8 h-8 text-purple-600" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                    <span className="text-sm text-gray-600">
                      {formatBytes(data.resources.storage.usage)} / {formatBytes(data.resources.storage.total)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (data.resources.storage.usage / data.resources.storage.total * 100) > 80 ? 'bg-red-500' :
                        (data.resources.storage.usage / data.resources.storage.total * 100) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(data.resources.storage.usage / data.resources.storage.total * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Network */}
              <div className="flex items-center space-x-4">
                <Zap className="w-8 h-8 text-orange-600" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Network I/O</span>
                    <span className="text-sm text-gray-600">
                      ↓{formatBytes(data.resources.network.inbound)}/s ↑{formatBytes(data.resources.network.outbound)}/s
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs text-gray-500 text-center">Inbound</div>
                    <div className="text-xs text-gray-500 text-center">Outbound</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Health */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Database Health</h3>
              {getStatusIcon(data.database.status, 'w-5 h-5')}
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Connection Pool */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Connection Pool</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{data.database.connectionPool.active}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{data.database.connectionPool.idle}</div>
                    <div className="text-xs text-gray-500">Idle</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{data.database.connectionPool.total}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              </div>

              {/* Query Performance */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Query Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Duration:</span>
                    <span className="text-sm font-medium">{data.database.queries.avgDuration}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Slow Queries:</span>
                    <span className="text-sm font-medium text-yellow-600">{data.database.queries.slow}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Queries:</span>
                    <span className="text-sm font-medium">{data.database.queries.total}</span>
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Storage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Used:</span>
                    <span className="text-sm font-medium">{formatBytes(data.database.storage.used)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="text-sm font-medium">{formatBytes(data.database.storage.total)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        data.database.storage.percentage > 80 ? 'bg-red-500' :
                        data.database.storage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${data.database.storage.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Regional Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.regions.map((region, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">{region.name}</span>
                  </div>
                  {getStatusIcon(region.status)}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Latency:</span>
                    <span className="font-medium">{region.latency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Load:</span>
                    <span className="font-medium">{region.load}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
