import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Users, CreditCard, BarChart3, Settings, Shield, HelpCircle, Activity, Database, DollarSign, FileText, LogOut, Bell, Search } from 'lucide-react';

// Admin Sidebar - keep this loaded immediately
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useAuthStore } from '../../stores/authStore';

// Import the new tab-based user management component
import UserManagement from '../../components/admin/UserManagement';

// Lazy load admin components for better bundle splitting
const SubscriptionManager = lazy(() => import('../../components/admin/SubscriptionManager'));
const RolePermissionManager = lazy(() => import('../../components/admin/RolePermissionManager'));
const SystemSettings = lazy(() => import('../../components/admin/SystemSettings'));
const SupportCenter = lazy(() => import('../../components/admin/SupportCenter'));
const AdminOverview = lazy(() => import('../../components/admin/AdminOverview'));
const PaymentManagement = lazy(() => import('../../components/admin/PaymentManagement'));
const AnalyticsDashboard = lazy(() => import('../../components/admin/AnalyticsDashboard'));
const FinancialDashboard = lazy(() => import('../../components/admin/FinancialDashboard'));
const TemplateManagement = lazy(() => import('../../components/admin/templates/TemplateManagement'));

// Loading component for lazy-loaded components
const AdminLoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

// Admin Header Component
const AdminHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Close profile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-profile-menu]')) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Manage your platform and users</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          {/* Search */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          {/* User Profile */}
          <div className="relative" data-profile-menu>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 text-sm"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.firstName?.charAt(0) || 'A'}{user?.lastName?.charAt(0) || 'D'}
                </span>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">
                  {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
              </div>
            </button>
            
            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile Settings
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Admin Preferences
                </a>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

interface AdminRoute {
  path: string;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
  permission: string;
  description: string;
}

// Helper function to check permissions
const hasPermission = (user: { role: string; permissions?: string[] } | null): boolean => {
  if (!user) return false;
  
  // Super admin has all permissions
  if (user.role === 'super_admin') return true;
  
  // Admin role has most permissions
  if (user.role === 'admin') return true;
  
  // For other roles, check specific permissions
  const requiredPermissions = [
    'admin:read',
    'users:manage',
    'studies:manage',
    'analytics:read'
  ];
  
  if (user.permissions) {
    return requiredPermissions.some(permission => 
      user.permissions!.includes(permission)
    );
  }
  
  // Default to false for security
  return false;
};

const adminRoutes: AdminRoute[] = [
  {
    path: '/app/admin',
    label: 'Overview',
    icon: Activity,
    component: AdminOverview,
    permission: 'SYSTEM_MONITOR',
    description: 'System overview and key metrics'
  },
  {
    path: '/app/admin/users',
    label: 'User Management',
    icon: Users,
    component: UserManagement,
    permission: 'USER_MANAGE_ROLES',
    description: 'Comprehensive user management and analytics'
  },
  {
    path: '/app/admin/templates',
    label: 'Template Management',
    icon: FileText,
    component: TemplateManagement,
    permission: 'TEMPLATE_MANAGE',
    description: 'Create and manage study templates'
  },  {
    path: '/app/admin/subscriptions',
    label: 'Subscriptions',
    icon: CreditCard,
    component: SubscriptionManager,
    permission: 'PAYMENT_REFUND',
    description: 'Manage plans and billing'
  },  {
    path: '/app/admin/payments',
    label: 'Payment Management',
    icon: CreditCard,
    component: PaymentManagement,
    permission: 'PAYMENT_REFUND',
    description: 'Manual payment verification and processing'
  },{
    path: '/app/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    component: AnalyticsDashboard,
    permission: 'SYSTEM_MONITOR',
    description: 'Advanced system analytics and reporting'
  },
  {
    path: '/app/admin/financial',
    label: 'Financial Reports',
    icon: DollarSign,
    component: FinancialDashboard,
    permission: 'PAYMENT_REFUND',
    description: 'Revenue and subscription analytics'
  },
  {
    path: '/app/admin/studies',
    label: 'Study Oversight',
    icon: Database,
    component: () => <div className="p-6"><p>Study oversight coming soon...</p></div>,
    permission: 'STUDY_VIEW_ALL',
    description: 'Monitor all platform studies'
  },
  {
    path: '/app/admin/permissions',
    label: 'Permissions',
    icon: Shield,
    component: RolePermissionManager,
    permission: 'USER_MANAGE_ROLES',
    description: 'Configure roles and permissions'
  },
  {
    path: '/app/admin/settings',
    label: 'System Settings',
    icon: Settings,
    component: SystemSettings,
    permission: 'SYSTEM_MONITOR',
    description: 'Platform configuration'
  },
  {
    path: '/app/admin/support',
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

      {/* Main Content Area with Admin Header */}
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Admin Header */}
        <AdminHeader />
        
        {/* Route Content */}
        <main className="p-6">
          <Suspense fallback={<AdminLoadingSpinner />}>
            <Routes>
              {availableRoutes.map((route) => {
                // Remove /app/admin prefix to get relative path for nested routing
                const relativePath = route.path.replace('/app/admin', '');
                
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
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
