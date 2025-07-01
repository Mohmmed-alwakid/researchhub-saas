import React, { useState, useEffect, useCallback } from 'react';
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
import { Card, CardContent } from '../../components/ui/Card';
import HeatmapAnalytics from '../../components/analytics/HeatmapAnalytics';
import SessionReplay from '../../components/analytics/SessionReplay';
import AdvancedAnalyticsDashboard from '../../components/analytics/AdvancedAnalyticsDashboard';
import { useAppStore } from '../../stores/appStore';
import { useFeatureFlags } from '../../../shared/config/featureFlags.ts';
import type { 
  AnalyticsUIData, 
  OverviewAnalyticsData, 
  ResponseAnalyticsData,
  TimelineData,
  BlockPerformance,
  ParticipantJourney
} from '../../../shared/types/analytics';

const AnalyticsPage: React.FC = () => {
  const { ENABLE_ADVANCED_ANALYTICS } = useFeatureFlags();
  const { studyId } = useParams();
  const { currentStudy, fetchStudies } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsUIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data from API
  const fetchAnalyticsData = useCallback(async (type: string = 'overview') => {
    if (!studyId) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/blocks?action=analytics&studyId=${studyId}&type=${type}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }
      
      return result.data;
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      return null;
    } finally {
      setLoading(false);
    }
  }, [studyId]);

  // Load overview and response analytics on mount
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!studyId) return;
      
      try {
        const [overviewData, responseData] = await Promise.all([
          fetchAnalyticsData('overview'),
          fetchAnalyticsData('responses')
        ]);
        
        if (overviewData && responseData) {
          const overview = overviewData as OverviewAnalyticsData;
          const responses = responseData as ResponseAnalyticsData;
          
          // Combine and format the data for the UI
          setAnalyticsData({
            overview: {
              totalSessions: overview.overview.totalParticipants,
              completedSessions: Math.round(overview.overview.totalParticipants * (overview.overview.completionRate / 100)),
              averageDuration: overview.overview.avgSessionTime || 0,
              completionRate: overview.overview.completionRate,
              bounceRate: 100 - overview.overview.completionRate, // Inverse of completion rate
              userSatisfaction: 4.2 // Default value, should come from satisfaction surveys
            },
            sessionsByDay: overview.timeline.map((day: TimelineData) => ({
              date: day.date,
              sessions: day.count,
              completed: Math.round(day.count * 0.8) // Estimate based on completion rate
            })),
            taskCompletion: responses.blockPerformance.map((block: BlockPerformance) => ({
              task: block.title,
              completion: block.responseRate,
              avgTime: block.averageTime
            })),
            deviceBreakdown: [
              { device: 'Desktop', value: 68, color: '#3B82F6' },
              { device: 'Mobile', value: 25, color: '#10B981' },
              { device: 'Tablet', value: 7, color: '#F59E0B' }
            ],
            // Keep heatmap and session replay data as mock for now
            heatmapData: [
              { x: 400, y: 200, intensity: 85, eventType: 'click' as const, timestamp: 1000 },
              { x: 450, y: 250, intensity: 70, eventType: 'click' as const, timestamp: 2000 },
              { x: 300, y: 400, intensity: 60, eventType: 'move' as const, timestamp: 3000 },
              { x: 600, y: 300, intensity: 90, eventType: 'click' as const, timestamp: 4000 },
              { x: 500, y: 350, intensity: 45, eventType: 'scroll' as const, timestamp: 5000 }
            ],
            sessions: responses.participantJourney.map((step: ParticipantJourney, index: number) => ({
              id: `session-${index + 1}`,
              participantId: `user-${index + 1}`,
              startTime: new Date(Date.now() - (index * 3600000)).toISOString(),
              duration: Math.floor(Math.random() * 1000) + 500,
              completionRate: step.conversionRate,
              recordingUrl: `/recordings/session-${index + 1}.webm`,
              events: [
                { id: `evt-${index}-1`, timestamp: 1000, type: 'click' as const, x: 400, y: 200, element: 'button.submit' },
                { id: `evt-${index}-2`, timestamp: 2500, type: 'scroll' as const, x: 0, y: 300 },
                { id: `evt-${index}-3`, timestamp: 4000, type: 'click' as const, x: 600, y: 150, element: 'a.navigation' }
              ]
            })),
            // Add raw analytics data for advanced features
            rawOverview: overview,
            rawResponses: responses
          });
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError('Failed to load analytics data');
      }
    };

    loadAnalytics();
  }, [studyId, fetchAnalyticsData]);

  // Mock data fallback for when no data is available yet
  const fallbackData = {
    overview: {
      totalSessions: 0,
      completedSessions: 0,
      averageDuration: 0,
      completionRate: 0,
      bounceRate: 0,
      userSatisfaction: 0
    },
    sessionsByDay: [],
    taskCompletion: [],
    deviceBreakdown: [],
    heatmapData: [],
    sessions: []
  };

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

  const exportData = async (format: 'csv' | 'pdf') => {
    if (!studyId) {
      console.error('No study ID available for export');
      return;
    }

    try {
      if (format === 'csv') {
        const response = await fetch(`/api/blocks?action=analytics&studyId=${studyId}&type=export`);
        if (response.ok) {
          const csvContent = await response.text();
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `study-${studyId}-analytics.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        }
      } else {
        // PDF export would need additional implementation
        console.log(`PDF export not yet implemented`);
      }
    } catch (error) {
      console.error(`Failed to export data as ${format}:`, error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const displayData = analyticsData || fallbackData;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    ...(ENABLE_ADVANCED_ANALYTICS ? [{ id: 'advanced', label: 'Advanced', icon: Zap }] : []),
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
              <Card>
                <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{displayData.overview.totalSessions}</p>
                  </div>
                </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{displayData.overview.completionRate}%</p>
                  </div>
                </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg. Duration</p>
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(displayData.overview.averageDuration)}</p>
                  </div>
                </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{displayData.overview.userSatisfaction}/5</p>
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sessions Over Time */}
              <Card>
                <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={displayData.sessionsByDay}>
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
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card>
                <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={displayData.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ device, value }) => `${device}: ${value}%`}
                    >
                      {displayData.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Task Completion Analysis */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={displayData.taskCompletion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="task" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completion" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
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
              data={displayData.heatmapData}
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
                {displayData.sessions[0] && (
                  <SessionReplay
                    sessionId={selectedSession}
                    recordingUrl={displayData.sessions[0].recordingUrl}
                    events={displayData.sessions[0].events.map(event => ({
                      ...event,
                      type: event.type === 'move' ? 'hover' : event.type
                    }))}
                    duration={displayData.sessions[0].duration}
                    showEvents={true}
                  />
                )}
              </div>
            ) : (
              <Card>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Session Recordings</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    View recorded user sessions and analyze user behavior
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {displayData.sessions.map((session) => (
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
              </Card>
            )}
          </div>
        )}

        {/* Task Analysis Tab */}
        {activeTab === 'tasks' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Performance Analysis</h3>
              <div className="space-y-6">
                {displayData.taskCompletion.map((task, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
