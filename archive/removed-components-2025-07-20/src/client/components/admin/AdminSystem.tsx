/**
 * PHASE 4: SYSTEM ADMINISTRATION - ADMIN SYSTEM INTEGRATION
 * Main admin system router and integration component
 * Requirements Source: docs/requirements/04-SYSTEM_ADMINISTRATION_REQUIREMENTS.md
 */

import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AdminDashboard } from './AdminDashboard';
import UserManagement from './UserManagement';

// Navigation types
type AdminView = 'dashboard' | 'users' | 'studies' | 'settings' | 'analytics';

interface AdminNavItem {
  id: AdminView;
  name: string;
  icon: string;
  description: string;
  component: React.ComponentType<Record<string, unknown>>;
}

// Admin System Integration Component
interface AdminSystemProps {
  className?: string;
}

export const AdminSystem: React.FC<AdminSystemProps> = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  // Navigation configuration
  const navigationItems: AdminNavItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '📊',
      description: 'System overview and metrics',
      component: AdminDashboard
    },
    {
      id: 'users',
      name: 'User Management',
      icon: '👥',
      description: 'Manage users and roles',
      component: UserManagement
    },
    {
      id: 'studies',
      name: 'Study Oversight',
      icon: '📋',
      description: 'Review and moderate studies',
      component: StudyOversightPlaceholder
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📈',
      description: 'Detailed reports and insights',
      component: AnalyticsPlaceholder
    },
    {
      id: 'settings',
      name: 'System Settings',
      icon: '⚙️',
      description: 'Platform configuration',
      component: SystemSettingsPlaceholder
    }
  ];

  // Get current component
  const getCurrentComponent = () => {
    const navItem = navigationItems.find(item => item.id === currentView);
    return navItem?.component || AdminDashboard;
  };

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to access the admin system.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Admin Test Account:</strong><br />
              Email: abwanwr77+admin@gmail.com<br />
              Password: Testtest123
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Administrator access required to use this system.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              <strong>Current Role:</strong> {user?.role || 'Unknown'}<br />
              <strong>Required Role:</strong> admin
            </p>
          </div>
        </div>
      </div>
    );
  }

  const CurrentComponent = getCurrentComponent();

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🛡️</div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin System</h1>
                <p className="text-sm text-gray-600">ResearchHub Management</p>
              </div>
            </div>
          </div>

          {/* Admin User Info */}
          <div className="p-4 border-b bg-blue-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                        currentView === item.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </nav>

          {/* System Status */}
          <div className="mt-auto p-4 border-t">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-green-800">System Status</p>
                  <p className="text-xs text-green-600">All systems operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <CurrentComponent />
        </div>
      </div>
    </div>
  );
};

// Placeholder components for future implementation
const StudyOversightPlaceholder: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg text-center">
      <div className="text-6xl mb-4">📋</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Study Oversight</h2>
      <p className="text-gray-600 mb-6">
        Comprehensive study review and moderation system.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Coming Soon:</strong><br />
          • Study approval workflows<br />
          • Content moderation tools<br />
          • Quality assurance metrics<br />
          • Participant safety monitoring
        </p>
      </div>
    </div>
  </div>
);

const AnalyticsPlaceholder: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg text-center">
      <div className="text-6xl mb-4">📈</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics</h2>
      <p className="text-gray-600 mb-6">
        Detailed insights and reporting dashboard.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Coming Soon:</strong><br />
          • Revenue analytics<br />
          • User behavior insights<br />
          • Study performance metrics<br />
          • Predictive analytics
        </p>
      </div>
    </div>
  </div>
);

const SystemSettingsPlaceholder: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg text-center">
      <div className="text-6xl mb-4">⚙️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h2>
      <p className="text-gray-600 mb-6">
        Platform configuration and management tools.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Coming Soon:</strong><br />
          • Platform configuration<br />
          • Feature flags management<br />
          • Security settings<br />
          • Integration management
        </p>
      </div>
    </div>
  </div>
);

export default AdminSystem;
