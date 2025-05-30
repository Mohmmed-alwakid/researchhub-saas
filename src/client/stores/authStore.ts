import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { authService, type RegisterRequest } from '../services';
import type { User } from '../../shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });
          const { user, token, refreshToken } = response;
          
          set({ 
            user, 
            token, 
            refreshToken,
            isAuthenticated: true, 
            isLoading: false 
          });
          
          toast.success('Login successful!');
        } catch (error: unknown) {
          set({ isLoading: false });
          const message = error instanceof Error ? error.message : 'Login failed';
          toast.error(message);
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(userData);
          const { user, token, refreshToken } = response;
          
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
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          refreshToken: null,
          isAuthenticated: false 
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
        }
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const response = await authService.getProfile();
          const user = response.user;
          
          set({ user, isAuthenticated: true });
        } catch (error: unknown) {
          // Token is invalid, try to refresh
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            try {
              const response = await authService.refreshToken(refreshToken);
              const newToken = response.token;
              
              set({ token: newToken });
              
              // Retry getting profile with new token
              const profileResponse = await authService.getProfile();
              set({ user: profileResponse.user, isAuthenticated: true });
            } catch (refreshError: unknown) {
              // Refresh failed, logout user
              get().logout();
            }
          } else {
            get().logout();
          }
        }
      },

      refreshAccessToken: async () => {
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
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
