import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  Edit3,
  Eye,
  Play,
  Pause,
  Share2,
  Download,
  Calendar,
  Clock,
  Target,
  Activity
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { IStudy } from '../../../shared/types';

type TabType = 'overview' | 'analytics' | 'participants' | 'collaboration' | 'settings';

const StudyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { studies, fetchStudies, setCurrentStudy } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [study, setStudy] = useState<IStudy | null>(null);

  // Load study data
  useEffect(() => {
    const loadStudy = async () => {
      if (!id) return;
      
      setLoading(true);
      
      // First try to find the study in the current studies list
      const existingStudy = studies?.find(s => s._id === id);
      if (existingStudy) {
        setStudy(existingStudy);
        setCurrentStudy(existingStudy);
        setLoading(false);
      } else {
        // If not found, fetch all studies
        await fetchStudies();
        const foundStudy = studies?.find(s => s._id === id);
        if (foundStudy) {
          setStudy(foundStudy);
          setCurrentStudy(foundStudy);
        }
        setLoading(false);
      }
    };

    loadStudy();
  }, [id, studies, fetchStudies, setCurrentStudy]);

  // Temporary tab components (will be replaced with proper components)
  const StudyOverviewTab = ({ study }: { study: IStudy }) => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Study Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{study.participants.enrolled || 0}</div>
            <div className="text-sm text-gray-600">Enrolled Participants</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{study.status}</div>
            <div className="text-sm text-gray-600">Status</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{study.type}</div>
            <div className="text-sm text-gray-600">Study Type</div>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-gray-600">{study.description}</p>
        </div>
        </CardContent>
      </Card>
    </div>
  );

  const StudyAnalyticsTab = ({ study }: { study: IStudy }) => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Analytics for "{study.title}"</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-blue-600">{Math.round(study.analytics.successRate * 100) || 0}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-600">{study.participants.enrolled || 0}</div>
            <div className="text-sm text-gray-600">Participants</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-purple-600">{Math.round(study.analytics.avgCompletionTime) || 0}m</div>
            <div className="text-sm text-gray-600">Avg. Time</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-orange-600">{Math.round((1 - study.analytics.dropoffRate) * 100) || 0}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Detailed analytics visualization coming soon</p>
          <p className="text-sm">This will show comprehensive study performance metrics</p>
        </div>
        </CardContent>
      </Card>
    </div>
  );

  const StudyParticipantsTab = ({ study: _ }: { study: IStudy }) => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Participants</h3>
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Participant management interface coming soon</p>
          <p className="text-sm">View and manage study participants</p>
        </div>
        </CardContent>
      </Card>
    </div>
  );

  const StudyCollaborationTab = ({ study: _ }: { study: IStudy }) => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Team Collaboration</h3>
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Study-specific collaboration features coming soon</p>
          <p className="text-sm">Team discussions and collaboration for this study</p>
        </div>
        </CardContent>
      </Card>
    </div>
  );

  const StudySettingsTab = ({ study: _ }: { study: IStudy }) => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Study Settings</h3>
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Study settings interface coming soon</p>
          <p className="text-sm">Configure study parameters and preferences</p>
        </div>
        </CardContent>
      </Card>
    </div>
  );

  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: FileText,
      component: StudyOverviewTab
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      component: StudyAnalyticsTab
    },
    {
      id: 'participants',
      name: 'Participants',
      icon: Users,
      component: StudyParticipantsTab
    },
    {
      id: 'collaboration',
      name: 'Team',
      icon: Activity,
      component: StudyCollaborationTab
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      component: StudySettingsTab
    }
  ];

  const getStatusColor = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      recruiting: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'completed':
        return <Target className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study...</p>
        </div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Study Not Found</h2>
          <p className="text-gray-600 mb-4">The study you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/app/studies')}>
            Back to Studies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Study Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link to="/app/studies" className="text-gray-500 hover:text-gray-700">
                    Studies
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">
                  {study.title}
                </li>
              </ol>
            </nav>

            {/* Study Title and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {study.title}
                    </h1>
                    <Badge className={getStatusColor(study.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(study.status)}
                        <span>{study.status.charAt(0).toUpperCase() + study.status.slice(1)}</span>
                      </div>
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">{study.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{study.participants.enrolled || 0} participants</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Created {new Date(study.createdAt).toLocaleDateString()}</span>
                    </div>
                    {study.settings?.duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{study.settings.duration} min</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  onClick={() => navigate(`/app/studies/${study._id}/edit`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Study
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tabs.map((tab) => (
          <div 
            key={tab.id}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            <tab.component study={study} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyDetailPage;
