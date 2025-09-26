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
import { useAuthStore } from '../../stores/authStore';
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

const StudyAnalyticsTab = () => (
  <div className="p-6">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
      <p className="text-sm text-gray-600">Track your study's performance and participant engagement</p>
    </div>
    
    {/* Key Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Participants</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Activity className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Avg. Duration</p>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Settings className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Response Quality</p>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Participation Over Time</h4>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Chart will appear when you have participant data</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Response Distribution</h4>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Response patterns will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Recent Activity */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900">Recent Activity</h4>
      </div>
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity to display</p>
          <p className="text-sm mt-2">Activity will appear as participants engage with your study</p>
        </div>
      </div>
    </div>
  </div>
);

const StudyParticipantsTab = ({ study }: { study: IStudy }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Participant Management</h3>
        <p className="text-sm text-gray-600">Manage and monitor study participants</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
        <Users className="w-4 h-4 mr-2" />
        Invite Participants
      </button>
    </div>
    
    {/* Participant Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-blue-700">Total Invited</p>
            <p className="text-2xl font-bold text-blue-900">0</p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center">
          <Activity className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-green-700">Active</p>
            <p className="text-2xl font-bold text-green-900">0</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <BarChart3 className="h-8 w-8 text-gray-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-700">Completed</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Participants Table */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">Participants</h4>
          <div className="flex items-center space-x-2">
            <button className="text-gray-500 hover:text-gray-700 p-2">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No participants yet</h4>
          <p className="text-gray-500 mb-6">Get started by inviting participants to join your study</p>
          <div className="space-y-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
              Send Invitations
            </button>
            <div className="text-sm text-gray-500">
              <p>Share your study link: <code className="bg-gray-100 px-2 py-1 rounded text-xs">/participate/{study.id}</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StudyCollaborationTab = () => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Team Collaboration</h3>
        <p className="text-sm text-gray-600">Manage team members and collaboration settings</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
        <Users className="w-4 h-4 mr-2" />
        Add Team Member
      </button>
    </div>
    
    {/* Current Team */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900">Current Team</h4>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {/* Owner */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                R
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">You (Owner)</p>
                <p className="text-sm text-gray-600">Full access to all study features</p>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Owner</span>
          </div>
          
          {/* Placeholder for additional team members */}
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No additional team members</p>
            <p className="text-sm mt-1">Invite colleagues to collaborate on this study</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Collaboration Features */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Access Permissions</h4>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Study Editing</p>
                <p className="text-sm text-gray-600">Modify study structure and settings</p>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Data Access</p>
                <p className="text-sm text-gray-600">View and export participant responses</p>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Participant Management</p>
                <p className="text-sm text-gray-600">Invite and manage participants</p>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Enabled</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Recent Activity</h4>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Activity className="w-4 h-4 text-blue-600 mr-3" />
              <span className="text-gray-600">Study created by you</span>
            </div>
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">No recent team activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StudySettingsTab = ({ study }: { study: IStudy }) => (
  <div className="p-6">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Study Settings</h3>
      <p className="text-sm text-gray-600">Configure your study preferences and advanced options</p>
    </div>
    
    <div className="space-y-8">
      {/* General Settings */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">General Settings</h4>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Study Title</label>
              <input 
                type="text" 
                value={study.title} 
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Study Status</label>
              <select 
                value={study.status}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Study Description</label>
            <textarea 
              rows={3} 
              value={study.description || 'No description provided'}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>
        </div>
      </div>
      
      {/* Privacy & Access */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Privacy & Access</h4>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Public Study Link</p>
              <p className="text-sm text-gray-600">Allow anyone with the link to participate</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Anonymous Responses</p>
              <p className="text-sm text-gray-600">Collect responses without participant identification</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Get notified when participants complete the study</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Study Information */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Study Information</h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Study ID</p>
              <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">{study._id || study.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Created Date</p>
              <p className="mt-1 text-sm text-gray-900">
                {study.createdAt ? new Date(study.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="bg-red-50 rounded-lg border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h4 className="text-lg font-semibold text-red-900">Danger Zone</h4>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-900">Delete Study</p>
              <p className="text-sm text-red-700">Permanently delete this study and all associated data. This action cannot be undone.</p>
            </div>
            <button 
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${study.title}"? This action cannot be undone.`)) {
                  alert('Delete functionality will be implemented soon');
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Delete Study
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StudyDetailPage = () => {
  console.log('🔄 StudyDetailPage: Component function called');
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { studies, fetchStudies, setCurrentStudy } = useAppStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [study, setStudy] = useState<IStudy | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('📤 StudyDetailPage: Opening share modal for study:', study.title);
                    setShowShareModal(true);
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('📊 StudyDetailPage: Exporting study data for:', study.title);
                    // For now, show an alert. In production, this would trigger actual export
                    alert(`Export functionality for "${study.title}" coming soon!\n\nThis will allow you to export:\n• Study results as CSV/Excel\n• Participant responses\n• Analytics reports\n• Study configuration`);
                  }}
                >
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
                {/* Take Study button - only visible to participants, not researchers */}
                {study.status === 'active' && user?.role === 'participant' && (
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Share Study</h2>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Study Link</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Share this link with participants to let them join your study:
                </p>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <input 
                    type="text" 
                    readOnly
                    value={`${window.location.origin}/participate/${study.id}`}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/participate/${study.id}`);
                      alert('Study link copied to clipboard!');
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Study Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Study Name:</span>
                    <span className="font-medium text-gray-900">{study.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      study.status === 'active' ? 'text-green-600' : 
                      study.status === 'draft' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {study.status?.charAt(0).toUpperCase() + study.status?.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Participants:</span>
                    <span className="font-medium text-gray-900">0</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Share Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      const shareText = `Join my research study: "${study.title}" - ${window.location.origin}/participate/${study.id}`;
                      if (navigator.share) {
                        navigator.share({
                          title: study.title,
                          text: shareText,
                          url: `${window.location.origin}/participate/${study.id}`
                        });
                      } else {
                        // Fallback for browsers that don't support native sharing
                        navigator.clipboard.writeText(shareText);
                        alert('Share text copied to clipboard!');
                      }
                    }}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Native Share</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      const emailSubject = encodeURIComponent(`Join Research Study: ${study.title}`);
                      const emailBody = encodeURIComponent(`Hi,\n\nYou're invited to participate in my research study "${study.title}".\n\nClick here to join: ${window.location.origin}/participate/${study.id}\n\nThank you!`);
                      window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`, '_blank');
                    }}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <Button 
                variant="outline" 
                onClick={() => setShowShareModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyDetailPage;
