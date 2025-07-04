// Consolidated Auth endpoint - handles login, register, logout, refresh, status (ES modules)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log(`=== AUTH ACTION: ${action} ===`);

    // REGISTER
    if (action === 'register') {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const { email, password, firstName, lastName, role = 'participant' } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, first name, and last name are required'
        });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      console.log('User registered successfully');
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          confirmationSent: !data.session
        }
      });
    }

    // LOGIN
    if (action === 'login') {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log('=== LOGIN DEBUG ===');
      console.log('User ID:', data.user.id);
      console.log('User Email:', data.user.email);
      console.log('User metadata role:', data.user.user_metadata?.role);
      console.log('Profile data:', profile);
      console.log('Profile role:', profile?.role);

      // Get role from metadata first (more reliable source), then profile, with fallback
      const metadataRole = data.user.user_metadata?.role;
      const profileRole = profile?.role;
      
      // If metadata role exists and differs from profile role, prioritize metadata
      let userRole = metadataRole || profileRole || 'participant';
      
      // Fix profile role if it's incorrect
      if (profile && metadataRole && profileRole !== metadataRole) {
        console.log('🔧 ROLE MISMATCH DETECTED - Fixing profile role');
        console.log('Metadata role:', metadataRole);
        console.log('Profile role:', profileRole);
        
        // Use service role key for update
        const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey);
        
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ role: metadataRole })
          .eq('id', data.user.id);
          
        if (updateError) {
          console.error('Profile role update error:', updateError);
        } else {
          console.log('✅ Profile role updated to:', metadataRole);
        }
      }
      
      console.log('Final assigned role:', userRole);
      console.log('=== END LOGIN DEBUG ===');
      
      // If no profile exists, create one with the correct role
      if (!profile) {
        console.log('📝 Creating profile for user:', data.user.id);
        
        // Create authenticated Supabase client with the user's session
        const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
          global: {
            headers: {
              Authorization: `Bearer ${data.session.access_token}`
            }
          }
        });
        
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.user_metadata?.first_name || '',
          last_name: data.user.user_metadata?.last_name || '',
          role: data.user.user_metadata?.role || 'participant',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Profile data to insert:', profileData);
        
        const { data: newProfile, error: profileError } = await authenticatedSupabase
          .from('profiles')
          .insert(profileData);
        
        if (profileError) {
          console.error('❌ Profile creation error:', profileError);
        } else {
          console.log('✅ Profile created successfully:', newProfile);
        }
      }      console.log('User logged in successfully');
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
          role: userRole,
          firstName: profile?.first_name || data.user.user_metadata?.first_name,
          lastName: profile?.last_name || data.user.user_metadata?.last_name
        },
        session: {
          access_token: data.session.access_token,  // Keep snake_case for frontend compatibility
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      });
    }

    // LOGOUT
    if (action === 'logout') {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      console.log('User logged out successfully');
      return res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    }

    // REFRESH
    if (action === 'refresh') {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        console.error('Token refresh error:', error);
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }      console.log('Token refreshed successfully');
      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        session: {
          access_token: data.session.access_token,  // Keep snake_case for frontend compatibility
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      });
    }

    // STATUS
    if (action === 'status') {
      if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.error('Token validation error:', error);
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get role from profile first, then from user metadata, with fallback
      const userRole = profile?.role || user.user_metadata?.role || 'participant';

      console.log('Token validated successfully');
      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: {
          id: user.id,
          email: user.email,
          role: userRole,
          firstName: profile?.first_name || user.user_metadata?.first_name,
          lastName: profile?.last_name || user.user_metadata?.last_name,
          emailConfirmed: user.email_confirmed_at !== null
        }
      });    }

    // PASSWORD OPERATIONS
    if (action === 'forgot-password') {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

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

      return res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    }

    if (action === 'reset-password') {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const { password } = req.body;
      const accessToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'New password is required'
        });
      }

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          error: 'Access token is required'
        });
      }

      console.log('Updating password for user');
      
      // Create new supabase instance with access token
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Password updated successfully',
        user: {
          id: data.user?.id,
          email: data.user?.email
        }
      });
    }

    if (action === 'change-password') {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
      }

      const { currentPassword, newPassword } = req.body;
      const accessToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          error: 'Access token is required'
        });
      }

      console.log('Changing password for user');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
      
      if (userError || !user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid access token'
        });
      }

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (verifyError) {
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
      error: 'Invalid action. Use: register, login, logout, refresh, status, forgot-password, reset-password, or change-password'
    });

  } catch (error) {
    console.error(`=== AUTH ${action?.toUpperCase()} ERROR ===`);
    console.error('Error details:', error);
    
    res.status(500).json({
      success: false,
      error: `Auth ${action} failed`,
      message: error.message
    });
  }
}
