import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Clock, Target, Eye,
  Download, RefreshCw, Activity, Award, CheckCircle
} from 'lucide-react';

interface StudyAnalytics {
  studyId: string;
  studyTitle: string;
  totalParticipants: number;
  completedSessions: number;
  averageCompletionTime: number; // minutes
  completionRate: number; // percentage
  dropoffRate: number; // percentage
  participantRating: number; // 1-5 scale
  createdDate: string;
  lastActivity: string;
  blockAnalytics: BlockAnalytic[];
  participantJourney: ParticipantJourneyData[];
  timeSeriesData: TimeSeriesData[];
  demographicData: DemographicData;
}

interface BlockAnalytic {
  blockId: string;
  blockType: string;
  blockTitle: string;
  viewCount: number;
  completionRate: number;
  averageTimeSpent: number; // seconds
  dropoffCount: number;
  interactionRate: number;
  skipRate: number;
}

interface ParticipantJourneyData {
  step: string;
  participants: number;
  completionRate: number;
  averageTime: number;
}

interface TimeSeriesData {
  date: string;
  participants: number;
  completions: number;
  sessions: number;
}

interface DemographicData {
  ageGroups: { range: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
  deviceTypes: { device: string; count: number }[];
  locations: { country: string; count: number }[];
}

interface AdvancedAnalyticsDashboardProps {
  studyId?: string;
  studies: StudyAnalytics[];
  onStudySelect?: (studyId: string) => void;
  onExportData?: (studyId: string, format: 'csv' | 'json' | 'pdf') => void;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  studyId,
  studies,
  onExportData
}) => {
  const [selectedStudy, setSelectedStudy] = useState<StudyAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('participants');

  // Find selected study
  useEffect(() => {
    if (studyId) {
      const study = studies.find(s => s.studyId === studyId);
      setSelectedStudy(study || studies[0] || null);
    } else {
      setSelectedStudy(studies[0] || null);
    }
  }, [studyId, studies]);

  // Generate mock data for demonstration
  const mockStudyData: StudyAnalytics = useMemo(() => ({
    studyId: 'study-demo',
    studyTitle: 'Mobile App Usability Study',
    totalParticipants: 156,
    completedSessions: 142,
    averageCompletionTime: 18.5,
    completionRate: 91.0,
    dropoffRate: 9.0,
    participantRating: 4.3,
    createdDate: '2024-01-15',
    lastActivity: '2024-02-15',
    blockAnalytics: [
      {
        blockId: 'welcome',
        blockType: 'welcome_screen',
        blockTitle: 'Welcome Screen',
        viewCount: 156,
        completionRate: 98.7,
        averageTimeSpent: 45,
        dropoffCount: 2,
        interactionRate: 100,
        skipRate: 0
      },
      {
        blockId: 'task1',
        blockType: 'task_instruction',
        blockTitle: 'Navigation Task',
        viewCount: 154,
        completionRate: 94.8,
        averageTimeSpent: 120,
        dropoffCount: 8,
        interactionRate: 95.5,
        skipRate: 2.6
      },
      {
        blockId: 'rating1',
        blockType: 'rating_scale',
        blockTitle: 'Ease of Use Rating',
        viewCount: 146,
        completionRate: 97.3,
        averageTimeSpent: 35,
        dropoffCount: 4,
        interactionRate: 100,
        skipRate: 0
      }
    ],
    participantJourney: [
      { step: 'Study Started', participants: 156, completionRate: 100, averageTime: 0 },
      { step: 'Introduction', participants: 154, completionRate: 98.7, averageTime: 2.5 },
      { step: 'Main Tasks', participants: 148, completionRate: 94.9, averageTime: 12.8 },
      { step: 'Feedback', participants: 144, completionRate: 92.3, averageTime: 4.2 },
      { step: 'Study Completed', participants: 142, completionRate: 91.0, averageTime: 18.5 }
    ],
    timeSeriesData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      participants: Math.floor(Math.random() * 15) + 5,
      completions: Math.floor(Math.random() * 12) + 3,
      sessions: Math.floor(Math.random() * 20) + 8
    })),
    demographicData: {
      ageGroups: [
        { range: '18-24', count: 34 },
        { range: '25-34', count: 52 },
        { range: '35-44', count: 41 },
        { range: '45-54', count: 20 },
        { range: '55+', count: 9 }
      ],
      genderDistribution: [
        { gender: 'Female', count: 89 },
        { gender: 'Male', count: 62 },
        { gender: 'Other', count: 5 }
      ],
      deviceTypes: [
        { device: 'Mobile', count: 98 },
        { device: 'Desktop', count: 42 },
        { device: 'Tablet', count: 16 }
      ],
      locations: [
        { country: 'United States', count: 67 },
        { country: 'United Kingdom', count: 34 },
        { country: 'Canada', count: 28 },
        { country: 'Australia', count: 15 },
        { country: 'Other', count: 12 }
      ]
    }
  }), []);

  const currentStudy = selectedStudy || mockStudyData;

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    if (onExportData && currentStudy) {
      onExportData(currentStudy.studyId, format);
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, change, icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(change)}% from last period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <div className={`text-${color}-600`}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">
            {currentStudy.studyTitle} - Comprehensive performance insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="relative">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Participants"
          value={currentStudy.totalParticipants}
          change={12.5}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Completion Rate"
          value={`${currentStudy.completionRate}%`}
          change={5.2}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Avg. Completion Time"
          value={`${currentStudy.averageCompletionTime}m`}
          change={-8.1}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
        />
        <MetricCard
          title="Participant Rating"
          value={`${currentStudy.participantRating}/5`}
          change={2.3}
          icon={<Award className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Activity },
            { id: 'journey', name: 'Participant Journey', icon: Target },
            { id: 'blocks', name: 'Block Performance', icon: Eye },
            { id: 'demographics', name: 'Demographics', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time Series Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Activity Over Time</h3>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="participants">Participants</option>
                    <option value="completions">Completions</option>
                    <option value="sessions">Sessions</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={currentStudy.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Completion Funnel */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Funnel</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentStudy.participantJourney}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="participants" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'journey' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Participant Journey Analysis</h3>
              <div className="space-y-4">
                {currentStudy.participantJourney.map((step, index) => (
                  <div key={step.step} className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{step.step}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{step.participants} participants</span>
                          <span>{step.completionRate}% completion</span>
                          <span>{step.averageTime}m avg time</span>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${step.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'blocks' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Block Performance Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Block
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completion Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dropoffs
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentStudy.blockAnalytics.map((block) => (
                        <tr key={block.blockId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{block.blockTitle}</div>
                              <div className="text-sm text-gray-500">{block.blockType}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {block.viewCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">{block.completionRate}%</div>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${block.completionRate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {block.averageTimeSpent}s
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              block.dropoffCount > 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {block.dropoffCount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demographics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentStudy.demographicData.ageGroups}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percent }) => `${range} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {currentStudy.demographicData.ageGroups.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Device Types */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentStudy.demographicData.deviceTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gender Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
                <div className="space-y-3">
                  {currentStudy.demographicData.genderDistribution.map((item, index) => {
                    const percentage = (item.count / currentStudy.totalParticipants) * 100;
                    return (
                      <div key={item.gender} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{item.gender}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {item.count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Geographic Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                <div className="space-y-3">
                  {currentStudy.demographicData.locations.map((item, index) => {
                    const percentage = (item.count / currentStudy.totalParticipants) * 100;
                    return (
                      <div key={item.country} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{item.country}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {item.count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
