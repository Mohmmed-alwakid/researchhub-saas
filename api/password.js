/**
 * PASSWORD MANAGEMENT API
 * Handles: Password reset, forgot password, change password
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔑 Password API initialized');

/**
 * Main API handler
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'forgot':
        return await forgotPassword(req, res);
      
      case 'reset':
        return await resetPassword(req, res);
      
      case 'change':
        return await changePassword(req, res);
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action. Use: forgot, reset, or change' 
        });
    }

  } catch (error) {
    console.error('Password API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

/**
 * Send password reset email
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    console.log('🔄 Requesting password reset for:', email);

    // Send password reset email via Supabase
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.SUPABASE_SITE_URL || 'https://researchhub-saas-o3niec8rf-mohmmed-alwakids-projects.vercel.app'}/reset-password`
    });

    if (error) {
      console.error('❌ Password reset error:', error);
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to send password reset email. Please check the email address.' 
      });
    }

    console.log('✅ Password reset email sent successfully');

    return res.status(200).json({ 
      success: true, 
      message: 'Password reset email sent successfully. Please check your inbox.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process password reset request' 
    });
  }
}

/**
 * Reset password with token
 */
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and new password are required' 
      });
    }

    console.log('🔄 Resetting password with token');

    // Update password using the reset token
    const { data, error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error('❌ Password reset error:', error);
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to reset password. Invalid or expired token.' 
      });
    }

    console.log('✅ Password reset successfully');

    return res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to reset password' 
    });
  }
}

/**
 * Change password for authenticated user
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers.authorization;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password and new password are required' 
      });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token' 
      });
    }

    console.log('🔄 Changing password for user:', user.email);

    // Update password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('❌ Password change error:', error);
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to change password' 
      });
    }

    console.log('✅ Password changed successfully');

    return res.status(200).json({ 
      success: true, 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to change password' 
    });
  }
}
