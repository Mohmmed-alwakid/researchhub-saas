import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, BookOpen, Clock, Activity } from 'lucide-react';

// Simple Card Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Badge: React.FC<{ children: React.ReactNode; variant?: string; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
    {children}
  </span>
);

/**
 * Performance Analytics Dashboard Component
 * 
 * Comprehensive monitoring and analytics dashboard for ResearchHub platform
 * Tracks study creation, completion rates, user engagement, and platform performance
 */

interface AnalyticsData {
  totalStudies: number;
  activeParticipants: number;
  completionRate: number;
  avgSessionTime: number;
  studyCreationTrend: Array<{ date: string; count: number }>;
  participantEngagement: Array<{ role: string; count: number; percentage: number }>;
  performanceMetrics: Array<{ metric: string; value: number; trend: 'up' | 'down' | 'stable' }>;
  studyTypeDistribution: Array<{ type: string; count: number; color: string }>;
  platformHealth: {
    apiResponseTime: number;
    uptime: number;
    errorRate: number;
    activeConnections: number;
  };
}

export const PerformanceAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/research-consolidated?action=analytics&timeRange=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real-time platform metrics
  const fetchPlatformMetrics = async () => {
    try {
      const response = await fetch('/api/system-consolidated?action=platform-metrics');
      const data = await response.json();
      
      if (data.success && analyticsData) {
        setAnalyticsData(prev => prev ? {
          ...prev,
          platformHealth: data.platformHealth
        } : null);
      }
    } catch (error) {
      console.error('Failed to fetch platform metrics:', error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up auto-refresh for real-time data
    const refreshInterval = 30000; // 30 seconds
    const interval = setInterval(() => {
      fetchPlatformMetrics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Color scheme for charts
  const COLORS = {
    primary: '#3b82f6',
    secondary: '#8b5cf6', 
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  };

  const studyTypeColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Unavailable</h2>
          <p className="text-gray-600">Unable to load dashboard data. Please try refreshing.</p>
          <button 
            onClick={fetchAnalyticsData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
              <p className="text-gray-600">Real-time platform insights and performance metrics</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <Badge variant="outline" className="flex items-center space-x-1">
                <Activity className="h-3 w-3" />
                <span>Live</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Studies</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalStudies.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.activeParticipants.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +18% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.avgSessionTime}m</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1 text-red-500" />
                -2m from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Health Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Real-time system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.platformHealth.apiResponseTime}ms
                </div>
                <p className="text-sm text-gray-600">API Response Time</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.platformHealth.uptime}%
                </div>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {analyticsData.platformHealth.errorRate}%
                </div>
                <p className="text-sm text-gray-600">Error Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData.platformHealth.activeConnections}
                </div>
                <p className="text-sm text-gray-600">Active Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Study Creation Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Study Creation Trend</CardTitle>
              <CardDescription>Daily study creation over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.studyCreationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Study Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Study Type Distribution</CardTitle>
              <CardDescription>Breakdown of study types created</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.studyTypeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                  >
                    {analyticsData.studyTypeDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={studyTypeColors[index % studyTypeColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Participant Engagement */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Participant Engagement</CardTitle>
            <CardDescription>User roles and engagement levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.participantEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Performance Metrics</CardTitle>
            <CardDescription>Comprehensive platform performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Metric</th>
                    <th className="text-left py-2">Current Value</th>
                    <th className="text-left py-2">Trend</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.performanceMetrics.map((metric, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{metric.metric}</td>
                      <td className="py-2">{metric.value}</td>
                      <td className="py-2">
                        {metric.trend === 'up' && <TrendingUp className="inline h-4 w-4 text-green-500" />}
                        {metric.trend === 'down' && <TrendingDown className="inline h-4 w-4 text-red-500" />}
                        {metric.trend === 'stable' && <span className="text-gray-500">Stable</span>}
                      </td>
                      <td className="py-2">
                        <Badge 
                          variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                        >
                          {metric.trend === 'up' ? 'Good' : metric.trend === 'down' ? 'Needs Attention' : 'Normal'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};