import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { authService, type RegisterRequest } from '../services';

// Environment-aware debug logging
const debugLog = (message: string, data?: unknown) => {
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.log(message, data);
  }
};

// Supabase-compatible user type
interface SupabaseUser {
  id: string;
  _id?: string; // For compatibility
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: string;
  emailConfirmed?: boolean;
  avatar?: string;
  demographics?: {
    ageRange?: string;
    gender?: string;
    country?: string;
    phoneNumber?: string;
    specialization?: string;
    occupation?: string;
    educationLevel?: string;
    techExperience?: string;
  };
}

interface AuthState {
  user: SupabaseUser | null;
  token: string | null;
  refreshToken: string | null;
  tempToken: string | null;
  tempEmail: string | null;
  requiresTwoFactor: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<{ requiresTwoFactor?: boolean; tempToken?: string }>;
  verify2FALogin: (tempToken: string, code: string) => Promise<void>;
  verifyBackupCodeLogin: (tempToken: string, backupCode: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<SupabaseUser>) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  clearTempAuth: () => void;
  initializeAuth: () => Promise<void>;
  isTokenValid: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(    (set, get) => ({      user: null,
      token: null,
      refreshToken: null,
      tempToken: null,
      tempEmail: null,
      requiresTwoFactor: false,
      isLoading: false,
      isAuthenticated: false,
      hasHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          debugLog('🔍 Auth Store - Starting login with:', { email });
          
          const response = await authService.login({ email, password });
          
          debugLog('🔍 Auth Store - Login response received:', response);
          
          if (response.requiresTwoFactor) {
            set({ 
              tempToken: response.tempToken,
              tempEmail: email,
              requiresTwoFactor: true,
              isLoading: false 
            });
            return { requiresTwoFactor: true, tempToken: response.tempToken };
          }

          // Extract data from Supabase response structure
          const user = response.user;
          
          // DEBUG: Log response structure before token extraction
          debugLog('🔍 Auth Store - Response structure debugging:', {
            hasSession: !!response.session,
            sessionKeys: response.session ? Object.keys(response.session) : [],
            sessionAccessToken: response.session?.access_token,
            hasTokens: !!response.tokens,
            tokensKeys: response.tokens ? Object.keys(response.tokens) : [],
            tokensAuthToken: response.tokens?.authToken
          });
          
          const token = response.session?.access_token || response.tokens?.authToken;
          const refreshToken = response.session?.refresh_token || response.tokens?.refreshToken;
          
          // DEBUG: Log token extraction results
          debugLog('🔍 Auth Store - Token extraction results:', {
            extractedToken: token,
            extractedRefreshToken: refreshToken,
            tokenLength: token ? token.length : 0,
            tokenPreview: token ? token.substring(0, 50) + '...' : null
          });
          
          // Ensure user has all required SupabaseUser fields
          const supabaseUser: SupabaseUser = {
            id: user?.id || '', // Supabase uses id, not _id
            email: user?.email || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            role: user?.role || '',
            status: user?.status,
            emailConfirmed: user?.emailConfirmed
          };
          
          // DEBUG: Log the final user object being stored
          console.log('💾 Auth Store - Final User Object:', supabaseUser);
          
          
          set({ 
            user: supabaseUser, 
            token, 
            refreshToken,
            isAuthenticated: true, 
            isLoading: false,
            requiresTwoFactor: false,
            tempToken: null
          });
          
          // DEBUG: Verify what was actually stored
          setTimeout(() => {
            const currentState = get();
            console.log('💾 Auth Store - Verification of stored state:', {
              hasUser: !!currentState.user,
              hasToken: !!currentState.token,
              tokenPreview: currentState.token ? currentState.token.substring(0, 50) + '...' : null,
              isAuthenticated: currentState.isAuthenticated,
              localStorage: localStorage.getItem('auth-storage')
            });
          }, 100);
          
          toast.success('Login successful!');
          return {};
        } catch (error: unknown) {
          set({ isLoading: false });
          console.error('❌ Auth Store - Login error details:', {
            error,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : 'No stack',
            errorType: typeof error,
            errorStringified: JSON.stringify(error, null, 2)
          });
          const message = error instanceof Error ? error.message : 'Login failed';
          toast.error(message);
          throw error;
        }
      },      verify2FALogin: async (tempToken: string, code: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.verify2FALogin(tempToken, code);
          const user = response.user;
          const token = response.session?.access_token || response.tokens?.authToken;
          const refreshToken = response.session?.refresh_token || response.tokens?.refreshToken;
          
          // Ensure user has all required SupabaseUser fields
          const supabaseUser: SupabaseUser = {
            id: user?.id || '',
            email: user?.email || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            role: user?.role || '',
            status: user?.status,
            emailConfirmed: user?.emailConfirmed
          };
          
          set({ 
            user: supabaseUser, 
            token, 
            refreshToken,
            isAuthenticated: true, 
            isLoading: false,
            requiresTwoFactor: false,
            tempToken: null
          });
          
          toast.success('2FA verification successful!');
        } catch (error: unknown) {
          set({ isLoading: false });
          const message = error instanceof Error ? error.message : '2FA verification failed';
          toast.error(message);
          throw error;
        }
      },      verifyBackupCodeLogin: async (tempToken: string, backupCode: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.verifyBackupCodeLogin(tempToken, backupCode);
          const user = response.user;
          const token = response.session?.access_token || response.tokens?.authToken;
          const refreshToken = response.session?.refresh_token || response.tokens?.refreshToken;
          
          // Ensure user has all required SupabaseUser fields
          const supabaseUser: SupabaseUser = {
            id: user?.id || '',
            email: user?.email || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            role: user?.role || '',
            status: user?.status,
            emailConfirmed: user?.emailConfirmed
          };
          
          set({ 
            user: supabaseUser, 
            token, 
            refreshToken,
            isAuthenticated: true, 
            isLoading: false,
            requiresTwoFactor: false,
            tempToken: null
          });
          
          toast.success('Backup code verification successful!');
        } catch (error: unknown) {
          set({ isLoading: false });
          const message = error instanceof Error ? error.message : 'Backup code verification failed';
          toast.error(message);
          throw error;
        }
      },

      clearTempAuth: () => {
        set({ 
          tempToken: null, 
          tempEmail: null,
          requiresTwoFactor: false 
        });
      },      register: async (userData: RegisterRequest) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(userData);
          const user = response.user;
          const token = response.session?.access_token || response.tokens?.authToken;
          const refreshToken = response.session?.refresh_token || response.tokens?.refreshToken;
          
          // Ensure user has all required SupabaseUser fields
          const supabaseUser: SupabaseUser = {
            id: user?.id || '',
            email: user?.email || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            role: user?.role || '',
            status: user?.status,
            emailConfirmed: user?.emailConfirmed
          };
          
          set({ 
            user: supabaseUser, 
            token, 
            refreshToken,
            isAuthenticated: true, 
            isLoading: false 
          });
          
          toast.success('Registration successful!');
        } catch (error: unknown) {
          set({ isLoading: false });
          const message = error instanceof Error ? error.message : 'Registration failed';
          toast.error(message);
          throw error;
        }
      },      logout: async () => {
        try {
          // Call logout API to invalidate token on server
          await authService.logout();
        } catch (error) {
          // Continue with local logout even if API fails
          console.error('Logout API failed:', error);
        }
        
        // Clear local storage and state
        set({ 
          user: null, 
          token: null, 
          refreshToken: null,
          tempToken: null,
          requiresTwoFactor: false,
          isAuthenticated: false,
          isLoading: false
        });
        
        toast.success('Logged out successfully');
      },updateProfile: async (data: Partial<SupabaseUser>) => {
        try {
          const response = await authService.updateProfile(data);
          const updatedUser = response.user;
          
          set((state) => ({
            user: state.user ? { ...state.user, ...updatedUser } : null
          }));
          
          toast.success('Profile updated successfully');
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Profile update failed';
          toast.error(message);
          throw error;
        }      },      checkAuth: async () => {
        const { token, refreshToken, hasHydrated } = get();
        
        // DEBUG: Enhanced checkAuth logging
        console.log('🔄 Auth Store - checkAuth started:', {
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
          hasHydrated,
          tokenPreview: token ? `${token.substring(0, 20)}...` : null,
          timestamp: new Date().toISOString(),
          fromLocalStorage: !!localStorage.getItem('auth-storage')
        });
        
        // Don't proceed if we haven't rehydrated yet - tokens might still be loading
        if (!hasHydrated) {
          console.log('⏳ Auth Store - Not yet rehydrated, skipping checkAuth');
          return;
        }
        
        // DEBUG: Check what's in localStorage right now
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            console.log('🔄 Auth Store - localStorage state during checkAuth:', {
              hasStoredToken: !!parsed.state.token,
              storedTokenPreview: parsed.state.token ? parsed.state.token.substring(0, 20) + '...' : null,
              isStoredAuthenticated: parsed.state.isAuthenticated
            });
          } catch (e) {
            console.log('🔄 Auth Store - Failed to parse localStorage:', e);
          }
        }

        if (!token) {
          console.log('❌ Auth Store - No token found, setting unauthenticated state');
          set({ isLoading: false, isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        
        // Special handling for fallback tokens - they don't expire
        if (token.startsWith('fallback-token-')) {
          console.log('🔧 Auth Store - Fallback token detected, validating locally...');
          
          try {
            // Parse fallback token to get user info
            const tokenParts = token.split('-');
            if (tokenParts.length >= 5) {
              const userType = tokenParts[2]; // 'test'
              const userRole = tokenParts[3]; // 'participant', 'researcher', 'admin'
              const userNumber = tokenParts[4]; // '001'
              
              const fallbackUser: SupabaseUser = {
                id: `${userType}-${userRole}-${userNumber}`,
                email: `abwanwr77+${userRole}@gmail.com`,
                firstName: userRole.charAt(0).toUpperCase() + userRole.slice(1),
                lastName: 'User',
                role: userRole,
                emailConfirmed: true
              };
              
              console.log('✅ Auth Store - Fallback token valid, setting user:', fallbackUser);
              set({ 
                user: fallbackUser, 
                isAuthenticated: true, 
                isLoading: false 
              });
              return;
            } else {
              console.log('❌ Auth Store - Invalid fallback token format');
              set({ isLoading: false, isAuthenticated: false, user: null });
              return;
            }
          } catch (error) {
            console.log('❌ Auth Store - Failed to parse fallback token:', error);
            set({ isLoading: false, isAuthenticated: false, user: null });
            return;
          }
        }
        
        try {
          console.log('🔍 Auth Store - About to call getCurrentUser for real token...');
          const response = await authService.getCurrentUser();
          
          console.log('🔍 Auth Store - getCurrentUser response:', {
            success: response.success,
            hasUser: !!response.user,
            userEmail: response.user?.email,
            userRole: response.user?.role,
            fullResponse: response
          });
          
          if (response.success && response.user) {
            const user = response.user;
            
            // Ensure user has all required SupabaseUser fields
            const supabaseUser: SupabaseUser = {
              id: user.id || '',
              email: user.email || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              role: user.role || '',
              status: user.status,
              emailConfirmed: user.emailConfirmed
            };
            
            console.log('✅ Auth Store - Setting authenticated user:', supabaseUser);
            set({ user: supabaseUser, isAuthenticated: true, isLoading: false });
          } else {
            console.log('❌ Auth Store - getCurrentUser failed, response not successful or no user');
            throw new Error('Invalid response format');
          }        } catch (error) {
          console.log('❌ Auth Store - getCurrentUser failed with error:', error);
          // Token is invalid, try to refresh
          if (refreshToken) {
            console.log('🔄 Auth Store - Attempting token refresh...');
            try {
              const refreshResponse = await authService.refreshToken(refreshToken);
              
              if (refreshResponse.success) {
                // Extract new tokens from refresh response
                const newToken = refreshResponse.session?.access_token || refreshResponse.token;
                const newRefreshToken = refreshResponse.session?.refresh_token || refreshToken;
                
                // Update tokens in store
                set({ 
                  token: newToken,
                  refreshToken: newRefreshToken
                });
                
                // Get user data with new token
                const userResponse = await authService.getCurrentUser();
                
                if (userResponse.success && userResponse.user) {
                  const user = userResponse.user;
                  
                  const supabaseUser: SupabaseUser = {
                    id: user.id || '',
                    email: user.email || '',
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    role: user.role || '',
                    status: user.status,
                    emailConfirmed: user.emailConfirmed
                  };
                  
                  set({ user: supabaseUser, isAuthenticated: true, isLoading: false });
                } else {
                  throw new Error('Could not get user after refresh');
                }
              } else {
                throw new Error('Token refresh failed');
              }            } catch (refreshError) {
              // Refresh failed, logout user
              console.error('Token refresh failed:', refreshError);
              set({ isLoading: false });
              await get().logout();
            }
          } else {
            set({ isLoading: false });
            await get().logout();
          }
        }
      },      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          await get().logout();
          return;
        }

        try {
          const response = await authService.refreshToken(refreshToken);
          const newToken = response.session?.access_token || response.token;
          
          if (newToken) {
            set({ token: newToken });
          } else {
            throw new Error('No token in refresh response');
          }
        } catch (error: unknown) {
          await get().logout();
          throw error;
        }
      },

      // Initialize authentication on app start
      initializeAuth: async () => {
        const state = get();
        
        // If already initialized and authenticated, skip
        if (state.isAuthenticated && state.user && state.token) {
          debugLog('🔧 Auth already initialized and valid');
          return;
        }
        
        // Check if we have stored tokens
        if (state.token) {
          debugLog('🔧 Initializing auth with stored token');
          try {
            // Validate current token by checking auth status
            await get().checkAuth();
          } catch {
            debugLog('🔧 Stored token invalid, attempting refresh');
            if (state.refreshToken) {
              try {
                await get().refreshAccessToken();
                await get().checkAuth();
              } catch {
                debugLog('🔧 Token refresh failed, clearing auth');
                await get().logout();
              }
            } else {
              debugLog('🔧 No refresh token available, clearing auth');
              await get().logout();
            }
          }
        }
      },

      // Check if current token is valid (not expired)
      isTokenValid: () => {
        const { token } = get();
        if (!token) return false;
        
        try {
          // For JWT tokens, check expiration
          if (token.includes('.')) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            return payload.exp > now;
          }
          
          // For non-JWT tokens (like fallback tokens), assume they're valid
          return true;
        } catch {
          // If we can't parse the token, assume it's valid for now
          return true;
        }
      },
    }),
    {
      name: 'auth-storage',
      // Temporary simplified partialize for debugging
      partialize: (state) => {
        console.log('🔧 Persist partialize called with state:', {
          hasUser: !!state.user,
          hasToken: !!state.token,
          tokenLength: state.token ? state.token.length : 0,
          isAuthenticated: state.isAuthenticated
        });
        
        return {
          user: state.user, 
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated
        };
      },
      onRehydrateStorage: () => (state) => {
        // Use environment-aware logging
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          console.log('🔄 Auth Store - Rehydration complete:', {
            hasState: !!state,
            hasToken: state?.token ? true : false,
            tokenPreview: state?.token ? state.token.substring(0, 20) + '...' : null,
            isAuthenticated: state?.isAuthenticated || false
          });
        }
        
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);
