// Password reset confirmation endpoint (ES modules)
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
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('=== PASSWORD RESET CONFIRMATION ===');
    
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

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    });

  } catch (error) {
    console.error('=== PASSWORD RESET CONFIRMATION ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      success: false,
      error: 'Password reset confirmation failed',
      message: error.message
    });
  }
}
