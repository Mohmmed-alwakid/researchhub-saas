import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Import pages
import LandingPage from './client/pages/LandingPage'; // Primary landing page (formerly enhanced)
import LoginPage from './client/pages/auth/LoginPage'; // Primary login page (formerly enhanced)
import RegisterPage from './client/pages/auth/RegisterPage';
import ForgotPasswordPage from './client/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './client/pages/auth/ResetPasswordPage';
import DashboardPage from './client/pages/dashboard/DashboardPage';
import StudiesPage from './client/pages/studies/StudiesPage';
import StudyDetailPage from './client/pages/studies/StudyDetailPage';
import InterviewBuilderPage from './client/pages/studies/InterviewBuilderPage'; // Interview creation page
import StudyResultsPage from './client/pages/studies/StudyResultsPage';
import StudyDiscoveryPage from './client/pages/studies/StudyDiscoveryPage';
import StudyApplicationPage from './client/pages/studies/StudyApplicationPage';
import StudyApplicationsManagementPage from './client/pages/studies/StudyApplicationsManagementPage';
import StudySessionPage from './client/pages/studies/StudySessionPage';
import ParticipantDashboardPage from './client/pages/studies/ParticipantDashboardPage';
import ParticipantsPage from './client/pages/participants/ParticipantsPage';
import AnalyticsPage from './client/pages/analytics/AnalyticsPage';
import BillingSettingsPage from './client/pages/settings/BillingSettingsPage';
import SettingsPage from './client/pages/settings/SettingsPage';
import AdminDashboard from './client/pages/admin/AdminDashboard';
import ManualPaymentPage from './client/pages/payments/ManualPaymentPage';
import { CreativeJourneyPage } from './client/pages/journey/CreativeJourneyPage';
import { StudyBuilderPage as ProfessionalStudyBuilderPage } from './client/pages/study-builder/StudyBuilderPage';
import OrganizationDashboard from './client/pages/organization/OrganizationDashboard';

// Import layouts
import AppLayout from './client/components/common/AppLayout';
import AuthGuard from './client/components/auth/AuthGuard';
import ProtectedRoute from './client/components/auth/ProtectedRoute';
import { ErrorBoundary } from './client/components/ErrorBoundary';
import { PerformanceMonitor } from './client/components/PerformanceMonitor';
import { useAuthStore } from './client/stores/authStore';

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
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app start
    checkAuth();
  }, [checkAuth]);

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
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected routes */}
            <Route
              path="/app"
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route index element={<RoleBasedRedirect />} />
              
              {/* Researcher/Admin routes */}
              <Route path="dashboard" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="studies" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <StudiesPage />
                </ProtectedRoute>
              } />
              <Route path="studies/:id" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <StudyDetailPage />
                </ProtectedRoute>
              } />
              <Route path="studies/create" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <ProfessionalStudyBuilderPage />
                </ProtectedRoute>
              } />
              <Route path="study-builder" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <ProfessionalStudyBuilderPage />
                </ProtectedRoute>
              } />
              <Route path="studies/creative-journey" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <CreativeJourneyPage />
                </ProtectedRoute>
              } />
              <Route path="studies/create-interview" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <InterviewBuilderPage />
                </ProtectedRoute>
              } />
              <Route path="studies/:id/edit" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <ProfessionalStudyBuilderPage />
                </ProtectedRoute>
              } />
              <Route path="studies/:id/results" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <StudyResultsPage />
                </ProtectedRoute>
              } />
              <Route path="studies/:studyId/applications" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <StudyApplicationsManagementPage />
                </ProtectedRoute>
              } />
              <Route path="participants" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <ParticipantsPage />
                </ProtectedRoute>
              } />
              <Route path="analytics" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              
              {/* Organization Routes */}
              <Route path="organizations" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <OrganizationDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/billing" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <BillingSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="payments/manual" element={
                <ProtectedRoute allowedRoles={['researcher', 'admin', 'super_admin']}>
                  <ManualPaymentPage />
                </ProtectedRoute>
              } />
              
              {/* Admin Dashboard Routes */}
              <Route path="admin/*" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboard />
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
          <Toaster position="top-right" />
          <PerformanceMonitor showMetrics={process.env.NODE_ENV === 'development'} />
        </div>
      </Router>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
