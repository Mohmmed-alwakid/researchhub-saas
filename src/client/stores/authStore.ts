import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { authService, type RegisterRequest } from '../services';
import type { User } from '../../shared/types';

interface AuthState {
  user: User | null;
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
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
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
          }
          
          // Extract data from the response structure
          const { user, accessToken, refreshToken } = response.data || {};
          const token = accessToken;
          
          set({ 
            user, 
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
          const { user, accessToken, refreshToken } = response.data || {};
          const token = accessToken;
          
          set({ 
            user, 
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
          const { user, accessToken, refreshToken } = response.data || {};
          const token = accessToken;
          
          set({ 
            user, 
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
          const { user, accessToken, refreshToken } = response.data || {};
          const token = accessToken;
            set({ 
            user, 
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
      },      logout: () => {
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
      },

      updateProfile: async (data: Partial<User>) => {
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
        const token = get().token;
        
        if (!token) {
          set({ isLoading: false, isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authService.getProfile();
          const user = response.user;
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          // Token is invalid, try to refresh
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            try {
              const response = await authService.refreshToken(refreshToken);
              const newToken = response.token;
              
              set({ token: newToken });
              
              // Retry getting profile with new token
              const profileResponse = await authService.getProfile();
              set({ user: profileResponse.user, isAuthenticated: true, isLoading: false });
            } catch (refreshError) {
              // Refresh failed, logout user
              console.error('Token refresh failed:', refreshError);
              get().logout();
            }
          } else {
            get().logout();
          }
        }
      },      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await authService.refreshToken(refreshToken);
          const newToken = response.token;
          
          set({ token: newToken });
        } catch (error: unknown) {
          get().logout();
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
