/**
 * Google OAuth Service
 * Handles Google OAuth authentication flows
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration (same as auth service)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface GoogleOAuthOptions {
  redirectTo?: string;
  scopes?: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  picture?: string;
  verified_email: boolean;
}

class GoogleOAuthService {
  /**
   * Initiate Google OAuth sign-in
   */
  async signInWithGoogle(options: GoogleOAuthOptions = {}) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: options.redirectTo || `${window.location.origin}/auth/google/callback`,
          scopes: options.scopes || 'openid email profile',
        },
      });

      if (error) {
        throw new Error(`Google OAuth error: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Google OAuth sign-in error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Google sign-in failed' 
      };
    }
  }

  /**
   * Handle OAuth callback after Google authentication
   */
  async handleOAuthCallback() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw new Error(`OAuth callback error: ${error.message}`);
      }

      if (!data.session) {
        throw new Error('No session found after OAuth callback');
      }

      const { session } = data;
      const user = session?.user;

      if (!user) {
        throw new Error('No user found in session');
      }
      const googleUser: GoogleUser = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        firstName: user.user_metadata?.given_name || '',
        lastName: user.user_metadata?.family_name || '',
        picture: user.user_metadata?.picture || user.user_metadata?.avatar_url,
        verified_email: user.email_confirmed_at ? true : false,
      };

      return {
        success: true,
        user: googleUser,
        session,
        tokens: {
          authToken: session.access_token,
          refreshToken: session.refresh_token,
        },
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'OAuth callback failed' 
      };
    }
  }

  /**
   * Check if user is authenticated via Google OAuth
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return { success: false, user: null };
      }

      // Check if user signed in via Google
      const isGoogleUser = user.app_metadata?.provider === 'google';

      return {
        success: true,
        user,
        isGoogleUser,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, user: null };
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(`Sign out error: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      };
    }
  }

  /**
   * Link Google account to existing user
   */
  async linkGoogleAccount() {
    try {
      const { data, error } = await supabase.auth.linkIdentity({
        provider: 'google',
      });

      if (error) {
        throw new Error(`Link account error: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Link Google account error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Account linking failed' 
      };
    }
  }

  /**
   * Check if current environment supports Google OAuth
   */
  isGoogleOAuthConfigured() {
    // For Supabase OAuth, we just need the provider to be enabled in the dashboard
    // Return true if we have a valid Supabase URL and key
    return Boolean(supabaseUrl && supabaseKey);
  }
}

export const googleOAuthService = new GoogleOAuthService();
export default googleOAuthService;
