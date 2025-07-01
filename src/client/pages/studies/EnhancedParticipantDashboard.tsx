import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Clock,
  Eye,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Loader2,
  Play,
  History,
  Award,
  BarChart3,
  ArrowRight,
  BookOpen,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge.tsx';

interface StudySession {
  id: string;
  studyId: string;
  studyTitle: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  currentBlock: number;
  totalBlocks: number;
  startedAt: string;
  lastActivityAt: string;
  completedAt?: string;
  compensation: number;
  canResume: boolean;
  estimatedTimeRemaining: number;
}

interface ParticipantStats {
  totalStudiesCompleted: number;
  totalEarnings: number;
  totalTimeSpent: number;
  activeStudies: number;
  averageRating: number;
  studyHistory: Array<{
    id: string;
    title: string;
    completedAt: string;
    earnings: number;
    rating: number;
  }>;
}

interface AvailableStudy {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  compensation: number;
  maxParticipants: number;
  currentParticipants: number;
  tags: string[];
  requirements: string[];
  applicationDeadline: string;
}

const EnhancedParticipantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'available' | 'history'>('overview');
  
  // State for different sections
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [participantStats, setParticipantStats] = useState<ParticipantStats>({
    totalStudiesCompleted: 0,
    totalEarnings: 0,
    totalTimeSpent: 0,
    activeStudies: 0,
    averageRating: 0,
    studyHistory: []
  });
  const [availableStudies, setAvailableStudies] = useState<AvailableStudy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch participant data
  const fetchParticipantData = useCallback(async () => {
    try {
      setLoading(true);

      const authStorage = localStorage.getItem('auth-storage');
      let token = '';
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        token = state?.token || '';
      }

      // Fetch active sessions
      const sessionsResponse = await fetch('/api/study-sessions/my-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        if (sessionsData.success) {
          setSessions(sessionsData.sessions || []);
        }
      }

      // Fetch participant statistics
      const statsResponse = await fetch('/api/participants/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setParticipantStats(statsData.stats);
        }
      }

      // Fetch available studies
      const studiesResponse = await fetch('/api/studies/available', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (studiesResponse.ok) {
        const studiesData = await studiesResponse.json();
        if (studiesData.success) {
          setAvailableStudies(studiesData.studies || []);
        }
      }

    } catch (error) {
      console.error('Failed to fetch participant data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipantData();
  }, [fetchParticipantData]);

  const resumeSession = (sessionId: string) => {
    navigate(`/studies/${sessionId}/session`);
  };

  const startNewStudy = (studyId: string) => {
    navigate(`/app/studies/${studyId}/apply`);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Studies Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{participantStats.totalStudiesCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">${participantStats.totalEarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Time Contributed</p>
                <p className="text-2xl font-semibold text-gray-900">{formatTime(participantStats.totalTimeSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900">{participantStats.averageRating.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      {sessions.filter(s => s.status !== 'completed').length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Active Studies</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.filter(s => s.status !== 'completed').map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{session.studyTitle}</h4>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          session.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm text-gray-600 capitalize">{session.status}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {session.currentBlock}/{session.totalBlocks} blocks
                      </span>
                      <span className="text-sm text-gray-600">
                        ~{session.estimatedTimeRemaining}m remaining
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${session.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button 
                      onClick={() => resumeSession(session.studyId)}
                      className="flex items-center space-x-1"
                    >
                      {session.status === 'paused' ? (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Resume</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          <span>Continue</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Opportunities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">New Study Opportunities</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab('available')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableStudies.slice(0, 3).map((study) => (
              <div key={study.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{study.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{study.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {study.duration} min
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      ${study.compensation}
                    </span>
                    <Badge variant="secondary">{study.type}</Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => startNewStudy(study.id)}
                  className="ml-4"
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveStudiesTab = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">Active Study Sessions</h3>
      </CardHeader>
      <CardContent>
        {sessions.filter(s => s.status !== 'completed').length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Studies</h3>
            <p className="text-gray-600 mb-4">You don't have any active study sessions.</p>
            <Button onClick={() => setActiveTab('available')}>
              Browse Available Studies
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.filter(s => s.status !== 'completed').map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{session.studyTitle}</h4>
                    <div className="flex items-center space-x-6 mt-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          session.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm font-medium capitalize">{session.status}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        Block {session.currentBlock} of {session.totalBlocks}
                      </span>
                      <span className="text-sm text-gray-600">
                        Started {new Date(session.startedAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        ${session.compensation} reward
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{session.progress}% complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${session.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                      <span>Estimated time remaining: ~{session.estimatedTimeRemaining} minutes</span>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <Button 
                      onClick={() => resumeSession(session.studyId)}
                      className="flex items-center space-x-2"
                    >
                      {session.status === 'paused' ? (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Resume Study</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          <span>Continue Study</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAvailableStudiesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Available Studies</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search studies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableStudies
          .filter(study => 
            study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            study.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((study) => (
          <Card key={study.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{study.title}</h3>
                  <p className="text-gray-600 mt-2">{study.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {study.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {study.duration} minutes
                    </div>
                    <div className="flex items-center text-sm font-medium text-green-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${study.compensation}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="w-4 h-4 mr-2" />
                      {study.currentParticipants}/{study.maxParticipants} participants
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Apply by {new Date(study.applicationDeadline).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {study.requirements.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {study.requirements.map((req, index) => (
                          <li key={index}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <Badge variant="secondary">{study.type}</Badge>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={() => startNewStudy(study.id)} size="sm">
                    Apply Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">Study History</h3>
      </CardHeader>
      <CardContent>
        {participantStats.studyHistory.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Studies</h3>
            <p className="text-gray-600">Your completed studies will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {participantStats.studyHistory.map((study) => (
              <div key={study.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{study.title}</h4>
                  <p className="text-sm text-gray-600">
                    Completed on {new Date(study.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">${study.earnings}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 ${
                            i < study.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Participant Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your studies and track your research contributions</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'active', label: 'Active Studies', icon: Play },
              { id: 'available', label: 'Available Studies', icon: BookOpen },
              { id: 'history', label: 'History', icon: History }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'active' | 'available' | 'history')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'active' && renderActiveStudiesTab()}
        {activeTab === 'available' && renderAvailableStudiesTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>
    </div>
  );
};

export default EnhancedParticipantDashboard;
