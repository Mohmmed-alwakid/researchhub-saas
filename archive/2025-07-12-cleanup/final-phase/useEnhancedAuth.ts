/**
 * PHASE 3: ENHANCED AUTHENTICATION INTEGRATION
 * Integrates enhanced authentication with existing components
 * Requirements Source: docs/requirements/03-USER_EXPERIENCE_ENHANCEMENT.md
 */

import { useState, useEffect, useCallback } from 'react';

// Type definitions
interface User {
  id: string;
  email: string;
  role: 'participant' | 'researcher' | 'admin';
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  organizationCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface AuthData {
  user: User;
  session?: AuthSession;
}

interface APIResponse<T = unknown> {
  success: boolean;
  status: number;
  data: T;
  message?: string;
  error?: string;
  meta?: Record<string, unknown>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  role?: 'participant' | 'researcher' | 'admin';
  organizationCode?: string;
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  organizationCode?: string;
  [key: string]: unknown;
}

// Authentication API client for enhanced auth system
class AuthAPIClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl = 'http://localhost:3003/api') {
    this.baseUrl = baseUrl;
    this.token = this.getStoredToken();
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  private setStoredToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
      this.token = token;
    } catch {
      // Handle localStorage errors
    }
  }

  private async makeRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      // Handle authentication errors
      if (response.status === 401) {
        this.setStoredToken(null);
        throw new Error('Authentication required');
      }

      return {
        success: response.ok,
        status: response.status,
        data: data.data || data,
        message: data.message,
        error: data.error,
        meta: data.meta
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string, rememberMe = false): Promise<APIResponse<AuthData>> {
    const response = await this.makeRequest<AuthData>('/auth-enhanced?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });

    if (response.success && (response.data as AuthData).session) {
      this.setStoredToken((response.data as AuthData).session!.access_token);
    }

    return response;
  }

  async register(userData: RegisterData): Promise<APIResponse<AuthData>> {
    const response = await this.makeRequest<AuthData>('/auth-enhanced?action=register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && (response.data as AuthData).session) {
      this.setStoredToken((response.data as AuthData).session!.access_token);
    }

    return response;
  }

  async refreshToken(): Promise<APIResponse<AuthData>> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.makeRequest<AuthData>('/auth-enhanced?action=refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.success && (response.data as AuthData).session) {
      this.setStoredToken((response.data as AuthData).session!.access_token);
      localStorage.setItem('refresh_token', (response.data as AuthData).session!.refresh_token);
    }

    return response;
  }

  async logout(): Promise<APIResponse<Record<string, never>>> {
    const response = await this.makeRequest<Record<string, never>>('/auth-enhanced?action=logout', {
      method: 'POST',
    });

    this.setStoredToken(null);
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');

    return response;
  }

  async verifyToken(): Promise<APIResponse<{ user: User }>> {
    if (!this.token) {
      return { 
        success: false, 
        status: 401,
        data: {} as { user: User },
        error: 'No token available' 
      };
    }

    return await this.makeRequest<{ user: User }>('/auth-enhanced?action=verify');
  }

  async getProfile(): Promise<APIResponse<User>> {
    return await this.makeRequest<User>('/auth-enhanced?action=profile');
  }

  async updateProfile(profileData: ProfileData): Promise<APIResponse<User>> {
    return await this.makeRequest<User>('/auth-enhanced?action=update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getTestAccounts(): Promise<APIResponse<User[]>> {
    return await this.makeRequest<User[]>('/auth-enhanced?action=test-accounts');
  }

  // User management methods
  async getUserEnhanced(action = 'profile'): Promise<APIResponse<User>> {
    if (action === 'profile') {
      return await this.makeRequest<User>('/user-enhanced');
    } else {
      return await this.makeRequest<User>('/user-enhanced', {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
    }
  }

  async updateUserProfile(profileData: ProfileData): Promise<APIResponse<User>> {
    return await this.makeRequest<User>('/user-enhanced', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
}

// React hook for authentication state management
export function useEnhancedAuth() {
  const [authClient] = useState(() => new AuthAPIClient());
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authClient.isAuthenticated()) {
          const response = await authClient.verifyToken();
          if (response.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [authClient]);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authClient.login(email, password, rememberMe);
      
      if (response.success) {
        const authData = response.data as AuthData;
        setUser(authData.user);
        setIsAuthenticated(true);
        
        // Store user data
        localStorage.setItem('user_data', JSON.stringify(authData.user));
        if (authData.session?.refresh_token) {
          localStorage.setItem('refresh_token', authData.session.refresh_token);
        }
      } else {
        setError(response.message || 'Login failed');
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { 
        success: false, 
        status: 500,
        data: {} as AuthData,
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  }, [authClient]);

  const register = useCallback(async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authClient.register(userData);
      
      if (response.success) {
        const authData = response.data as AuthData;
        setUser(authData.user);
        setIsAuthenticated(true);
        
        // Store user data
        localStorage.setItem('user_data', JSON.stringify(authData.user));
        if (authData.session?.refresh_token) {
          localStorage.setItem('refresh_token', authData.session.refresh_token);
        }
      } else {
        setError(response.message || 'Registration failed');
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return { 
        success: false, 
        status: 500,
        data: {} as AuthData,
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  }, [authClient]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await authClient.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    setIsLoading(false);
  }, [authClient]);

  const updateProfile = useCallback(async (profileData: ProfileData) => {
    setError(null);

    try {
      const response = await authClient.updateProfile(profileData);
      
      if (response.success) {
        const updatedUser = { ...user, ...response.data } as User;
        setUser(updatedUser);
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      } else {
        setError(response.message || 'Profile update failed');
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setError(errorMessage);
      return { 
        success: false, 
        status: 500,
        data: {} as User,
        error: errorMessage 
      };
    }
  }, [authClient, user]);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await authClient.refreshToken();
      if (response.success) {
        const authData = response.data as AuthData;
        setUser(authData.user);
        setIsAuthenticated(true);
      }
      return response;
    } catch (err) {
      console.error('Token refresh failed:', err);
      await logout();
      return { 
        success: false, 
        status: 500,
        data: {} as AuthData,
        error: 'Session expired' 
      };
    }
  }, [authClient, logout]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Methods
    login,
    register,
    logout,
    updateProfile,
    refreshAuth,
    
    // Utilities
    authClient,
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(user?.role || ''),
    isTestAccount: () => user?.email?.includes('+') || false,
  };
}

export { AuthAPIClient };
export type { User, AuthSession, AuthData, RegisterData, ProfileData };
