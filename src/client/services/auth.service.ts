import { apiService } from './api.service';

// Supabase-compatible user type (matching the auth store)
export interface SupabaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: string;
  emailConfirmed?: boolean;
}

export type UserRole = 'researcher' | 'participant' | 'admin';

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
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status?: string;
    emailConfirmed?: boolean;
  };
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  tokens?: {
    authToken: string;
    refreshToken: string;
  };
  supabase?: boolean;
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
  token?: string;
  message: string;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status?: string;
    emailVerified?: boolean;
  };
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
export const authService = {  /**
   * Login user with Supabase
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('auth-consolidated?action=login', credentials);
  },

  /**
   * Register new user with Supabase
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('auth-consolidated?action=register', userData);
  },

  /**
   * Get current user status
   */
  async getCurrentUser(): Promise<AuthResponse> {
    return apiService.get<AuthResponse>('auth-consolidated?action=status');
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return apiService.post<RefreshTokenResponse>('auth-consolidated?action=refresh', { refreshToken });
  },

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    return apiService.post('auth-consolidated?action=logout');
  },  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ success: boolean; user: SupabaseUser }> {
    return apiService.get('auth-consolidated?action=status');
  },/**
   * Update user profile
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<{ success: boolean; user: SupabaseUser; message: string }> {
    return apiService.put('profile', data);
  },  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('password?action=change', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('password?action=forgot', { email });
  },

  /**
   * Reset password with tokens
   */
  async resetPassword(accessToken: string, refreshToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('password?action=reset', { 
      accessToken, 
      refreshToken, 
      newPassword 
    });
  },

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('auth/verify-email', { token });
  },
  /**
   * Resend email verification
   */
  async resendVerification(): Promise<{ success: boolean; message: string }> {
    return apiService.post('auth/resend-verification');
  },
  /**
   * Setup two-factor authentication
   */
  async setup2FA(): Promise<TwoFactorSetupResponse> {
    return apiService.post<TwoFactorSetupResponse>('auth/2fa/setup');
  },

  /**
   * Verify two-factor authentication setup
   */
  async verify2FASetup(code: string): Promise<TwoFactorVerifyResponse> {
    return apiService.post<TwoFactorVerifyResponse>('auth/2fa/verify-setup', { code });
  },

  /**
   * Disable two-factor authentication
   */
  async disable2FA(password: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('auth/2fa/disable', { password });
  },

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(): Promise<{ success: boolean; backupCodes: string[]; message: string }> {
    return apiService.post('auth/2fa/backup-codes');
  },

  /**
   * Verify 2FA login
   */
  async verify2FALogin(tempToken: string, code: string): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('auth/2fa/verify-login', { tempToken, code });
  },

  /**
   * Verify backup code login
   */
  async verifyBackupCodeLogin(tempToken: string, backupCode: string): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('auth/2fa/verify-backup', { tempToken, backupCode });
  },
};

export default authService;
