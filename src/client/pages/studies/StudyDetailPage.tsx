import { useState, useEffect } from 'react';
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
import { Badge } from '../../components/ui/Badge';
import { IStudy } from '../../../shared/types';

type TabType = 'overview' | 'analytics' | 'participants' | 'collaboration' | 'settings';

// ✅ FIXED: Tab components moved outside to prevent infinite re-renders
const StudyOverviewTab = ({ study }: { study: IStudy }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Study Overview</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Study Details</h4>
          <p className="text-gray-600">{study.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Status:</span> {study.status}
            </div>
            <div>
              <span className="font-medium">Type:</span> {study.type}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudyAnalyticsTab = ({ study }: { study: IStudy }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-4">Analytics for {study.title}</h3>
    <div className="text-center py-8 text-gray-500">
      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
      <p>Analytics coming soon</p>
    </div>
  </div>
);

const StudyParticipantsTab = ({ study }: { study: IStudy }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-4">Participants for {study.title}</h3>
    <div className="text-center py-8 text-gray-500">
      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
      <p>Participant management coming soon</p>
    </div>
  </div>
);

const StudyCollaborationTab = ({ study }: { study: IStudy }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-4">Team Collaboration - {study.title}</h3>
    <div className="text-center py-8 text-gray-500">
      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
      <p>Collaboration features coming soon</p>
    </div>
  </div>
);

const StudySettingsTab = ({ study }: { study: IStudy }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-4">Settings for {study.title}</h3>
    <div className="space-y-4">
      <div>
        <span className="font-medium">Study ID:</span> {study._id || study.id}
      </div>
      <div>
        <span className="font-medium">Status:</span> {study.status}
      </div>
      <div className="text-center py-8 text-gray-500">
        <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Advanced settings coming soon</p>
      </div>
    </div>
  </div>
);

const StudyDetailPage = () => {
  console.log('🔄 StudyDetailPage: Component function called');
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { studies, fetchStudies, setCurrentStudy } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [study, setStudy] = useState<IStudy | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Simplified and robust study loading logic
  useEffect(() => {
    if (!id) return;

    console.log('� StudyDetailPage: Starting study load for ID:', id);
    
    // Set initial loading state
    setLoading(true);
    setStudy(null);

    const loadStudyData = async () => {
      try {
        // Check if we already have the study in the store
        const existingStudy = studies?.find(s => 
          String(s._id) === String(id) || String(s.id) === String(id)
        );

        if (existingStudy) {
          console.log('✅ StudyDetailPage: Found study in cache:', existingStudy.title);
          setStudy(existingStudy);
          setCurrentStudy(existingStudy);
          setLoading(false);
          return;
        }

        // Fetch fresh data if not in cache
        console.log('🔄 StudyDetailPage: Fetching studies...');
        await fetchStudies();

        // Get updated studies from store
        const updatedStudies = useAppStore.getState().studies;
        const foundStudy = updatedStudies?.find(s =>
          String(s._id) === String(id) || String(s.id) === String(id)
        );

        if (foundStudy) {
          console.log('✅ StudyDetailPage: Study loaded successfully:', foundStudy.title);
          setStudy(foundStudy);
          setCurrentStudy(foundStudy);
        } else {
          console.error('❌ StudyDetailPage: Study not found with ID:', id);
          setStudy(null);
        }
      } catch (error) {
        console.error('❌ StudyDetailPage: Error loading study:', error);
        setStudy(null);
      } finally {
        setLoading(false);
      }
    };

    loadStudyData();
  }, [id, studies, fetchStudies, setCurrentStudy]);

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

  // Enhanced state debugging before render decisions
  console.log('🔍 StudyDetailPage: Pre-render state check:', {
    loading,
    study: study ? `${study.title} (ID: ${study._id || study.id})` : null,
    studiesCount: studies?.length || 0
  });

  console.log('🔍 StudyDetailPage: About to check render conditions...');

  if (loading) {
    console.log('📱 StudyDetailPage: Rendering loading state');
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
    console.log('📱 StudyDetailPage: Rendering not found state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibent text-gray-900 mb-2">Study Not Found</h2>
          <p className="text-gray-600 mb-4">The study you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/app/studies')}>
            Back to Studies
          </Button>
        </div>
      </div>
    );
  }

  console.log('📱 StudyDetailPage: Rendering main content for study:', study.title);

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
                      <span>{study.participants?.enrolled || 0} participants</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Created {new Date(study.createdAt).toLocaleDateString()}</span>
                    </div>
                    {study.settings?.duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{study.settings?.duration} min</span>
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('🔍 StudyDetailPage: Opening preview for study:', study.title);
                    setShowPreviewModal(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                {study.status === 'active' && (
                  <Button 
                    onClick={() => {
                      const studyId = study.id || study._id;
                      console.log('🚀 StudyDetailPage: Navigating to participant execution:', studyId);
                      window.open(`/app/study/${studyId}/execute`, '_blank');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Take Study
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    // Check if study can be edited based on status
                    if (study.status === 'active' || study.status === 'completed') {
                      alert(`Cannot edit study "${study.title}" because it is currently ${study.status}. Please change the status to "draft" or "paused" first to enable editing.`);
                      return;
                    }
                    
                    // Navigate to study builder for editing
                    console.log('🖊️ StudyDetailPage: Navigating to edit study:', study);
                    navigate(`/app/studies/${study.id || study._id}/edit`);
                  }}
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
            <nav style={{ display: 'flex', gap: '32px' }}>
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

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Study Preview</h2>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">How participants will see this study:</h3>
                <div className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{study.title}</h4>
                      <p className="text-gray-600 mb-4">{study.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            study.status === 'active' ? 'bg-green-100 text-green-800' :
                            study.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {study.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 text-gray-900">{study.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    // Navigate to actual participant view if available
                    setShowPreviewModal(false);
                    alert('Full participant preview functionality coming soon!');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View as Participant
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyDetailPage;
