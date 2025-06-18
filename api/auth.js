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
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log('User logged in successfully');
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'participant',
          firstName: profile?.first_name,
          lastName: profile?.last_name
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at
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
      }

      console.log('Token refreshed successfully');
      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at
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
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Token validated successfully');
      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: {
          id: user.id,
          email: user.email,
          role: profile?.role || 'participant',
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          emailConfirmed: user.email_confirmed_at !== null
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use: register, login, logout, refresh, or status'
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
