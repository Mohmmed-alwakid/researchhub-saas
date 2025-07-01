import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Plus, 
  Activity,
  Eye,
  Settings,
  Filter,
  Search,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';

// Import existing components that will become tabs
import DashboardOverview from './DashboardOverview';
import CollaborationTab from '../collaboration/CollaborationTab';
import StudyAnalyticsTab from '../analytics/StudyAnalyticsTab';
import TemplateAccessTab from '../templates/TemplateAccessTab';

interface TabConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType<{ studyId?: string; workspaceId?: string }>;
  badge?: number;
}

interface UnifiedWorkspaceProps {
  defaultTab?: string;
}

export const UnifiedWorkspace: React.FC<UnifiedWorkspaceProps> = ({ 
  defaultTab = 'overview' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { studyId } = useParams();
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Tab configuration
  const tabs: TabConfig[] = [
    {
      id: 'overview',
      name: 'Overview',
      icon: BarChart3,
      component: DashboardOverview
    },
    {
      id: 'collaboration', 
      name: 'Team',
      icon: Users,
      component: CollaborationTab,
      badge: 3 // Example: 3 pending team activities
    },
    {
      id: 'analytics',
      name: 'Analytics', 
      icon: Activity,
      component: StudyAnalyticsTab
    },
    {
      id: 'templates',
      name: 'Templates',
      icon: FileText, 
      component: TemplateAccessTab
    }
  ];

  // Load studies on mount
  useEffect(() => {
    loadStudies();
  }, []);

  // Update active tab based on URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.find(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const loadStudies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/studies');
      const result = await response.json();
      
      if (result.success) {
        setStudies(result.data || []);
        // Set first study as selected if none selected and studies exist
        if (!selectedStudy && result.data && result.data.length > 0) {
          setSelectedStudy(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load studies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL to reflect tab change
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tabId);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const handleCreateNewStudy = () => {
    navigate('/app/studies/create');
  };

  const handleStudySelect = (study: any) => {
    setSelectedStudy(study);
  };

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

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Workspace Header with Study Context */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Study Selector */}
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-900">Workspace</h1>
              {studies.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedStudy?.id || ''}
                    onChange={(e) => {
                      const study = studies.find(s => s.id === e.target.value);
                      handleStudySelect(study);
                    }}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Studies</option>
                    {studies.map((study) => (
                      <option key={study.id} value={study.id}>
                        {study.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            {/* Study Context Info */}
            {selectedStudy && (
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStudy.status)}`}>
                  {selectedStudy.status}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {selectedStudy.participant_count || 0} participants
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedStudy.estimated_duration || 0}min
                </span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {selectedStudy && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/app/studies/${selectedStudy.id}/preview`)}
                  className="flex items-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/app/studies/${selectedStudy.id}/edit`)}
                  className="flex items-center"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </>
            )}
            <Button 
              onClick={handleCreateNewStudy}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Study
            </Button>
          </div>
        </div>
      </div>

      {/* Unified Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden">
        {tabs.map((tab) => {
          const TabComponent = tab.component;
          return (
            <div 
              key={tab.id}
              className={`h-full ${activeTab === tab.id ? 'block' : 'hidden'}`}
            >
              <TabComponent 
                studyId={selectedStudy?.id} 
                workspaceId="workspace-1" // Mock workspace ID
              />
            </div>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading workspace...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedWorkspace;
