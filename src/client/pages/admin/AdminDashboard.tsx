import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Users, CreditCard, BarChart3, Settings, Shield, HelpCircle, Activity, Database, DollarSign } from 'lucide-react';

// Admin Sidebar - keep this loaded immediately
import AdminSidebar from '../../components/admin/AdminSidebar';

// Lazy load admin components for better bundle splitting
const UserManagement = lazy(() => import('../../components/admin/UserManagement'));
const SubscriptionManager = lazy(() => import('../../components/admin/SubscriptionManager'));
const SystemAnalytics = lazy(() => import('../../components/admin/SystemAnalytics'));
const StudyOversight = lazy(() => import('../../components/admin/StudyOversight'));
const RolePermissionManager = lazy(() => import('../../components/admin/RolePermissionManager'));
const SystemSettings = lazy(() => import('../../components/admin/SystemSettings'));
const SupportCenter = lazy(() => import('../../components/admin/SupportCenter'));
const AdminOverview = lazy(() => import('../../components/admin/AdminOverview'));
const PaymentManagement = lazy(() => import('../../components/admin/PaymentManagement'));
const AnalyticsDashboard = lazy(() => import('../../components/admin/AnalyticsDashboard'));
const FinancialDashboard = lazy(() => import('../../components/admin/FinancialDashboard'));

// Loading component for lazy-loaded components
const AdminLoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

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
    description: 'Manage users, roles, and access'
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
    component: StudyOversight,
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

      {/* Main Content Area - no header, use the AppLayout header */}
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Route Content - no separate header */}
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
