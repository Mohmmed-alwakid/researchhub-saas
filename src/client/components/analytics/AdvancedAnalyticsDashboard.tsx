import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Activity,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useFeatureFlags } from '../../../shared/config/featureFlags.ts';
import { ComingSoon } from '../common/ComingSoon';

interface AnalyticsData {
  overview: {
    totalSessions: number;
    completedSessions: number;
    averageDuration: number;
    completionRate: number;
    bounceRate: number;
    conversionRate: number;
    userSatisfaction: number;
    totalParticipants: number;
  };
  trends: {
    date: string;
    sessions: number;
    completions: number;
    avgDuration: number;
    satisfaction: number;
  }[];
  deviceBreakdown: {
    device: string;
    value: number;
    color: string;
    sessions: number;
  }[];
  taskPerformance: {
    task: string;
    completion: number;
    avgTime: number;
    difficulty: number;
    errorRate: number;
  }[];
  userBehavior: {
    timeSpent: number;
    pagesVisited: number;
    clicksPerSession: number;
    scrollDepth: number;
  }[];
  realTimeMetrics: {
    activeSessions: number;
    sessionsToday: number;
    completionsToday: number;
    averageSessionTime: number;
  };
}

interface AdvancedAnalyticsDashboardProps {
  studyId?: string;
  dateRange?: string;
  refreshInterval?: number;
}

export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  studyId,
  dateRange = '7d',
  refreshInterval = 30000,
}) => {
  const { advancedAnalytics, realTimeAnalytics, dataExport } = useFeatureFlags();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'sessions' | 'completions' | 'duration' | 'satisfaction'>('sessions');
  const [timeFilter, setTimeFilter] = useState(dateRange);
  const [isRealTime, setIsRealTime] = useState(false);
  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockData: AnalyticsData = {
      overview: {
        totalSessions: 1247,
        completedSessions: 1089,
        averageDuration: 1847,
        completionRate: 87.3,
        bounceRate: 12.7,
        conversionRate: 78.5,
        userSatisfaction: 4.2,
        totalParticipants: 892,
      },
      trends: [
        { date: '2024-01-01', sessions: 45, completions: 38, avgDuration: 1650, satisfaction: 4.1 },
        { date: '2024-01-02', sessions: 62, completions: 55, avgDuration: 1720, satisfaction: 4.3 },
        { date: '2024-01-03', sessions: 58, completions: 48, avgDuration: 1890, satisfaction: 4.0 },
        { date: '2024-01-04', sessions: 71, completions: 63, avgDuration: 1780, satisfaction: 4.4 },
        { date: '2024-01-05', sessions: 68, completions: 59, avgDuration: 1945, satisfaction: 4.2 },
        { date: '2024-01-06', sessions: 83, completions: 72, avgDuration: 1820, satisfaction: 4.5 },
        { date: '2024-01-07', sessions: 76, completions: 68, avgDuration: 1760, satisfaction: 4.3 },
      ],
      deviceBreakdown: [
        { device: 'Desktop', value: 68, color: '#3B82F6', sessions: 847 },
        { device: 'Mobile', value: 25, color: '#10B981', sessions: 312 },
        { device: 'Tablet', value: 7, color: '#F59E0B', sessions: 88 },
      ],
      taskPerformance: [
        { task: 'Navigation Task', completion: 92, avgTime: 180, difficulty: 2.1, errorRate: 8 },
        { task: 'Search Task', completion: 85, avgTime: 245, difficulty: 2.8, errorRate: 15 },
        { task: 'Checkout Flow', completion: 67, avgTime: 420, difficulty: 3.5, errorRate: 33 },
        { task: 'Contact Form', completion: 78, avgTime: 165, difficulty: 2.3, errorRate: 22 },
        { task: 'Product Review', completion: 91, avgTime: 195, difficulty: 1.9, errorRate: 9 },
      ],
      userBehavior: [
        { timeSpent: 120, pagesVisited: 5, clicksPerSession: 12, scrollDepth: 75 },
        { timeSpent: 240, pagesVisited: 8, clicksPerSession: 18, scrollDepth: 85 },
        { timeSpent: 180, pagesVisited: 6, clicksPerSession: 15, scrollDepth: 68 },
        { timeSpent: 300, pagesVisited: 10, clicksPerSession: 22, scrollDepth: 92 },
        { timeSpent: 160, pagesVisited: 4, clicksPerSession: 9, scrollDepth: 58 },
      ],
      realTimeMetrics: {
        activeSessions: 23,
        sessionsToday: 156,
        completionsToday: 134,
        averageSessionTime: 1920,
      },
    };

    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, [studyId, timeFilter]);
  // Real-time updates
  useEffect(() => {
    if (!isRealTime || !realTimeAnalytics) return;

    const interval = setInterval(() => {
      setData(prevData => {
        if (!prevData) return prevData;
        
        // Simulate real-time updates
        return {
          ...prevData,
          realTimeMetrics: {
            ...prevData.realTimeMetrics,
            activeSessions: Math.max(0, prevData.realTimeMetrics.activeSessions + Math.floor(Math.random() * 5) - 2),
            sessionsToday: prevData.realTimeMetrics.sessionsToday + Math.floor(Math.random() * 2),
          },
        };
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isRealTime, refreshInterval, realTimeAnalytics]);

  // Show Coming Soon if advanced analytics is disabled
  if (!advancedAnalytics) {
    return (
      <ComingSoon
        variant="card"
        title="Advanced Analytics Dashboard"
        description="Get comprehensive insights with advanced charts, real-time metrics, and detailed performance analysis."
        features={[
          "Real-time session monitoring",
          "Advanced behavioral analysis",
          "Task performance metrics",
          "Device and browser breakdowns",
          "Data export capabilities",
          "Custom date range filtering"
        ]}
        expectedRelease="Q3 2024"
      />
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMetricData = () => {
    if (!data) return [];
    
    switch (selectedMetric) {
      case 'sessions':
        return data.trends.map(item => ({ ...item, value: item.sessions }));
      case 'completions':
        return data.trends.map(item => ({ ...item, value: item.completions }));
      case 'duration':
        return data.trends.map(item => ({ ...item, value: item.avgDuration }));
      case 'satisfaction':
        return data.trends.map(item => ({ ...item, value: item.satisfaction }));
      default:
        return data.trends.map(item => ({ ...item, value: item.sessions }));
    }
  };
  const exportData = (format: 'csv' | 'pdf' | 'excel') => {
    if (!dataExport) {
      console.log('Data export feature is not available yet');
      return;
    }
    console.log(`Exporting analytics data as ${format.toUpperCase()}`);
    // Implementation for data export
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-500 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>          <Button
            variant={isRealTime ? "primary" : "outline"}
            size="sm"
            onClick={() => setIsRealTime(!isRealTime)}
            className="flex items-center space-x-2"
            disabled={!realTimeAnalytics}
          >
            <Activity className="w-4 h-4" />
            <span>Real-time</span>
            {!realTimeAnalytics && <span className="text-xs">(Coming Soon)</span>}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLoading(true)}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>      {/* Real-time Metrics Bar */}
      {isRealTime && realTimeAnalytics && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">Live Analytics</span>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">{data.realTimeMetrics.activeSessions}</div>
                <div className="text-xs text-blue-600">Active Now</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">{data.realTimeMetrics.sessionsToday}</div>
                <div className="text-xs text-blue-600">Today</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">{data.realTimeMetrics.completionsToday}</div>
                <div className="text-xs text-blue-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-900">{formatDuration(data.realTimeMetrics.averageSessionTime)}</div>
                <div className="text-xs text-blue-600">Avg. Time</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Sessions',
            value: data.overview.totalSessions.toLocaleString(),
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'blue',
          },
          {
            title: 'Completion Rate',
            value: `${data.overview.completionRate}%`,
            change: '+3.2%',
            trend: 'up',
            icon: Target,
            color: 'green',
          },
          {
            title: 'Avg. Duration',
            value: formatDuration(data.overview.averageDuration),
            change: '-2m',
            trend: 'down',
            icon: Clock,
            color: 'yellow',
          },
          {
            title: 'Satisfaction',
            value: `${data.overview.userSatisfaction}/5`,
            change: '+0.3',
            trend: 'up',
            icon: TrendingUp,
            color: 'purple',
          },
        ].map((metric, index) => (
          <Card key={index} variant="elevated" className="hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-${metric.color}-100`}>
                  <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <Card variant="elevated">
          <CardHeader
            title="Performance Trends"
            subtitle="Track key metrics over time"
            action={
              <div className="flex items-center space-x-2">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as 'sessions' | 'completions' | 'duration' | 'satisfaction')}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="sessions">Sessions</option>
                  <option value="completions">Completions</option>
                  <option value="duration">Duration</option>
                  <option value="satisfaction">Satisfaction</option>
                </select>
              </div>
            }
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getMetricData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />                <Tooltip 
                  labelFormatter={(label) => formatDate(label)}
                  formatter={(value) => [value, selectedMetric]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="url(#gradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card variant="elevated">
          <CardHeader
            title="Device Distribution"
            subtitle="Session breakdown by device type"
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ value }) => `${value}%`}
                  >
                    {data.deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {data.deviceBreakdown.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: device.color }}></div>
                      <span className="text-sm text-gray-700">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{device.sessions}</div>
                      <div className="text-xs text-gray-500">{device.value}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Performance Analysis */}
      <Card variant="elevated">
        <CardHeader
          title="Task Performance Analysis"
          subtitle="Detailed breakdown of task completion and efficiency"
          action={
            <div className="flex items-center space-x-2">              <Button variant="outline" size="sm" onClick={() => exportData('csv')} disabled={!dataExport}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
                {!dataExport && <span className="text-xs ml-1">(Coming Soon)</span>}
              </Button>
            </div>
          }
        />
        <CardContent>
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.taskPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="task" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion" fill="#10B981" name="Completion Rate %" />
                <Bar dataKey="avgTime" fill="#3B82F6" name="Avg Time (seconds)" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.taskPerformance.map((task, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-2">{task.task}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completion:</span>
                      <span className="text-sm font-medium">{task.completion}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Time:</span>
                      <span className="text-sm font-medium">{formatDuration(task.avgTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Difficulty:</span>
                      <span className="text-sm font-medium">{task.difficulty}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Error Rate:</span>
                      <span className="text-sm font-medium text-red-600">{task.errorRate}%</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${task.completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Behavior Insights */}
      <Card variant="elevated">
        <CardHeader
          title="User Behavior Insights"
          subtitle="Understanding how users interact with your study"
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={data.userBehavior}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timeSpent" name="Time Spent" unit="s" />
              <YAxis dataKey="pagesVisited" name="Pages Visited" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="User Sessions" dataKey="clicksPerSession" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
