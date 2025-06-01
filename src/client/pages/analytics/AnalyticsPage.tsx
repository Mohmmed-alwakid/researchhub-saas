import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Target, 
  TrendingUp, 
  Download,
  Eye,
  MousePointer,
  Play,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import HeatmapAnalytics from '../../components/analytics/HeatmapAnalytics';
import SessionReplay from '../../components/analytics/SessionReplay';
import AdvancedAnalyticsDashboard from '../../components/analytics/AdvancedAnalyticsDashboard';
import { useAppStore } from '../../stores/appStore';

const AnalyticsPage: React.FC = () => {
  const { studyId } = useParams();
  const { currentStudy, fetchStudies } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d');

  // Mock data - replace with actual API calls
  const [analyticsData] = useState({
    overview: {
      totalSessions: 127,
      completedSessions: 89,
      averageDuration: 1847, // seconds
      completionRate: 78.3,
      bounceRate: 12.4,
      userSatisfaction: 4.2
    },
    sessionsByDay: [
      { date: '2024-01-01', sessions: 15, completed: 12 },
      { date: '2024-01-02', sessions: 23, completed: 18 },
      { date: '2024-01-03', sessions: 18, completed: 14 },
      { date: '2024-01-04', sessions: 31, completed: 25 },
      { date: '2024-01-05', sessions: 28, completed: 22 },
      { date: '2024-01-06', sessions: 20, completed: 16 },
      { date: '2024-01-07', sessions: 25, completed: 19 }
    ],
    taskCompletion: [
      { task: 'Task 1: Navigation', completion: 92, avgTime: 180 },
      { task: 'Task 2: Search', completion: 85, avgTime: 245 },
      { task: 'Task 3: Checkout', completion: 67, avgTime: 420 },
      { task: 'Task 4: Contact', completion: 78, avgTime: 165 }
    ],
    deviceBreakdown: [
      { device: 'Desktop', value: 68, color: '#3B82F6' },
      { device: 'Mobile', value: 25, color: '#10B981' },
      { device: 'Tablet', value: 7, color: '#F59E0B' }
    ],    heatmapData: [
      { x: 400, y: 200, intensity: 85, eventType: 'click' as const, timestamp: 1000 },
      { x: 450, y: 250, intensity: 70, eventType: 'click' as const, timestamp: 2000 },
      { x: 300, y: 400, intensity: 60, eventType: 'move' as const, timestamp: 3000 },
      { x: 600, y: 300, intensity: 90, eventType: 'click' as const, timestamp: 4000 },
      { x: 500, y: 350, intensity: 45, eventType: 'scroll' as const, timestamp: 5000 }
    ],
    sessions: [
      {
        id: 'session-1',
        participantId: 'user-123',
        startTime: '2024-01-07T10:30:00Z',
        duration: 1234,
        completionRate: 85,
        recordingUrl: '/recordings/session-1.webm',        events: [
          { id: 'evt-1', timestamp: 1000, type: 'click' as const, x: 400, y: 200, element: 'button.submit' },
          { id: 'evt-2', timestamp: 2500, type: 'scroll' as const, x: 0, y: 300 },
          { id: 'evt-3', timestamp: 4000, type: 'click' as const, x: 600, y: 150, element: 'a.navigation' }
        ]
      }
    ]
  });
  useEffect(() => {
    // Find study in current studies array or fetch all studies if needed
    if (studyId && !currentStudy) {
      fetchStudies();
    }
  }, [studyId, currentStudy, fetchStudies]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const exportData = (format: 'csv' | 'pdf') => {
    // Implementation for data export
    console.log(`Exporting analytics data as ${format.toUpperCase()}`);
  };
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'advanced', label: 'Advanced', icon: Zap },
    { id: 'heatmaps', label: 'Heatmaps', icon: MousePointer },
    { id: 'sessions', label: 'Session Replays', icon: Play },
    { id: 'tasks', label: 'Task Analysis', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-500 mt-1">
                  {currentStudy?.title || 'Study Analytics'} • Last updated: Just now
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Date Range Filter */}
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>

                {/* Export Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportData('csv')}
                    className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </button>
                  <button
                    onClick={() => exportData('pdf')}
                    className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF Report
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mt-6">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalSessions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.completionRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg. Duration</p>
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(analyticsData.overview.averageDuration)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.userSatisfaction}/5</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sessions Over Time */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.sessionsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => formatDate(label)}
                      formatter={(value, name) => [value, name === 'sessions' ? 'Total Sessions' : 'Completed Sessions']}
                    />
                    <Line type="monotone" dataKey="sessions" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Device Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ device, value }) => `${device}: ${value}%`}
                    >
                      {analyticsData.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Task Completion Analysis */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.taskCompletion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="task" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completion" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>        )}

        {/* Advanced Analytics Tab */}
        {activeTab === 'advanced' && (
          <div>
            <AdvancedAnalyticsDashboard
              studyId={studyId}
              dateRange={dateRange}
              refreshInterval={30000}
            />
          </div>
        )}

        {/* Heatmaps Tab */}
        {activeTab === 'heatmaps' && (
          <div>
            <HeatmapAnalytics
              studyId={studyId}
              data={analyticsData.heatmapData}
              showControls={true}
            />
          </div>
        )}

        {/* Session Replays Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {selectedSession ? (
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm"
                  >
                    ← Back to sessions list
                  </button>
                </div>
                <SessionReplay
                  sessionId={selectedSession}
                  recordingUrl={analyticsData.sessions[0].recordingUrl}
                  events={analyticsData.sessions[0].events}
                  duration={analyticsData.sessions[0].duration}
                  showEvents={true}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Session Recordings</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    View recorded user sessions and analyze user behavior
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {analyticsData.sessions.map((session) => (
                    <div key={session.id} className="p-6 hover:bg-gray-50 cursor-pointer" 
                         onClick={() => setSelectedSession(session.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Play className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Session {session.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(session.startTime).toLocaleString()} • 
                              Duration: {formatDuration(session.duration)} • 
                              Completion: {session.completionRate}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {session.events.length} events
                          </span>
                          <Eye className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Task Analysis Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Performance Analysis</h3>
            <div className="space-y-6">
              {analyticsData.taskCompletion.map((task, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">{task.task}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.completion >= 80 
                        ? 'bg-green-100 text-green-800' 
                        : task.completion >= 60 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {task.completion}% completion
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Average Time:</span>
                      <span className="ml-2 font-medium">{formatDuration(task.avgTime)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <span className="ml-2 font-medium">{task.completion}%</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${task.completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
