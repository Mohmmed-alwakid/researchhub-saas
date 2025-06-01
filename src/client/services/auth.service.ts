import { apiService } from './api.service';
import type { User, UserRole } from '../../shared/types';

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
  backupCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  message: string;
  requiresTwoFactor?: boolean;
  tempToken?: string;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  qrCode: string;
  secret: string;
  backupCodes: string[];
  message: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  backupCodes: string[];
  message: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  message: string;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  organization?: string;
  profileImage?: string;
}

/**
 * Authentication API service
 */
export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/login', credentials);
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/register', userData);
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return apiService.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
  },

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    return apiService.post('/auth/logout');
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ success: boolean; user: User }> {
    return apiService.get('/auth/profile');
  },

  /**
   * Update user profile
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<{ success: boolean; user: User; message: string }> {
    return apiService.put('/auth/profile', data);
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiService.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('/auth/reset-password', { token, newPassword });
  },

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('/auth/verify-email', { token });
  },
  /**
   * Resend email verification
   */
  async resendVerification(): Promise<{ success: boolean; message: string }> {
    return apiService.post('/auth/resend-verification');
  },

  /**
   * Setup two-factor authentication
   */
  async setup2FA(): Promise<TwoFactorSetupResponse> {
    return apiService.post<TwoFactorSetupResponse>('/auth/2fa/setup');
  },

  /**
   * Verify two-factor authentication setup
   */
  async verify2FASetup(code: string): Promise<TwoFactorVerifyResponse> {
    return apiService.post<TwoFactorVerifyResponse>('/auth/2fa/verify-setup', { code });
  },

  /**
   * Disable two-factor authentication
   */
  async disable2FA(password: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('/auth/2fa/disable', { password });
  },

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(): Promise<{ success: boolean; backupCodes: string[]; message: string }> {
    return apiService.post('/auth/2fa/backup-codes');
  },

  /**
   * Verify 2FA login
   */
  async verify2FALogin(tempToken: string, code: string): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/2fa/verify-login', { tempToken, code });
  },

  /**
   * Verify backup code login
   */
  async verifyBackupCodeLogin(tempToken: string, backupCode: string): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/2fa/verify-backup', { tempToken, backupCode });
  },
};

export default authService;
