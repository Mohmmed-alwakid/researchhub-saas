import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import UserManagement from './UserManagement';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'basic',
    label: 'User Management',
    icon: Users,
    component: UserManagement,
    description: 'Comprehensive user management with basic and advanced features'
  }
];

const UserManagementTabs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(() => {
    return searchParams.get('tab') || 'basic';
  });

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== 'basic') {
      setSearchParams({ tab: activeTab });
    } else {
      setSearchParams({});
    }
  }, [activeTab, setSearchParams]);

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Quick Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Comprehensive user management and analytics</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex space-x-4">
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-2">
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-xl font-bold text-gray-900">--</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-2">
            <div className="text-sm text-gray-600">Active Today</div>
            <div className="text-xl font-bold text-green-600">--</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-2">
            <div className="text-sm text-gray-600">New This Week</div>
            <div className="text-xl font-bold text-blue-600">--</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Description */}
      {activeTabData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>{activeTabData.label}:</strong> {activeTabData.description}
          </p>
        </div>
      )}

      {/* Active Tab Content */}
      <div className="min-h-[600px]">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default UserManagementTabs;
