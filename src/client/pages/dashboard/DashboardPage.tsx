import {
  BarChart3,
  Users,
  FileText,
  Plus,
  Activity,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Settings,
} from 'lucide-react';
import { AfkarLogo } from '../../../assets/brand/AfkarLogo';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { analyticsService, type DashboardAnalytics } from '../../services/analytics.service';
import { CollaborationDashboard } from '../../components/collaboration/CollaborationDashboard';
import { useAuthStore } from '../../stores/authStore';
import type { WorkspaceRole } from '../../../shared/types';

// Define interfaces for type safety
interface StudyData {
  id: string;
  title: string;
  status: string;
  target_participants: number;
  updated_at: string;
  updatedAt?: string;
}

interface RecentStudyData {
  id: string;
  title: string;
  status: string;
  participants: number;
  completionRate: number;
  lastUpdate: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'collaboration' | 'analytics' | 'settings'>('overview');
  const [recentStudies, setRecentStudies] = useState<RecentStudyData[]>([]);

  // Fetch real dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard analytics
        const data = await analyticsService.getDashboardAnalytics();
        setDashboardData(data);
        
        // Fetch recent studies using the proper service
        const studiesResponse = await fetch('/api/research-consolidated?action=get-studies');
        const studiesResult = await studiesResponse.json();
        
        if (studiesResult.success) {
          // Get the most recent 5 studies and sort by updated_at
          const allStudies = studiesResult.studies || [];
          const recentStudiesData = allStudies
            .sort((a: StudyData, b: StudyData) => {
              const dateA = new Date(b.updatedAt || b.updated_at).getTime();
              const dateB = new Date(a.updatedAt || a.updated_at).getTime();
              return dateA - dateB;
            })
            .slice(0, 5)
            .map((study: StudyData) => ({
              id: study.id,
              title: study.title,
              status: study.status,
              participants: study.target_participants || 0,
              completionRate: 85, // Default completion rate
              lastUpdate: study.updated_at || study.updatedAt
            }));
          setRecentStudies(recentStudiesData);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        // Set fallback data if API fails
        setDashboardData({
          totalStudies: 0,
          activeParticipants: 0,
          completionRate: 0,
          avgSessionTime: 0,
          activeStudies: 0,
          recentStudies: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle study creation flow - go directly to study builder
  const handleCreateNewStudy = (e: React.MouseEvent) => {
    e.preventDefault();
    // Skip the redundant modal and go directly to Study Builder
    navigate('/app/study-builder');
  };

  // Calculate stats for display - add safety checks
  const stats = dashboardData ? [
    { 
      name: 'Total Studies', 
      value: (dashboardData.totalStudies || 0).toString(), 
      change: '+2', 
      changeType: 'increase' as const, 
      icon: FileText 
    },
    { 
      name: 'Active Participants', 
      value: (dashboardData.activeParticipants || 0).toString(), 
      change: '+12%', 
      changeType: 'increase' as const, 
      icon: Users 
    },
    { 
      name: 'Completion Rate', 
      value: `${dashboardData.completionRate || 0}%`, 
      change: '+3%', 
      changeType: 'increase' as const, 
      icon: Target 
    },
    { 
      name: 'Avg. Session Time', 
      value: `${dashboardData.avgSessionTime || 0}m`, 
      change: '-2m', 
      changeType: 'decrease' as const, 
      icon: Clock 
    },
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header Skeleton */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="ml-4">
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-4 flex space-x-3">
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gray-200 animate-pulse w-12 h-12"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="h-6 w-28 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6" data-testid="dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Enhanced Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">              <div className="h-12 w-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-soft">
                <AfkarLogo variant="icon" className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back!
                </h1>
                <p className="text-gray-600 mt-1">
                  Here's what's happening with your research studies today.
                </p>
              </div>
            </div>
          </div>          <div className="mt-6 md:mt-0 md:ml-4">
            <Button onClick={handleCreateNewStudy} data-testid="create-study">
              <Plus className="h-4 w-4 mr-2" />
              New Study
            </Button>
          </div>
        </div>

        {/* Tab Navigation - Enhanced Design */}
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm mb-8 overflow-hidden">
          <nav className="flex">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'collaboration', name: 'Team', icon: Users },
              { id: 'analytics', name: 'Analytics', icon: Activity },
              { id: 'settings', name: 'Settings', icon: Settings }
            ].map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isNotLast = index < 3;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'collaboration' | 'analytics' | 'settings')}
                  className={`flex-1 py-4 px-6 font-medium text-sm flex items-center justify-center transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                  } ${isNotLast ? 'border-r border-gray-200/60' : ''}`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  {tab.name}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((item, index) => {
            const Icon = item.icon;
            const isPositive = item.changeType === 'increase';
            return (
              <Card 
                key={item.name} 
                variant="elevated"
                className="animate-fade-in hover:scale-[1.02] transition-transform duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl ${
                        isPositive 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100' 
                          : 'bg-gradient-to-r from-red-100 to-pink-100'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 mb-1">{item.name}</p>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                        <div className="flex items-center mt-1">
                          {isPositive ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.change}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">vs last week</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Recent Studies */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader 
              title="Recent Studies" 
              subtitle="Your latest research projects and their performance"
              action={
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              }
            />            <CardContent>
              <div className="space-y-4">
                {recentStudies?.map((study, index) => (
                  <div 
                    key={study.id} 
                    className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-900">{study.title}</h3>
                          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(study.status)}`}>
                            {study.status}
                          </span>
                        </div>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{study.participants} participants</span>
                          <span className="mx-2">•</span>
                          <Target className="h-4 w-4 mr-1" />
                          <span>{study.completionRate}% completion</span>
                          <span className="mx-2">•</span>
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{new Date(study.lastUpdate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
                            style={{ width: `${study.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent studies found</p>
                    <p className="text-sm">Create your first study to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card variant="glass" className="h-fit">
            <CardHeader title="Quick Actions" subtitle="Get started with common tasks" />
            <CardContent>              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  className="w-full justify-start" 
                  onClick={handleCreateNewStudy}
                  data-testid="create-new-study"
                >
                  <Plus className="h-4 w-4 mr-3" />
                  Create New Study
                </Button>
                <Link to="/app/participants">
                  <Button variant="secondary" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-3" />
                    Invite Participants
                  </Button>
                </Link>
                <Link to="/app/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-3" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed - Dynamic Data */}
        <Card variant="elevated" className="mt-8">
          <CardHeader 
            title="Recent Activity" 
            subtitle="Latest updates and notifications from your studies"
          />
          <CardContent>
            {dashboardData?.recentStudies && dashboardData.recentStudies.length > 0 ? (
              <div className="space-y-6">
                {dashboardData.recentStudies.slice(0, 3).map((study, index) => (
                  <div key={study.id} className="flex items-start space-x-4">
                    <div className={`h-10 w-10 bg-gradient-to-r rounded-full flex items-center justify-center ${
                      index === 0 ? 'from-green-100 to-emerald-100' :
                      index === 1 ? 'from-blue-100 to-indigo-100' :
                      'from-purple-100 to-pink-100'
                    }`}>
                      {index === 0 ? (
                        <Activity className="h-5 w-5 text-green-600" />
                      ) : index === 1 ? (
                        <AfkarLogo variant="icon" className="h-5 w-5 text-blue-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {study.status === 'active' 
                          ? `Study "${study.title}" has ${study.participants} active participants`
                          : study.status === 'completed'
                          ? `Study "${study.title}" was completed successfully`
                          : `Study "${study.title}" was updated`
                        }
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(study.lastUpdate).toLocaleDateString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your recent study activities will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}

        {/* Collaboration Tab */}
        {activeTab === 'collaboration' && (
          <div className="space-y-6">
            {user && (
              <CollaborationDashboard
                currentUser={{
                  id: user.id,
                  name: `${user.firstName} ${user.lastName}`.trim() || user.email,
                  email: user.email,
                  avatar: undefined,
                  role: (user.role as WorkspaceRole) || 'viewer'
                }}
                workspaceId="workspace-1"
              />
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Card variant="elevated">
              <CardHeader title="Global Analytics" subtitle="System-wide metrics and insights" />
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Global analytics dashboard coming soon</p>
                  <p className="text-sm">For study-specific analytics, visit individual study pages</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card variant="elevated">
              <CardHeader title="Workspace Settings" subtitle="Configure your research workspace" />
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Workspace settings coming soon</p>
                  <p className="text-sm">Visit the main settings page for user preferences</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;
