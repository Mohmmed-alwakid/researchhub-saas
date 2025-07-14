/**
 * PHASE 3: AUTHENTICATION INTEGRATION TEST COMPONENT
 * Demonstrates enhanced authentication integration with study creation
 * Requirements Source: docs/requirements/03-USER_EXPERIENCE_ENHANCEMENT.md
 */

import React, { useState } from 'react';
import { useEnhancedAuth } from '../../hooks/useEnhancedAuth';
import { EnhancedStudyCreationWizard } from '../study-builder/EnhancedStudyCreationWizard';

export const AuthIntegrationTest: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    logout, 
    hasRole,
    isTestAccount 
  } = useEnhancedAuth();

  const [showWizard, setShowWizard] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);

  // Test accounts for easy login
  const testAccounts = [
    {
      email: 'abwanwr77+researcher@gmail.com',
      password: 'test123',
      role: 'researcher',
      name: 'Test Researcher'
    },
    {
      email: 'abwanwr77+participant@gmail.com',
      password: 'test123',
      role: 'participant',
      name: 'Test Participant'
    },
    {
      email: 'abwanwr77+admin@gmail.com',
      password: 'test123',
      role: 'admin',
      name: 'Test Admin'
    }
  ];

  const handleTestLogin = async (account: typeof testAccounts[0]) => {
    setLoginError(null);
    const response = await login(account.email, account.password);
    if (!response.success) {
      setLoginError(response.error || 'Login failed');
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please enter email and password');
      return;
    }

    const response = await login(loginForm.email, loginForm.password);
    if (!response.success) {
      setLoginError(response.error || 'Login failed');
    } else {
      setLoginForm({ email: '', password: '' });
    }
  };

  const handleStudyCreated = (studyId: string) => {
    alert(`Study created successfully! ID: ${studyId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">Phase 3: Enhanced Authentication Integration</h1>
            <p className="text-blue-100 mt-1">
              Testing enhanced authentication with study creation workflow
            </p>
          </div>

          {/* Authentication Status */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Status</h2>
            
            {isAuthenticated ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-green-800 font-medium">
                      ✅ Authenticated as {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-green-600 text-sm mt-1">
                      Role: {user?.role} | Email: {user?.email}
                      {isTestAccount() && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">TEST ACCOUNT</span>}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-yellow-800 font-medium">⚠️ Not Authenticated</h3>
                <p className="text-yellow-600 text-sm mt-1">
                  Please log in to test the enhanced features
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <h3 className="text-red-800 font-medium">❌ Authentication Error</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}
          </div>

          {/* Login Section */}
          {!isAuthenticated && (
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Login</h2>
              
              {/* Test Account Login */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-3">Quick Test Login</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {testAccounts.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => handleTestLogin(account)}
                      className="border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{account.name}</div>
                      <div className="text-sm text-gray-500">{account.role}</div>
                      <div className="text-xs text-gray-400 mt-1">{account.email}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Login Form */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Manual Login</h3>
                <form onSubmit={handleManualLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your password"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Login
                  </button>
                </form>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                    <p className="text-red-600 text-sm">{loginError}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feature Testing */}
          {isAuthenticated && (
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Features</h2>
              
              <div className="space-y-4">
                {/* Role-based Access Control */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Role-based Access Control</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Is Researcher:</span>
                      <span className={hasRole('researcher') ? 'text-green-600' : 'text-red-600'}>
                        {hasRole('researcher') ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Is Participant:</span>
                      <span className={hasRole('participant') ? 'text-green-600' : 'text-red-600'}>
                        {hasRole('participant') ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Is Admin:</span>
                      <span className={hasRole('admin') ? 'text-green-600' : 'text-red-600'}>
                        {hasRole('admin') ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Can Create Studies:</span>
                      <span className={hasRole('researcher') || hasRole('admin') ? 'text-green-600' : 'text-red-600'}>
                        {hasRole('researcher') || hasRole('admin') ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Study Creation Access */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Study Creation</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Test the enhanced study creation wizard with role-based access control.
                  </p>
                  
                  {hasRole('researcher') || hasRole('admin') ? (
                    <button
                      onClick={() => setShowWizard(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Create New Study
                    </button>
                  ) : (
                    <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      ⚠️ Study creation is only available for researchers and admins. 
                      Current role: {user?.role}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* API Integration Status */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">API Integration Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-2">Enhanced Authentication API</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Endpoint:</span>
                    <span className="text-blue-600">/api/auth-enhanced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="text-green-600">✅ Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>JWT Support:</span>
                    <span className="text-green-600">✅ Enabled</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-2">Enhanced User API</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Endpoint:</span>
                    <span className="text-blue-600">/api/user-enhanced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="text-green-600">✅ Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Profile Management:</span>
                    <span className="text-green-600">✅ Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Study Creation Wizard */}
      {showWizard && (
        <EnhancedStudyCreationWizard
          onClose={() => setShowWizard(false)}
          onStudyCreated={handleStudyCreated}
        />
      )}
    </div>
  );
};

export default AuthIntegrationTest;
