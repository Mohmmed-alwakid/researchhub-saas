import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { apiCache } from './api.cache';

/**
 * API configuration and interceptors with performance caching
 */
class ApiService {
  private api: AxiosInstance;  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token and validate before requests
    this.api.interceptors.request.use(
      async (config) => {
        // Get token from Zustand store
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const { state } = JSON.parse(authStorage);
            let token = state?.token;
            
            if (token) {
              // Check if token is valid before making request
              const isValid = this.isTokenValid(token);
              
              if (!isValid && state?.refreshToken) {
                // Token is expired, try to refresh
                try {
                  const refreshResponse = await this.refreshToken(state.refreshToken);
                  if (refreshResponse?.token) {
                    token = refreshResponse.token;
                    // Update localStorage with new token
                    const updatedState = { ...state, token };
                    localStorage.setItem('auth-storage', JSON.stringify({ 
                      state: updatedState, 
                      version: 0 
                    }));
                  }
                } catch (refreshError) {
                  console.warn('Failed to refresh token in request interceptor:', refreshError);
                  // Continue with existing token, let response interceptor handle 401
                }
              }
              
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.warn('Failed to parse auth storage:', error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const { state } = JSON.parse(authStorage);
              const currentToken = state?.token;
              const refreshToken = state?.refreshToken;
              
              // Check if this is a fallback token - don't try to refresh fallback tokens
              if (currentToken && currentToken.startsWith('fallback-token-')) {
                console.warn('🔧 Auth interceptor: Fallback token detected, not attempting refresh');
                // For fallback tokens, just retry with the same token
                originalRequest.headers.Authorization = `Bearer ${currentToken}`;
                return this.api(originalRequest);
              }
              
              if (refreshToken) {
                const response = await axios.post(`${this.api.defaults.baseURL}/auth-consolidated?action=refresh`, {
                  refreshToken,
                });

                const token = response.data.session?.access_token || response.data.data?.accessToken || response.data.token;
                
                // Update both localStorage and trigger Zustand store update
                const updatedState = { ...state, token };
                localStorage.setItem('auth-storage', JSON.stringify({ 
                  state: updatedState, 
                  version: 0 
                }));
                
                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('🔧 Auth interceptor: Token refresh failed:', refreshError);
            
            // Check if this is local/fallback authentication before clearing
            const authStorage = localStorage.getItem('auth-storage');
            let isFallbackAuth = false;
            if (authStorage) {
              try {
                const { state } = JSON.parse(authStorage);
                // Check if this is a fallback token
                isFallbackAuth = state?.token?.startsWith('fallback-token-');
              } catch {
                // Invalid storage, safe to clear
              }
            }
            
            if (!isFallbackAuth) {
              // Only clear auth for real authentication failures
              localStorage.removeItem('auth-storage');
              window.location.href = '/login';
            } else {
              console.warn('🔧 Auth interceptor: Skipping logout for fallback authentication');
            }
            
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  // Helper method to check if token is valid (not expired)
  private isTokenValid(token: string): boolean {
    try {
      // For JWT tokens, check expiration
      if (token.includes('.')) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        
        // If token expires within 5 minutes, consider it invalid to trigger refresh
        const fiveMinutesFromNow = now + (5 * 60);
        return payload.exp > fiveMinutesFromNow;
      }
      
      // For non-JWT tokens (like fallback tokens), assume they're valid
      return true;
    } catch {
      // If we can't parse the token, assume it's invalid
      return false;
    }
  }

  // Helper method to refresh token
  private async refreshToken(refreshToken: string): Promise<{ token?: string } | null> {
    try {
      const response = await axios.post(`${this.api.defaults.baseURL}/auth-consolidated?action=refresh`, {
        refreshToken,
      });
      
      return {
        token: response.data.session?.access_token || response.data.data?.accessToken || response.data.token
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }  private handleApiError(error: unknown): void {
    // Show user-friendly error messages
    if (error && typeof error === 'object' && 'response' in error) {
      const response = error.response as { data?: { message?: string } };
      if (response?.data?.message) {
        toast.error(response.data.message);
      }
    } else if (error && typeof error === 'object' && 'message' in error) {
      toast.error(String(error.message));
    } else {
      toast.error('An unexpected error occurred');
    }
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  // Cached GET method for performance optimization
  async getCached<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Check cache first
    const cached = apiCache.get<T>(url, config?.params);
    if (cached) {
      return cached;
    }

    // Cache miss - fetch data
    const response = await this.api.get<T>(url, config);
    
    // Store in cache
    apiCache.set(url, response.data, config?.params);
    
    return response.data;
  }

  // Invalidate cache for specific patterns (useful after mutations)
  invalidateCache(pattern: string): void {
    apiCache.invalidate(pattern);
  }
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // File upload method
  async upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    const response = await this.api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },      onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
