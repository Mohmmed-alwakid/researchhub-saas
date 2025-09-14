import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  DollarSign, 
  Trophy, 
  Calendar,
  TrendingUp,
  Star,
  AlertCircle,
  Play,
  CheckCircle,
  Pause,
  ArrowRight,
  Search
} from 'lucide-react';
import { useEnhancedAuth } from '../../hooks/useEnhancedAuth';
import toast from 'react-hot-toast';

// Types
type TabId = 'overview' | 'applications' | 'sessions' | 'achievements';

interface AuthClient {
  getUser(): Promise<unknown>;
  request(options: unknown): Promise<unknown>;
}

interface ParticipantStats {
  totalStudiesCompleted: number;
  totalEarnings: number;
  averageRating: number;
  studiesInProgress: number;
  hoursContributed: number;
  currentRank: string;
}

interface StudyApplication {
  id: string;
  studyId: string;
  studyTitle: string;
  researcherName: string;
  appliedAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted';
  compensation: number;
  duration: number;
  type: string;
}

interface StudySession {
  id: string;
  studyId: string;
  studyTitle: string;
  researcherName: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  compensation: number;
  duration: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// API Service
class ParticipantDashboardAPI {
  private authClient: AuthClient;
  private baseUrl: string;

  constructor(authClient: AuthClient, baseUrl = 'http://localhost:3003/api') {
    this.authClient = authClient;
    this.baseUrl = baseUrl;
  }

  async getStats(): Promise<ParticipantStats> {
    // Mock implementation
    return {
      totalStudiesCompleted: 12,
      totalEarnings: 485.50,
      averageRating: 4.8,
      studiesInProgress: 2,
      hoursContributed: 28.5,
      currentRank: 'Gold Contributor'
    };
  }

  async getApplications(): Promise<StudyApplication[]> {
    return [
      {
        id: 'app-1',
        studyId: 'study-1',
        studyTitle: 'Mobile App Navigation Study',
        researcherName: 'Dr. Alice Chen',
        appliedAt: '2025-01-14T10:30:00Z',
        status: 'pending',
        compensation: 45,
        duration: 30,
        type: 'usability'
      },
      {
        id: 'app-2',
        studyId: 'study-2',
        studyTitle: 'E-commerce User Experience',
        researcherName: 'Prof. Michael Johnson',
        appliedAt: '2025-01-13T15:45:00Z',
        status: 'accepted',
        compensation: 75,
        duration: 60,
        type: 'interview'
      },
      {
        id: 'app-3',
        studyId: 'study-3',
        studyTitle: 'Educational Platform Feedback',
        researcherName: 'Dr. Sarah Williams',
        appliedAt: '2025-01-12T09:15:00Z',
        status: 'completed',
        compensation: 40,
        duration: 45,
        type: 'survey'
      }
    ];
  }

  async getSessions(): Promise<StudySession[]> {
    return [
      {
        id: 'session-1',
        studyId: 'study-2',
        studyTitle: 'E-commerce User Experience',
        researcherName: 'Prof. Michael Johnson',
        status: 'in_progress',
        progress: 65,
        startedAt: '2025-01-14T14:00:00Z',
        compensation: 75,
        duration: 60
      },
      {
        id: 'session-2',
        studyId: 'study-4',
        studyTitle: 'Social Media Interface Study',
        researcherName: 'Dr. Emily Davis',
        status: 'paused',
        progress: 25,
        startedAt: '2025-01-13T16:30:00Z',
        compensation: 55,
        duration: 40
      }
    ];
  }

  async getAchievements(): Promise<Achievement[]> {
    return [
      {
        id: 'ach-1',
        title: 'First Steps',
        description: 'Completed your first study',
        icon: '🎯',
        unlockedAt: '2025-01-10T12:00:00Z',
        rarity: 'common'
      },
      {
        id: 'ach-2',
        title: 'Marathon Runner',
        description: 'Completed 10 studies',
        icon: '🏃‍♀️',
        unlockedAt: '2025-01-12T18:30:00Z',
        rarity: 'rare'
      },
      {
        id: 'ach-3',
        title: 'Quality Contributor',
        description: 'Maintained 4.5+ star rating',
        icon: '⭐',
        unlockedAt: '2025-01-14T09:15:00Z',
        rarity: 'epic'
      }
    ];
  }
}

// Component for displaying stats cards
const StatsCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: string;
  color?: string;
}> = ({ title, value, icon, trend, color = 'blue' }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

// Component for study applications
const ApplicationCard: React.FC<{ application: StudyApplication }> = ({ application }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'waitlisted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'waitlisted': return <Pause className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{application.studyTitle}</h3>
          <p className="text-sm text-gray-600">{application.researcherName}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
          {getStatusIcon(application.status)}
          <span className="ml-1 capitalize">{application.status}</span>
        </span>
      </div>
      
      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1" />
          ${application.compensation}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {application.duration} min
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(application.appliedAt).toLocaleDateString()}
        </div>
      </div>

      {application.status === 'accepted' && (
        <Link
          to={`/app/studies/${application.studyId}/session`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Start Study
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      )}
    </div>
  );
};

// Component for active sessions
const SessionCard: React.FC<{ session: StudySession }> = ({ session }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{session.studyTitle}</h3>
          <p className="text-sm text-gray-600">{session.researcherName}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
          <span className="capitalize">{session.status.replace('_', ' ')}</span>
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{session.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${session.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            ${session.compensation}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {session.duration} min
          </div>
        </div>
        
        <Link
          to={`/app/studies/${session.studyId}/session`}
          className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Play className="w-4 h-4 mr-1" />
          {session.status === 'paused' ? 'Resume' : 'Continue'}
        </Link>
      </div>
    </div>
  );
};

// Achievement component
const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 border-gray-300';
      case 'rare': return 'bg-blue-100 border-blue-300';
      case 'epic': return 'bg-purple-100 border-purple-300';
      case 'legendary': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 text-center ${getRarityColor(achievement.rarity)}`}>
      <div className="text-2xl mb-2">{achievement.icon}</div>
      <h3 className="font-semibold text-gray-900 text-sm">{achievement.title}</h3>
      <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
      <p className="text-xs text-gray-500 mt-2">
        {new Date(achievement.unlockedAt).toLocaleDateString()}
      </p>
    </div>
  );
};

// Main Participant Dashboard Component
export const ParticipantDashboard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isAuthenticated, hasRole, authClient } = useEnhancedAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<ParticipantStats | null>(null);
  const [applications, setApplications] = useState<StudyApplication[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'sessions' | 'achievements'>('overview');

  const api = useMemo(() => new ParticipantDashboardAPI(authClient), [authClient]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        const [statsData, applicationsData, sessionsData, achievementsData] = await Promise.all([
          api.getStats(),
          api.getApplications(),
          api.getSessions(),
          api.getAchievements()
        ]);
        
        setStats(statsData);
        setApplications(applicationsData);
        setSessions(sessionsData);
        setAchievements(achievementsData);
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && hasRole('participant')) {
      loadDashboardData();
    }
  }, [isAuthenticated, hasRole, api]);

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your dashboard</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!hasRole('participant')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">This dashboard is only accessible to study participants.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Participant Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your research participation summary.</p>
            </div>
            
            <Link
              to="/app/discover"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Search className="w-4 h-4 mr-2" />
              Discover Studies
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BookOpen },
              { id: 'applications', name: 'Applications', icon: Calendar },
              { id: 'sessions', name: 'Active Studies', icon: Play },
              { id: 'achievements', name: 'Achievements', icon: Trophy }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Studies Completed"
                value={stats.totalStudiesCompleted}
                icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                trend="+2 this month"
                color="green"
              />
              <StatsCard
                title="Total Earnings"
                value={`$${stats.totalEarnings}`}
                icon={<DollarSign className="w-6 h-6 text-blue-600" />}
                trend="+$125 this month"
                color="blue"
              />
              <StatsCard
                title="Average Rating"
                value={`${stats.averageRating}/5.0`}
                icon={<Star className="w-6 h-6 text-yellow-600" />}
                color="yellow"
              />
              <StatsCard
                title="Hours Contributed"
                value={`${stats.hoursContributed}h`}
                icon={<Clock className="w-6 h-6 text-purple-600" />}
                trend="+5.5h this month"
                color="purple"
              />
            </div>

            {/* Current Rank */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Current Rank</h3>
                  <p className="text-2xl font-bold">{stats.currentRank}</p>
                  <p className="text-blue-100 mt-1">Keep up the great work!</p>
                </div>
                <Trophy className="w-16 h-16 text-blue-200" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Studies in Progress</h3>
                {sessions.filter(s => s.status === 'in_progress' || s.status === 'paused').length > 0 ? (
                  <div className="space-y-3">
                    {sessions.filter(s => s.status === 'in_progress' || s.status === 'paused').slice(0, 2).map(session => (
                      <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{session.studyTitle}</p>
                          <p className="text-sm text-gray-600">{session.progress}% complete</p>
                        </div>
                        <Link
                          to={`/app/studies/${session.studyId}/session`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Continue
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No studies in progress</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {achievements.slice(0, 3).map(achievement => (
                      <div key={achievement.id} className="text-center">
                        <div className="text-2xl mb-1">{achievement.icon}</div>
                        <p className="text-xs font-medium text-gray-900">{achievement.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No achievements yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Study Applications</h2>
              <div className="flex items-center space-x-4">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {applications.map(application => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Active Studies</h2>
              <div className="flex items-center space-x-4">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">All Studies</option>
                  <option value="in_progress">In Progress</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
              <div className="flex items-center space-x-4">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map(achievement => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;
