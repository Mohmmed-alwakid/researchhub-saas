import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Users, CreditCard, BarChart3, Settings, Shield, HelpCircle, Activity, Database } from 'lucide-react';

// Admin Modules - using relative imports
import AdminSidebar from '../../components/admin/AdminSidebar';
import UserManagement from '../../components/admin/UserManagement';
import SubscriptionManager from '../../components/admin/SubscriptionManager';
import SystemAnalytics from '../../components/admin/SystemAnalytics';
import StudyOversight from '../../components/admin/StudyOversight';
import RolePermissionManager from '../../components/admin/RolePermissionManager';
import SystemSettings from '../../components/admin/SystemSettings';
import SupportCenter from '../../components/admin/SupportCenter';
import AdminOverview from '../../components/admin/AdminOverview';

// Hooks and utilities
import { useAuthStore } from '../../stores/authStore';

interface AdminRoute {
  path: string;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
  permission: string;
  description: string;
}

// Helper function to check permissions
const hasPermission = (user: { role: string } | null): boolean => {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'super_admin') return true;
  // TODO: Implement proper permission checking with user permissions array
  return true; // Allow all admin users for now
};

const adminRoutes: AdminRoute[] = [
  {
    path: '/admin',
    label: 'Overview',
    icon: Activity,
    component: AdminOverview,
    permission: 'SYSTEM_MONITOR',
    description: 'System overview and key metrics'
  },
  {
    path: '/admin/users',
    label: 'User Management',
    icon: Users,
    component: UserManagement,
    permission: 'USER_MANAGE_ROLES',
    description: 'Manage users, roles, and access'
  },
  {
    path: '/admin/subscriptions',
    label: 'Subscriptions',
    icon: CreditCard,
    component: SubscriptionManager,
    permission: 'PAYMENT_REFUND',
    description: 'Manage plans and billing'
  },
  {
    path: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    component: SystemAnalytics,
    permission: 'SYSTEM_MONITOR',
    description: 'Platform usage and performance'
  },
  {
    path: '/admin/studies',
    label: 'Study Oversight',
    icon: Database,
    component: StudyOversight,
    permission: 'STUDY_VIEW_ALL',
    description: 'Monitor all platform studies'
  },
  {
    path: '/admin/permissions',
    label: 'Permissions',
    icon: Shield,
    component: RolePermissionManager,
    permission: 'USER_MANAGE_ROLES',
    description: 'Configure roles and permissions'
  },
  {
    path: '/admin/settings',
    label: 'System Settings',
    icon: Settings,
    component: SystemSettings,
    permission: 'SYSTEM_MONITOR',
    description: 'Platform configuration'
  },
  {
    path: '/admin/support',
    label: 'Support Center',
    icon: HelpCircle,
    component: SupportCenter,
    permission: 'USER_MANAGE_ROLES',
    description: 'User support and help desk'
  }
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);  // Check if user has admin access
  const hasAdminAccess = user && (
    user.role === 'admin' || 
    user.role === 'super_admin' ||
    hasPermission(user)
  );
  // Filter routes based on user permissions
  const availableRoutes = adminRoutes.filter(() => 
    hasPermission(user)
  );

  // Redirect non-admin users
  if (!hasAdminAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      <AdminSidebar 
        routes={availableRoutes}
        currentPath={location.pathname}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                ResearchHub Platform Administration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Logged in as <span className="font-semibold">{user?.role}</span>
              </div>              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.firstName?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>        {/* Route Content */}
        <main className="p-6">
          <Routes>
            {availableRoutes.map((route) => {
              const relativePath = route.path.replace('/admin', '');
              
              // Use index route for the main admin path
              if (relativePath === '') {
                return (
                  <Route
                    key={route.path}
                    index
                    element={<route.component />}
                  />
                );
              }
              
              // Remove leading slash for nested routes
              return (
                <Route
                  key={route.path}
                  path={relativePath.startsWith('/') ? relativePath.substring(1) : relativePath}
                  element={<route.component />}
                />
              );
            })}
            <Route path="*" element={<Navigate to="/app/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
