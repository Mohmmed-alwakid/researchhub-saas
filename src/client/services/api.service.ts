import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

/**
 * API configuration and interceptors
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
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
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
              const refreshToken = state?.refreshToken;
                if (refreshToken) {                const response = await axios.post(`${this.api.defaults.baseURL}/auth?action=refresh`, {
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
            // Refresh failed, clear auth and redirect to login
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
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
