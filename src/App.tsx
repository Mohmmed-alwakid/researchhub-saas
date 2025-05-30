import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Import pages
import LandingPage from './client/pages/LandingPage';
import EnhancedLandingPage from './client/pages/EnhancedLandingPage';
import LoginPage from './client/pages/auth/LoginPage';
import EnhancedLoginPage from './client/pages/auth/EnhancedLoginPage';
import RegisterPage from './client/pages/auth/RegisterPage';
import DashboardPage from './client/pages/dashboard/DashboardPage';
import StudiesPage from './client/pages/studies/StudiesPage';
import StudyBuilderPage from './client/pages/studies/StudyBuilderPage';
import ParticipantsPage from './client/pages/participants/ParticipantsPage';
import AnalyticsPage from './client/pages/analytics/AnalyticsPage';

// Import layouts
import AppLayout from './client/components/common/AppLayout';
import AuthGuard from './client/components/auth/AuthGuard';
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

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/enhanced" element={<EnhancedLandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/enhanced-login" element={<EnhancedLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route
              path="/app"
              element={
                <AuthGuard>
                  <AppLayout />
                </AuthGuard>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="studies" element={<StudiesPage />} />
              <Route path="studies/new" element={<StudyBuilderPage />} />
              <Route path="studies/:id/edit" element={<StudyBuilderPage />} />
              <Route path="participants" element={<ParticipantsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
