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
  Filter,
} from 'lucide-react';
import { AfkarLogo } from '../../../assets/brand/AfkarLogo';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { analyticsService, type DashboardAnalytics } from '../../services/analytics.service';
// Removed SimplifiedStudyCreationModal - now using new StudyCreationWizard via direct navigation

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  // Removed showMazeModal state - now using direct navigation to StudyCreationWizard

  // Fetch real dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getDashboardAnalytics();
        setDashboardData(data);
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
  }, []);  // Handle study creation flow - navigate directly to new StudyCreationWizard
  const handleCreateNewStudy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/app/studies/create');
  };

  // Removed handleStudyTypeSelect - no longer needed with direct navigation

  // Calculate stats for display
  const stats = dashboardData ? [
    { 
      name: 'Total Studies', 
      value: dashboardData.totalStudies.toString(), 
      change: '+2', 
      changeType: 'increase' as const, 
      icon: FileText 
    },
    { 
      name: 'Active Participants', 
      value: dashboardData.activeParticipants.toString(), 
      change: '+12%', 
      changeType: 'increase' as const, 
      icon: Users 
    },
    { 
      name: 'Completion Rate', 
      value: `${dashboardData.completionRate}%`, 
      change: '+3%', 
      changeType: 'increase' as const, 
      icon: Target 
    },
    { 
      name: 'Avg. Session Time', 
      value: `${dashboardData.avgSessionTime}m`, 
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
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
          </div>          <div className="mt-6 md:mt-0 md:ml-4 flex space-x-3">
            <Button variant="secondary" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button onClick={handleCreateNewStudy}>
              <Plus className="h-4 w-4 mr-2" />
              New Study
            </Button>
          </div>
        </div>

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
                {dashboardData?.recentStudies?.map((study, index) => (
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

        {/* Activity Feed */}
        <Card variant="elevated" className="mt-8">
          <CardHeader 
            title="Recent Activity" 
            subtitle="Latest updates and notifications from your studies"
          />
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Study "E-commerce Checkout Flow" reached 150 participants
                  </p>
                  <p className="text-sm text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">                <div className="h-10 w-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <AfkarLogo variant="icon" className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New analytics report generated for "Mobile App Navigation"
                  </p>
                  <p className="text-sm text-gray-500 mt-1">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Study "User Onboarding Flow" was completed successfully
                  </p>
                  <p className="text-sm text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>        {/* Removed SimplifiedStudyCreationModal - now using direct navigation to StudyCreationWizard */}
      </div>
    </div>
  );
};

export default DashboardPage;
