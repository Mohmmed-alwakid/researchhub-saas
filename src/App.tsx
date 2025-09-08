import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, Suspense, lazy } from 'react';

// Import layouts and core components directly (needed immediately)
import AppLayout from './client/components/common/AppLayout';
import AuthGuard from './client/components/auth/AuthGuard';
import ProtectedRoute from './client/components/auth/ProtectedRoute';
// Enhanced Sentry error boundaries
import { SentryErrorBoundary } from './components/common/SentryErrorBoundary';
// Connectivity status banner
import ConnectivityStatusBanner from './components/common/ConnectivityStatusBanner';
// Performance monitoring
import { PerformanceMonitor } from './client/components/performance/PerformanceMonitor';
// Lazy load error boundary
import LazyLoadErrorBoundary from './client/components/common/LazyLoadErrorBoundary';
import { useAuthStore } from './client/stores/authStore';
import { RouteLoadingSpinner } from './client/components/ui/LoadingComponents';
import AfkarLogo from './assets/brand/AfkarLogo';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./client/pages/LandingPage'));
const AboutPage = lazy(() => import('./client/pages/AboutPage'));
const FeaturesPage = lazy(() => import('./client/pages/FeaturesPage'));
const PricingPage = lazy(() => import('./client/pages/PricingPage'));
const LoginPage = lazy(() => import('./client/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./client/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./client/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./client/pages/auth/ResetPasswordPage'));
const OAuthCallbackPage = lazy(() => import('./client/pages/auth/OAuthCallbackPage'));
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
const StudyBuilderPage = lazy(() => import('./client/pages/study-builder/StudyBuilderPage'));
const ParticipantStudyExecutionPage = lazy(() => import('./client/pages/participant/ParticipantStudyExecutionPage'));
const OrganizationDashboard = lazy(() => import('./client/pages/organization/OrganizationDashboard'));
const NotFoundPage = lazy(() => import('./client/pages/NotFoundPage'));

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
  const { initializeAuth, hasHydrated } = useAuthStore();

  useEffect(() => {
    // Only initialize authentication after the store has been rehydrated from localStorage
    if (hasHydrated) {
      console.log('🔄 App - Store has rehydrated, initializing auth...');
      initializeAuth().catch((error) => {
        console.warn('🔄 App - Auth initialization failed:', error);
        // Don't block the app if auth initialization fails
      });
    }
  }, [initializeAuth, hasHydrated]);

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
          <AfkarLogo size="lg" className="mx-auto animate-pulse" />
          <p className="mt-4 text-sm text-gray-600">
            {currentIsLoading ? 'Loading Afkar...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <SentryErrorBoundary componentName="App">
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <LazyLoadErrorBoundary componentName="App Routes">
              <Suspense fallback={<RouteLoadingSpinner />}>
              <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />
            <Route path="/auth/google/callback" element={<OAuthCallbackPage />} />
            
            {/* Legacy dashboard redirect - SECURITY: Redirect to login if not authenticated */}
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            
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
                  <StudyBuilderPage />
                </ProtectedRoute>
              } />
              <Route path="study-builder" element={
                <ProtectedRoute allowedRoles={['researcher']}>
                  <StudyBuilderPage />
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
                  <StudyBuilderPage />
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
              <Route path="study/:studyId/execute" element={
                <ProtectedRoute allowedRoles={['participant']}>
                  <ParticipantStudyExecutionPage />
                </ProtectedRoute>
              } />
              <Route path="creative-journey" element={
                <ProtectedRoute allowedRoles={['participant']}>
                  <CreativeJourneyPage />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* 404 Catch-all route - Must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
              </Suspense>
            </LazyLoadErrorBoundary>
          <Toaster position="top-right" />
          <ConnectivityStatusBanner />
          <PerformanceMonitor />
        </div>
      </Router>
    </QueryClientProvider>
    </SentryErrorBoundary>
  );
}

export default App;
