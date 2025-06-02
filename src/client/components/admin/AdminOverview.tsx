import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  AlertCircle, 
  TrendingUp, 
  Activity,
  Database,
  DollarSign
} from 'lucide-react';

// Reuse existing analytics components
import { AdvancedAnalyticsDashboard } from '../analytics/AdvancedAnalyticsDashboard';
import { getPlatformOverview } from '../../services/admin.service';

interface SystemMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'subscription' | 'study_created' | 'payment' | 'error';
  description: string;
  timestamp: Date;
  user?: string;
  severity?: 'low' | 'medium' | 'high';
}

const AdminOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    fetchRecentActivity();
    checkSystemHealth();
  }, []);
  const fetchSystemMetrics = async () => {
    try {
      // Get real platform overview data
      const overview = await getPlatformOverview();
      
      const realMetrics: SystemMetric[] = [
        {
          label: 'Total Users',
          value: overview.totalUsers.toLocaleString(),
          change: overview.userGrowth,
          trend: overview.userGrowth > 0 ? 'up' : overview.userGrowth < 0 ? 'down' : 'stable',
          icon: Users,
          color: 'blue'
        },
        {
          label: 'Active Studies',
          value: overview.activeStudies.toLocaleString(),
          change: overview.studyGrowth,
          trend: overview.studyGrowth > 0 ? 'up' : overview.studyGrowth < 0 ? 'down' : 'stable',
          icon: Database,
          color: 'green'
        },
        {
          label: 'Total Studies',
          value: overview.totalStudies.toLocaleString(),
          change: overview.studyGrowth,
          trend: overview.studyGrowth > 0 ? 'up' : overview.studyGrowth < 0 ? 'down' : 'stable',
          icon: BarChart3,
          color: 'purple'
        },
        {
          label: 'Total Sessions',
          value: overview.totalSessions.toLocaleString(),
          change: 0, // We don't have session growth data yet
          trend: 'stable',
          icon: Activity,
          color: 'orange'
        }
      ];
      setMetrics(realMetrics);
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      // Fallback to mock data if API fails
      const mockMetrics: SystemMetric[] = [
        {
          label: 'Total Users',
          value: '2,847',
          change: 12.5,
          trend: 'up',
          icon: Users,
          color: 'blue'
        },
        {
          label: 'Active Subscriptions',
          value: '1,234',
          change: 8.2,
          trend: 'up',
          icon: CreditCard,
          color: 'green'
        },
        {
          label: 'Monthly Revenue',
          value: '$89,420',
          change: 15.3,
          trend: 'up',
          icon: DollarSign,
          color: 'purple'
        },
        {
          label: 'Active Studies',
          value: '156',
          change: -2.1,
          trend: 'down',
          icon: Database,
          color: 'orange'
        }
      ];
      setMetrics(mockMetrics);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'user_signup',
          description: 'New user registration: john@example.com',
          timestamp: new Date(Date.now() - 5 * 60000),
          user: 'John Doe'
        },
        {
          id: '2',
          type: 'subscription',
          description: 'Pro plan subscription upgraded',
          timestamp: new Date(Date.now() - 15 * 60000),
          user: 'Sarah Wilson'
        },
        {
          id: '3',
          type: 'study_created',
          description: 'New study created: "Mobile App Usability"',
          timestamp: new Date(Date.now() - 30 * 60000),
          user: 'Mike Johnson'
        },
        {
          id: '4',
          type: 'error',
          description: 'Payment processing error',
          timestamp: new Date(Date.now() - 45 * 60000),
          severity: 'medium'
        }
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }
  };  const checkSystemHealth = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setSystemHealth('healthy');
      } else {
        setSystemHealth('warning');
      }
    } catch {
      setSystemHealth('critical');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return Users;
      case 'subscription': return CreditCard;
      case 'study_created': return Database;
      case 'payment': return DollarSign;
      case 'error': return AlertCircle;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string, severity?: string) => {
    if (type === 'error') {
      switch (severity) {
        case 'high': return 'text-red-600 bg-red-50';
        case 'medium': return 'text-orange-600 bg-orange-50';
        default: return 'text-yellow-600 bg-yellow-50';
      }
    }
    
    switch (type) {
      case 'user_signup': return 'text-blue-600 bg-blue-50';
      case 'subscription': return 'text-green-600 bg-green-50';
      case 'study_created': return 'text-purple-600 bg-purple-50';
      case 'payment': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-600">System status and key metrics</p>
        </div>
        
        {/* System Health Indicator */}
        <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          systemHealth === 'healthy' 
            ? 'bg-green-100 text-green-800'
            : systemHealth === 'warning'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          <Activity className="w-4 h-4 mr-2" />
          System {systemHealth === 'healthy' ? 'Healthy' : systemHealth === 'warning' ? 'Warning' : 'Critical'}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-${metric.color}-50`}>
                  <Icon className={`w-6 h-6 text-${metric.color}-600`} />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  metric.trend === 'up' 
                    ? 'text-green-600' 
                    : metric.trend === 'down' 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  <TrendingUp className={`w-4 h-4 mr-1 ${
                    metric.trend === 'down' ? 'rotate-180' : ''
                  }`} />
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-600">Latest platform events</p>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type, activity.severity);
                
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      {activity.user && (
                        <p className="text-xs text-gray-600">by {activity.user}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {activity.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Advanced Analytics */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">System Analytics</h3>
              <p className="text-sm text-gray-600">Platform performance overview</p>
            </div>
            <AdvancedAnalyticsDashboard />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Users className="w-5 h-5 mr-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">View Billing</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <BarChart3 className="w-5 h-5 mr-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">View Analytics</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <AlertCircle className="w-5 h-5 mr-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">System Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
