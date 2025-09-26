import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AfkarLogo } from '../../../assets/brand/AfkarLogo';

import { googleOAuthService } from '../../services/googleOAuth.service';
import { useAuthStore } from '../../stores/authStore';

const OAuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check for error in URL params first
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          throw new Error(errorDescription || `OAuth error: ${error}`);
        }

        // Handle the OAuth callback
        const result = await googleOAuthService.handleOAuthCallback();
        
        if (!result.success) {
          throw new Error(result.error || 'Authentication failed');
        }

        const { user: googleUser, tokens } = result;

        if (!googleUser || !tokens) {
          throw new Error('Invalid authentication response');
        }

        // Create a Supabase-compatible user object
        const supabaseUser = {
          id: googleUser.id,
          email: googleUser.email,
          firstName: googleUser.firstName || googleUser.name.split(' ')[0] || '',
          lastName: googleUser.lastName || googleUser.name.split(' ').slice(1).join(' ') || '',
          role: 'researcher' as const, // Default role - you might want to customize this
          status: 'active',
          emailConfirmed: googleUser.verified_email,
        };

        // Update the auth store with the Google user
        useAuthStore.setState({
          user: supabaseUser,
          token: tokens.authToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        setStatus('success');
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate('/app'); // Let RoleBasedRedirect handle the proper routing
        }, 1500);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
        setStatus('error');
        
        // Redirect to login page after showing error
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Completing your sign-in...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your Google account
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to Afkar!
            </h2>
            <p className="text-gray-600">
              Your Google account has been successfully connected. Redirecting...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {errorMessage || 'Something went wrong during sign-in. Please try again.'}
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <AfkarLogo className="w-12 h-12" />
          </div>
          
          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
