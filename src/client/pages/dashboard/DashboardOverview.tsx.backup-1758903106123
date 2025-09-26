import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  Plus,
  Activity,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { analyticsService, type DashboardAnalytics } from '../../services/analytics.service';

interface DashboardOverviewProps {
  studyId?: string;
  workspaceId?: string;
}

interface StudyData {
  id: string;
  title: string;
  status: string;
  participant_count: number;
  completion_rate: number;
  created_at: string;
  updated_at: string;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ studyId }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [recentStudies, setRecentStudies] = useState<StudyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // If studyId provided, get study-specific data, otherwise get overview
        if (studyId) {
          // Fetch study-specific dashboard data
          const response = await fetch(`/api/studies/${studyId}/dashboard`);
          const result = await response.json();
          
          if (result.success) {
            setDashboardData(result.data);
          }
        } else {
          // Fetch general dashboard analytics
          const data = await analyticsService.getDashboardAnalytics();
          setDashboardData(data);
          
          // Fetch recent studies
          const studiesResponse = await fetch('/api/studies');
          const studiesResult = await studiesResponse.json();
          
          if (studiesResult.success) {
            // Get the most recent 5 studies and sort by updated_at
            const allStudies = studiesResult.studies || [];
            const recentStudies = allStudies
              .sort((a: StudyData, b: StudyData) => {
                const dateA = new Date(b.updated_at).getTime();
                const dateB = new Date(a.updated_at).getTime();
                return dateA - dateB;
              })
              .slice(0, 5);
            setRecentStudies(recentStudies);
          }
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
  }, [studyId]);

  const stats = dashboardData ? [
    { 
      name: studyId ? 'Study Responses' : 'Total Studies', 
      value: studyId ? dashboardData.activeParticipants.toString() : dashboardData.totalStudies.toString(), 
      change: '+2', 
      changeType: 'increase' as const, 
      icon: studyId ? Users : FileText 
    },
    { 
      name: studyId ? 'Completion Rate' : 'Active Participants', 
      value: studyId ? `${dashboardData.completionRate}%` : dashboardData.activeParticipants.toString(), 
      change: '+12%', 
      changeType: 'increase' as const, 
      icon: studyId ? Target : Users 
    },
    { 
      name: studyId ? 'Avg. Session Time' : 'Completion Rate', 
      value: studyId ? `${dashboardData.avgSessionTime}m` : `${dashboardData.completionRate}%`, 
      change: '+3%', 
      changeType: 'increase' as const, 
      icon: studyId ? Clock : Target 
    },
    { 
      name: studyId ? 'Study Status' : 'Avg. Session Time', 
      value: studyId ? 'Active' : `${dashboardData.avgSessionTime}m`, 
      change: '-2m', 
      changeType: 'decrease' as const, 
      icon: studyId ? Activity : Clock 
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
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 h-full">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {studyId ? 'Study Overview' : 'Workspace Overview'}
          </h2>
          <p className="text-gray-600">
            {studyId 
              ? 'Monitor your study performance and participant engagement' 
              : 'Monitor your research activities and team performance'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stat.value}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.changeType === 'increase' ? (
                              <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="self-center flex-shrink-0 h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                            </span>
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Studies (only show if not in study-specific view) */}
        {!studyId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Studies */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Recent Studies</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentStudies.length > 0 ? (
                    recentStudies.map((study) => (
                      <div 
                        key={study.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/app/studies/${study.id}`)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {study.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {study.participant_count} participants
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(study.status)}`}>
                            {study.status}
                          </span>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <FileText className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">No studies yet</p>
                      <Button 
                        className="mt-2" 
                        size="sm"
                        onClick={() => navigate('/app/studies/create')}
                      >
                        Create your first study
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/app/studies/create')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Study
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/app/templates')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Browse Templates
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/app/participants')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Participants
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.open('/app/analytics', '_blank')}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Study-specific content */}
        {studyId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Study Performance</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Study-specific performance metrics will be displayed here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Recent study activity will be displayed here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
