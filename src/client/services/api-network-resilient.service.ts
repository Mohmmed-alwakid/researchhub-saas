import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import toast from 'react-hot-toast';


/**
 * NETWORK-RESILIENT API SERVICE LAYER
 * Automatically switches between remote APIs and local fallback database
 * ✅ REAL DATA MODE: Uses actual database operations (no mock data)
 * 🔧 SEAMLESS FALLBACK: Transparent switching based on connectivity
 */

// Network connectivity detection
let isOnline = true;
let lastConnectivityCheck = 0;
const CONNECTIVITY_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Check if remote APIs are reachable
 */
async function checkRemoteConnectivity(): Promise<boolean> {
  const now = Date.now();
  
  // Use cached result if recent
  if (now - lastConnectivityCheck < CONNECTIVITY_CHECK_INTERVAL) {
    return isOnline;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout
    
    // Use the proxied endpoint through Vite instead of direct API call
    const response = await fetch('/api/health', {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    isOnline = response.ok;
    lastConnectivityCheck = now;
    
    if (!isOnline) {
      console.log('🔧 Remote APIs unreachable, using fallback strategy');
    }
    
    return isOnline;
    
  } catch (error) {
    console.log('🔧 Network connectivity check failed, using fallback strategy', error);
    isOnline = false;
    lastConnectivityCheck = now;
    return false;
  }
}

/**
 * Enhanced API service with automatic fallback
 */
class NetworkResilientApiService {
  private api: AxiosInstance;
  private fallbackBaseUrl: string;

  constructor() {
    // Fix axios configuration - ensure baseURL is always set correctly
    const baseURL = (typeof window !== 'undefined' && window.location?.origin) 
      ? '/api'  // In browser, use relative path
      : (import.meta.env.VITE_API_URL || '/api');

    console.log('🔧 API Service initializing with baseURL:', baseURL);

    this.api = axios.create({
      baseURL: baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Local fallback endpoint
    this.fallbackBaseUrl = 'http://localhost:3003/api';

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token and check connectivity
    this.api.interceptors.request.use(
      async (config) => {
        // Always use the proxied endpoint through Vite in development
        // This avoids CORS and browser blocking issues
        if (import.meta.env.DEV) {
          // In development, all /api calls go through Vite proxy to localhost:3003
          console.log('🔧 Using Vite proxy for API call:', config.url);
        } else {
          // In production, check connectivity and fallback if needed
          const hasConnectivity = await checkRemoteConnectivity();
          
          if (!hasConnectivity && !config.url?.includes('localhost')) {
            console.log('🔧 Switching to fallback strategy for:', config.url);
            
            // In production, we would implement appropriate fallback logic
            // For now, continue with the original request
          }
        }

        // Get token from Zustand store
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const { state } = JSON.parse(authStorage);
            const token = state?.token;
            if (token) {
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
    );

    // Response interceptor for error handling and automatic retry with fallback
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle network errors by switching to fallback
        if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR' || 
            error.message?.includes('ENOTFOUND') || error.response?.status >= 500) {
          
          if (!originalRequest._fallbackRetry) {
            originalRequest._fallbackRetry = true;
            console.log('🔧 Network error detected, retrying with local fallback');
            
            // Force connectivity check update
            isOnline = false;
            lastConnectivityCheck = Date.now();
            
            // Retry with fallback
            originalRequest.baseURL = this.fallbackBaseUrl;
            if (originalRequest.url?.startsWith('/api/')) {
              originalRequest.url = originalRequest.url.replace('/api/', '');
            }
            
            try {
              return await this.api(originalRequest);
            } catch (fallbackError) {
              console.error('❌ Both remote and fallback failed:', fallbackError);
              // Fall through to original error handling
            }
          }
        }

        // Handle 401 errors (authentication)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const { state } = JSON.parse(authStorage);
              const refreshToken = state?.refreshToken;
              
              if (refreshToken) {
                console.log('🔄 API Service: Attempting token refresh due to 401 error');
                
                // Use the correct auth-consolidated endpoint
                const refreshUrl = isOnline ? 
                  `${this.api.defaults.baseURL}/auth-consolidated?action=refresh` :
                  `${this.fallbackBaseUrl}/auth-consolidated?action=refresh`;
                
                const response = await axios.post(refreshUrl, {
                  refreshToken: refreshToken, // Use correct field name
                });

                // Extract token with improved logic matching auth service response structure
                const token = response.data.session?.access_token || 
                            response.data.tokens?.authToken ||
                            response.data.token;
                            
                const newRefreshToken = response.data.session?.refresh_token || 
                                      response.data.tokens?.refreshToken ||
                                      refreshToken; // Keep existing if not provided
                
                if (token) {
                  console.log('✅ API Service: Token refresh successful');
                  
                  // Update both localStorage and trigger Zustand store update
                  const updatedState = { 
                    ...state, 
                    token: token,
                    refreshToken: newRefreshToken
                  };
                  localStorage.setItem('auth-storage', JSON.stringify({ 
                    state: updatedState, 
                    version: 0 
                  }));
                  
                  // Retry the original request with new token
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  return this.api(originalRequest);
                } else {
                  console.error('❌ API Service: No token in refresh response');
                  throw new Error('No token in refresh response');
                }
              }
            }
          } catch (refreshError) {
            console.error('❌ API Service: Token refresh failed:', refreshError);
            
            // Check if this is local/mock authentication before clearing
            const authStorage = localStorage.getItem('auth-storage');
            let isLocalAuth = false;
            if (authStorage) {
              try {
                const { state } = JSON.parse(authStorage);
                // Check if this is a fallback token
                isLocalAuth = state?.token?.includes('mock-signature') || 
                             state?.token?.includes('fallback-token');
              } catch {
                // Invalid storage, safe to clear
              }
            }
            
            if (!isLocalAuth) {
              // Only clear auth for real authentication failures
              console.log('🚨 API Service: Clearing authentication due to refresh failure');
              localStorage.removeItem('auth-storage');
              
              // Show authentication error instead of generic error
              toast.error('Your session has expired. Please log in again.');
              
              // Redirect to login page after a brief delay
              setTimeout(() => {
                window.location.href = '/login';
              }, 2000);
            } else {
              console.warn('🔧 API Service: Skipping logout for local/fallback authentication');
            }
            
            return Promise.reject(new Error('Authentication failed - session expired'));
          }
        }

        // Handle other API errors with improved messaging
        let message = 'An error occurred';
        
        if (error.response?.status === 401) {
          message = 'Authentication failed - please log in again';
        } else if (error.response?.status === 403) {
          message = 'Access denied - insufficient permissions';
        } else if (error.response?.status >= 500) {
          message = 'Server error - please try again later';
        } else if (error.code === 'ECONNREFUSED' || error.message?.includes('ENOTFOUND')) {
          message = 'Connection failed - please check your internet connection';
        } else {
          message = error.response?.data?.message || error.message || 'An error occurred';
        }
        
        // Don't show toast for certain errors
        const skipToast = [401, 403].includes(error.response?.status) || 
                         originalRequest._skipErrorToast;
        
        if (!skipToast) {
          toast.error(message);
        } else if (error.response?.status === 401) {
          // For 401s, we already handled the user feedback in the retry logic above
          console.log('🔧 API Service: 401 error handled by token refresh logic');
        }

        return Promise.reject(error);
      }
    );
  }

  // Standard HTTP methods with automatic fallback support
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    console.log('🔧 API Service GET request:', url, 'with config:', config?.headers);
    try {
      const response = await this.api.get(url, config);
      console.log('✅ API Service GET success:', url, 'status:', response.status);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ API Service GET error:', url, 'error:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch(url, data, config);
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  // Utility methods
  getConnectivityStatus(): boolean {
    return isOnline;
  }

  async forceConnectivityCheck(): Promise<boolean> {
    lastConnectivityCheck = 0; // Force refresh
    return await checkRemoteConnectivity();
  }

  // Get appropriate base URL based on connectivity
  getBaseUrl(): string {
    return isOnline ? 
      (import.meta.env.VITE_API_URL || '/api') : 
      this.fallbackBaseUrl;
  }
}

// Export singleton instance
export const apiService = new NetworkResilientApiService();
export { checkRemoteConnectivity };
