// Consolidated Password endpoint - handles forgot, reset, change password (ES modules)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { action } = req.query;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log(`=== PASSWORD ACTION: ${action} ===`);

    // FORGOT PASSWORD
    if (action === 'forgot') {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      console.log('Requesting password reset for:', email);
      
      // Send password reset email via Supabase
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.CLIENT_URL || 'https://researchhub-saas.vercel.app'}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      console.log('Password reset email sent successfully');
      return res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
        email: email,
        note: 'Check your email for reset instructions'
      });
    }

    // RESET PASSWORD
    if (action === 'reset') {
      const { accessToken, refreshToken, newPassword } = req.body;
      
      if (!accessToken || !refreshToken || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Access token, refresh token, and new password are required'
        });
      }

      console.log('Updating password with tokens...');
      
      // Set the session with the tokens from the reset email
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (sessionError) {
        console.error('Session error:', sessionError);
        return res.status(400).json({
          success: false,
          error: 'Invalid reset tokens'
        });
      }

      // Update the password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      console.log('Password updated successfully');
      return res.status(200).json({
        success: true,
        message: 'Password updated successfully',
        user: {
          id: data.user?.id,
          email: data.user?.email
        }
      });
    }

    // CHANGE PASSWORD
    if (action === 'change') {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Authorization token required'
        });
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      console.log('Changing password for authenticated user...');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        console.error('User validation error:', userError);
        return res.status(401).json({
          success: false,
          error: 'Invalid authentication token'
        });
      }

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        console.error('Current password verification failed:', verifyError);
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Update password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password change error:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      console.log('Password changed successfully');
      return res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        user: {
          id: data.user?.id,
          email: data.user?.email
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use: forgot, reset, or change'
    });

  } catch (error) {
    console.error(`=== PASSWORD ${action?.toUpperCase()} ERROR ===`);
    console.error('Error details:', error);
    
    res.status(500).json({
      success: false,
      error: `Password ${action} failed`,
      message: error.message
    });
  }
}
