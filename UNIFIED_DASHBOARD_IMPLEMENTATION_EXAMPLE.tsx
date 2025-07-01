// Enhanced Unified Dashboard Component
// File: src/client/pages/dashboard/UnifiedDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Plus, 
  Activity,
  MessageSquare,
  Settings,
  Eye
} from 'lucide-react';

interface UnifiedDashboardProps {
  defaultTab?: 'overview' | 'collaboration' | 'analytics' | 'templates';
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ 
  defaultTab = 'overview' 
}) => {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedStudy, setSelectedStudy] = useState(null);

  const tabs = [
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
      component: CollaborationPanel
    },
    {
      id: 'analytics',
      name: 'Analytics', 
      icon: Activity,
      component: StudyAnalytics
    },
    {
      id: 'templates',
      name: 'Templates',
      icon: FileText, 
      component: TemplateAccess
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Study Context Header */}
      <StudyContextHeader 
        selectedStudy={selectedStudy}
        onStudyChange={setSelectedStudy}
      />
      
      {/* Unified Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.map((tab) => (
          <div 
            key={tab.id}
            className={`h-full ${activeTab === tab.id ? 'block' : 'hidden'}`}
          >
            <tab.component studyId={selectedStudy?.id} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Study context preservation component
const StudyContextHeader = ({ selectedStudy, onStudyChange }) => {
  const [studies, setStudies] = useState([]);
  
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <StudySelector 
            studies={studies}
            selectedStudy={selectedStudy}
            onChange={onStudyChange}
          />
          {selectedStudy && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedStudy.status)}`}>
                {selectedStudy.status}
              </span>
              <span>•</span>
              <span>{selectedStudy.participant_count} participants</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedStudy && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/app/studies/${selectedStudy.id}/preview`)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/app/studies/${selectedStudy.id}/edit`)}
              >
                <Settings className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </>
          )}
          <Button onClick={() => navigate('/app/studies/create')}>
            <Plus className="w-4 h-4 mr-1" />
            New Study
          </Button>
        </div>
      </div>
    </div>
  );
};

// Individual tab components that receive study context
const DashboardOverview = ({ studyId }) => {
  // Current dashboard content but filtered to selected study
  return <div>Dashboard content for study {studyId}</div>;
};

const CollaborationPanel = ({ studyId }) => {
  // Current collaboration features but in study context
  return <div>Collaboration features for study {studyId}</div>;
};

const StudyAnalytics = ({ studyId }) => {
  // Study-specific analytics instead of global
  return <div>Analytics for study {studyId}</div>;
};

const TemplateAccess = ({ studyId }) => {
  // Simplified template selection
  return <div>Template access</div>;
};
