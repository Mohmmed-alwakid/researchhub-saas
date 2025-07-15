import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { authService, type RegisterRequest } from '../services';

// Supabase-compatible user type
interface SupabaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: string;
  emailConfirmed?: boolean;
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
  login: (email: string, password: string) => Promise<{ requiresTwoFactor?: boolean; tempToken?: string }>;
  verify2FALogin: (tempToken: string, code: string) => Promise<void>;
  verifyBackupCodeLogin: (tempToken: string, backupCode: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<SupabaseUser>) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  clearTempAuth: () => void;
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

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {          const response = await authService.login({ email, password });
            if (response.requiresTwoFactor) {
            set({ 
              tempToken: response.tempToken,
              tempEmail: email,
              requiresTwoFactor: true,
              isLoading: false 
            });
            return { requiresTwoFactor: true, tempToken: response.tempToken };
          }          // Extract data from Supabase response structure
          const user = response.user;
          const token = response.session?.access_token || response.tokens?.authToken;
          const refreshToken = response.session?.refresh_token || response.tokens?.refreshToken;
          
          // DEBUG: Log the received user data
          console.log('🔍 Auth Store - Login Response Data:', {
            fullResponse: response,
            user: user,
            userRole: user?.role,
            timestamp: new Date().toISOString()
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
          
          toast.success('Login successful!');
          return {};
        } catch (error: unknown) {
          set({ isLoading: false });
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
        const { token, refreshToken } = get();
        
        // DEBUG: Enhanced checkAuth logging
        console.log('🔄 Auth Store - checkAuth started:', {
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
          tokenPreview: token ? `${token.substring(0, 20)}...` : null,
          timestamp: new Date().toISOString()
        });
        
        if (!token) {
          console.log('❌ Auth Store - No token found, setting unauthenticated state');
          set({ isLoading: false, isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        
        try {
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
            throw new Error('Invalid response format');
          }        } catch {
          // Token is invalid, try to refresh
          if (refreshToken) {
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
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        // Don't persist 2FA temporary state for security
        tempToken: null,
        requiresTwoFactor: false
      }),
    }
  )
);
