import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, Suspense, lazy } from 'react';

// Import layouts and core components directly (needed immediately)
import AppLayout from './client/components/common/AppLayout';
import AuthGuard from './client/components/auth/AuthGuard';
import ProtectedRoute from './client/components/auth/ProtectedRoute';
import { ErrorBoundary } from './client/components/ErrorBoundary';
// Removed during cleanup - will be restored when needed
// import { PerformanceMonitor } from './client/components/performance/PerformanceMonitor';
// import FloatingReportButton from './client/components/performance/FloatingReportButton';
import { useAuthStore } from './client/stores/authStore';
import { RouteLoadingSpinner } from './client/components/ui/LoadingComponents';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./client/pages/LandingPage'));
const PricingPage = lazy(() => import('./client/pages/PricingPage'));
const LoginPage = lazy(() => import('./client/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./client/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./client/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./client/pages/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./client/pages/dashboard/DashboardPage'));
const StudiesPage = lazy(() => import('./client/pages/studies/StudiesPage'));
const StudyDetailPage = lazy(() => import('./client/pages/studies/StudyDetailPage'));
const InterviewBuilderPage = lazy(() => import('./client/pages/studies/InterviewBuilderPage'));
const StudyResultsPage = lazy(() => import('./client/pages/studies/StudyResultsPage'));
const StudyDiscoveryPage = lazy(() => import('./client/pages/studies/StudyDiscoveryPage'));
const StudyApplicationPage = lazy(() => import('./client/pages/studies/StudyApplicationPage'));
const StudyApplicationsManagementPage = lazy(() => import('./client/pages/studies/StudyApplicationsManagementPage'));
const StudySessionPage = lazy(() => import('./client/pages/studies/StudySessionPage'));
const ParticipantDashboardPage = lazy(() => import('./client/pages/studies/ParticipantDashboardPage'));
const TemplateManagerPage = lazy(() => import('./client/pages/templates/TemplateManagerPage'));
const ParticipantsPage = lazy(() => import('./client/pages/participants/ParticipantsPage'));
const AnalyticsPage = lazy(() => import('./client/pages/analytics/AnalyticsPage'));
const BillingSettingsPage = lazy(() => import('./client/pages/settings/BillingSettingsPage'));
const SettingsPage = lazy(() => import('./client/pages/settings/SettingsPage'));
const AdminDashboard = lazy(() => import('./client/pages/admin/AdminDashboard'));
const ManualPaymentPage = lazy(() => import('./client/pages/payments/ManualPaymentPage.tsx'));
const CreativeJourneyPage = lazy(() => import('./client/pages/journey/CreativeJourneyPage.tsx'));
const ProfessionalStudyBuilderPage = lazy(() => import('./client/pages/study-builder/StudyBuilderPage'));
const OrganizationDashboard = lazy(() => import('./client/pages/organization/OrganizationDashboard'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  const { checkAuth, hasHydrated } = useAuthStore();

  useEffect(() => {
    // Only check authentication after the store has been rehydrated from localStorage
    if (hasHydrated) {
      console.log('🔄 App - Store has rehydrated, checking auth...');
      checkAuth();
    }
  }, [checkAuth, hasHydrated]);

  // Component for role-based redirect
  const RoleBasedRedirect = () => {
    const navigate = useNavigate();
    const { user: currentUser, isLoading: currentIsLoading } = useAuthStore();
    
    useEffect(() => {
      // DEBUG: Add console logs to understand what's happening
      console.log('🔍 RoleBasedRedirect - Debug Info:', {
        user: currentUser,
        role: currentUser?.role,
        isLoading: currentIsLoading,
        timestamp: new Date().toISOString()
      });
      
      // Only attempt redirect if we have user data and are not loading
      if (currentUser && !currentIsLoading) {
        console.log('🚀 RoleBasedRedirect - Attempting redirect for role:', currentUser.role);
        
        switch (currentUser.role as string) {
          case 'participant':
            console.log('👥 Redirecting participant to /app/participant-dashboard');
            navigate('/app/participant-dashboard', { replace: true });
            break;
          case 'admin':
          case 'super_admin':
            console.log('🔧 Redirecting admin to /app/admin');
            navigate('/app/admin', { replace: true });
            break;
          case 'researcher':
          default:
            console.log('🔬 Redirecting researcher to /app/dashboard');
            navigate('/app/dashboard', { replace: true });
            break;
        }
      } else if (!currentIsLoading && !currentUser) {
        // If not loading and no user, redirect to login
        console.log('🚪 No user found, redirecting to login');
        navigate('/login', { replace: true });
      } else {
        console.log('⏳ Still loading user data...');
      }
    }, [currentUser, currentIsLoading, navigate]);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            {currentIsLoading ? 'Loading user data...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<RouteLoadingSpinner />}>
              <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Admin Dashboard Routes - Separate from AppLayout */}
            <Route path="/app/admin/*" element={
              <AuthGuard>
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              </AuthGuard>
            } />

            {/* Protected routes with AppLayout (Researcher/Participant routes) */}
            <Route
              path="/app/*"
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route index element={<RoleBasedRedirect />} />
              
              {/* Researcher routes */}
              <Route path="dashboard" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="studies" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <StudiesPage />
                </ProtectedRoute>
              } />
              <Route path="studies/:id" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <StudyDetailPage />
                </ProtectedRoute>
              } />
              <Route path="studies/create" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <ProfessionalStudyBuilderPage />
                </ProtectedRoute>
              } />
              <Route path="study-builder" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <ProfessionalStudyBuilderPage />
                </ProtectedRoute>
              } />
              <Route path="studies/creative-journey" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <CreativeJourneyPage />
                </ProtectedRoute>
              } />
              <Route path="studies/create-interview" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <InterviewBuilderPage />
                </ProtectedRoute>
              } />
              <Route path="studies/:id/edit" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <ProfessionalStudyBuilderPage />
                </ProtectedRoute>
              } />
              <Route path="studies/:id/results" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <StudyResultsPage />
                </ProtectedRoute>
              } />
              <Route path="studies/:studyId/applications" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <StudyApplicationsManagementPage />
                </ProtectedRoute>
              } />
              <Route path="templates" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin']}>
                  <TemplateManagerPage />
                </ProtectedRoute>
              } />
              <Route path="participants" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <ParticipantsPage />
                </ProtectedRoute>
              } />
              <Route path="analytics" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              
              {/* Organization Routes - Admin Only */}
              <Route path="organizations" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <OrganizationDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/billing" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <BillingSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="payments/manual" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <ManualPaymentPage />
                </ProtectedRoute>
              } />
              
              {/* Participant-specific routes */}
              <Route path="participant-dashboard" element={
                <ProtectedRoute allowedRoles={['participant']}>
                  <ParticipantDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="discover" element={
                <ProtectedRoute allowedRoles={['participant']}>
                  <StudyDiscoveryPage />
                </ProtectedRoute>
              } />
              <Route path="studies/:id/apply" element={
                <ProtectedRoute allowedRoles={['participant']}>
                  <StudyApplicationPage />
                </ProtectedRoute>
              } />
              <Route path="studies/:id/session" element={
                <ProtectedRoute allowedRoles={['participant']}>
                  <StudySessionPage />
                </ProtectedRoute>
              } />
              <Route path="creative-journey" element={
                <ProtectedRoute allowedRoles={['participant']}>
                  <CreativeJourneyPage />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
            </Suspense>
          <Toaster position="top-right" />
          {/* Temporarily disabled during cleanup - will be restored when needed
          <PerformanceMonitor showMetrics={process.env.NODE_ENV === 'development'} />
          <FloatingReportButton />
          */}
        </div>
      </Router>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
