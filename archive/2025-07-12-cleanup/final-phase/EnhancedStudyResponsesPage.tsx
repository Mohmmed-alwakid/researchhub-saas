import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  BarChart3, 
  Download,
  Search,
  RefreshCw,
  Eye,
  Clock,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../stores/appStore';
import { IStudy } from '../../../shared/types';
import AIInsightsDashboard from '../../components/ai/AIInsightsDashboard';

interface EnhancedParticipantResponse {
  participantId: string;
  participantNumber: number;
  sessionId: string;
  responses: Array<{
    blockId: string;
    blockType: string;
    blockTitle: string;
    answer: string | number | boolean | object;
    timestamp: string;
    timeSpent: number;
  }>;
  completedAt: string;
  duration: number;
  completionStatus: 'completed' | 'abandoned' | 'in_progress';
  qualityScore: number;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
  };
}

interface StudyMetrics {
  totalParticipants: number;
  completedSessions: number;
  abandonedSessions: number;
  inProgressSessions: number;
  averageDuration: number;
  completionRate: number;
  averageQualityScore: number;
  responseRates: {
    [blockId: string]: {
      blockTitle: string;
      responseRate: number;
      averageTime: number;
    };
  };
}

const EnhancedStudyResponsesPage: React.FC = () => {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const { studies, fetchStudies } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'insights' | 'export'>('overview');
  const [study, setStudy] = useState<IStudy | null>(null);
  const [participants, setParticipants] = useState<EnhancedParticipantResponse[]>([]);
  const [metrics, setMetrics] = useState<StudyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'abandoned' | 'in_progress'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studies.length === 0) {
      fetchStudies();
    }
  }, [studies, fetchStudies]);

  useEffect(() => {
    if (studyId && studies.length > 0) {
      const foundStudy = studies.find(s => s._id === studyId);
      if (foundStudy) {
        setStudy(foundStudy);
        loadStudyResponses(studyId);
      }
    }
  }, [studyId, studies]);

  const loadStudyResponses = async (studyId: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch real study session data
      const response = await fetch(`/api/study-sessions?studyId=${studyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch study responses');
      }

      const { data: sessions } = await response.json();

      // Transform session data into enhanced response format
      const enhancedResponses: EnhancedParticipantResponse[] = sessions.map((session: Record<string, unknown>, index: number) => {
        const responseData = session.response_data as Record<string, unknown> || {};
        return {
          participantId: session.participant_id as string || `participant_${index + 1}`,
          participantNumber: index + 1,
          sessionId: session.id as string || `session-${index + 1}`,
          responses: responseData.responses as Array<{
            blockId: string;
            blockType: string;
            blockTitle: string;
            answer: string | number | boolean | object;
            timestamp: string;
            timeSpent: number;
          }> || [],
          completedAt: session.completed_at as string || new Date().toISOString(),
          duration: responseData.totalDuration as number || 0,
          completionStatus: session.status === 'completed' ? 'completed' : 
                           session.status === 'abandoned' ? 'abandoned' : 'in_progress',
          qualityScore: calculateQualityScore(responseData),
          deviceInfo: responseData.deviceInfo as {
            type: 'desktop' | 'mobile' | 'tablet';
            browser: string;
            os: string;
          } || {
            type: 'desktop' as const,
            browser: 'Unknown',
            os: 'Unknown'
          }
        };
      });

      // Calculate metrics
      const studyMetrics = calculateStudyMetrics(enhancedResponses);

      setParticipants(enhancedResponses);
      setMetrics(studyMetrics);

    } catch (error) {
      console.error('Failed to load study responses:', error);
      setError(error instanceof Error ? error.message : 'Failed to load responses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateQualityScore = (responseData: { [key: string]: unknown }): number => {
    if (!responseData?.responses || !Array.isArray(responseData.responses)) return 0;
    
    // Basic quality scoring based on response completeness and time spent
    const responses = responseData.responses as Array<{ answer: string | number }>;
    const totalBlocks = (responseData.totalBlocks as number) || responses.length;
    const totalDuration = (responseData.totalDuration as number) || 0;
    
    const completionRate = responses.length / totalBlocks;
    const avgTimePerResponse = totalDuration / responses.length;
    
    // Quality factors: completion rate (50%), reasonable time spent (30%), response length/quality (20%)
    const completionScore = completionRate * 50;
    const timeScore = Math.min(avgTimePerResponse / 60, 1) * 30; // Up to 1 minute per response is good
    const lengthScore = responses.reduce((acc: number, resp) => {
      const length = typeof resp.answer === 'string' ? resp.answer.length : 1;
      return acc + Math.min(length / 50, 1); // Up to 50 chars is good
    }, 0) / responses.length * 20;

    return Math.round(completionScore + timeScore + lengthScore);
  };

  const calculateStudyMetrics = (responses: EnhancedParticipantResponse[]): StudyMetrics => {
    const total = responses.length;
    const completed = responses.filter(r => r.completionStatus === 'completed').length;
    const abandoned = responses.filter(r => r.completionStatus === 'abandoned').length;
    const inProgress = responses.filter(r => r.completionStatus === 'in_progress').length;

    const totalDuration = responses.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = total > 0 ? totalDuration / total : 0;

    const totalQualityScore = responses.reduce((sum, r) => sum + r.qualityScore, 0);
    const avgQualityScore = total > 0 ? totalQualityScore / total : 0;

    return {
      totalParticipants: total,
      completedSessions: completed,
      abandonedSessions: abandoned,
      inProgressSessions: inProgress,
      averageDuration: avgDuration,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      averageQualityScore: avgQualityScore,
      responseRates: {} // Would be calculated based on block-level data
    };
  };

  const handleRefresh = () => {
    if (studyId) {
      loadStudyResponses(studyId, true);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/study-sessions?studyId=${studyId}&export=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `study_responses_${studyId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.participantNumber.toString().includes(searchTerm) ||
                         participant.participantId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || participant.completionStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m ${remainingSeconds}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'abandoned': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading study responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Responses</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/studies')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Studies
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {study?.title || 'Study Responses'}
                </h1>
                <p className="text-sm text-gray-500">
                  View and analyze participant responses
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setActiveTab('export')}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'responses', label: 'Responses', icon: Users },
              { id: 'insights', label: 'Insights', icon: TrendingUp },
              { id: 'export', label: 'Export', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'responses' | 'insights' | 'export')}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Participants</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalParticipants}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.completionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(metrics.averageDuration)}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Quality Score</p>
                    <p className={`text-2xl font-bold ${getQualityColor(metrics.averageQualityScore)}`}>
                      {metrics.averageQualityScore.toFixed(0)}/100
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Status Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Response Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.completedSessions}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{metrics.inProgressSessions}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{metrics.abandonedSessions}</div>
                  <div className="text-sm text-gray-600">Abandoned</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'responses' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search participants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'abandoned' | 'in_progress')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>
            </Card>

            {/* Participants List */}
            <div className="space-y-4">
              {filteredParticipants.map((participant) => (
                <Card key={participant.participantId} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {participant.participantNumber}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          Participant {participant.participantNumber}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {participant.responses.length} responses • {formatDuration(participant.duration)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(participant.completionStatus)}>
                        {participant.completionStatus.replace('_', ' ')}
                      </Badge>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getQualityColor(participant.qualityScore)}`}>
                          Quality: {participant.qualityScore}/100
                        </div>
                        <div className="text-xs text-gray-500">
                          {participant.deviceInfo.type} • {participant.deviceInfo.browser}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Navigate to detailed response view
                          navigate(`/app/studies/${studyId}/responses/${participant.sessionId}`);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredParticipants.length === 0 && (
              <Card className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No participants have started this study yet'}
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <AIInsightsDashboard 
            studyId={studyId} 
            studyData={study ? study as unknown as Record<string, unknown> : undefined} 
          />
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export Study Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleExport('csv')}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Download className="h-6 w-6 mb-2" />
                  Export as CSV
                  <span className="text-xs opacity-75">Spreadsheet format</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('json')}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Download className="h-6 w-6 mb-2" />
                  Export as JSON
                  <span className="text-xs opacity-75">Raw data format</span>
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedStudyResponsesPage;
