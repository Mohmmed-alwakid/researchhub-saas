import React, { useState } from 'react';
import { PerformanceMetrics } from './PerformanceMetrics';
import { InfrastructureHealth } from './InfrastructureHealth';
import { ErrorTrackingDashboard } from './ErrorTrackingDashboard';
import { AlertManagement } from './AlertManagement';
import { PlatformUsageAnalytics } from './PlatformUsageAnalytics';
import { UserJourneyAnalytics } from './UserJourneyAnalytics';
import { BusinessIntelligence } from './BusinessIntelligence';
import { ExecutiveReporting } from './ExecutiveReporting';
import { 
  Activity, 
  Server, 
  AlertTriangle, 
  Bell,
  BarChart3,
  TrendingUp,
  Brain,
  FileText
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export const SystemAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('performance');

  const tabs: Tab[] = [
    {
      id: 'performance',
      label: 'Performance',
      icon: <Activity className="w-4 h-4" />,
      component: <PerformanceMetrics />
    },
    {
      id: 'infrastructure',
      label: 'Infrastructure',
      icon: <Server className="w-4 h-4" />,
      component: <InfrastructureHealth />
    },
    {
      id: 'errors',
      label: 'Error Tracking',
      icon: <AlertTriangle className="w-4 h-4" />,
      component: <ErrorTrackingDashboard />
    },
    {
      id: 'alerts',
      label: 'Alert Management',
      icon: <Bell className="w-4 h-4" />,
      component: <AlertManagement />
    },
    {
      id: 'platform',
      label: 'Platform Usage',
      icon: <BarChart3 className="w-4 h-4" />,
      component: <PlatformUsageAnalytics />
    },
    {
      id: 'journey',
      label: 'User Journey',
      icon: <TrendingUp className="w-4 h-4" />,
      component: <UserJourneyAnalytics />
    },
    {
      id: 'business',
      label: 'Business Intelligence',
      icon: <Brain className="w-4 h-4" />,
      component: <BusinessIntelligence />
    },
    {
      id: 'executive',
      label: 'Executive Reports',
      icon: <FileText className="w-4 h-4" />,
      component: <ExecutiveReporting />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive system performance and analytics dashboard
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTabData?.component}
      </div>
    </div>
  );
};
