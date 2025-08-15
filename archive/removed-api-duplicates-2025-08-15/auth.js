/**
 * PRODUCTION AUTH API - Vercel Compatible
 * Handles authentication without local dependencies
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.hM5DhDshOQOhXIepbPWiznEDgpN9MzGhB0kzlxGd_6Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'register':
        return await handleRegister(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'refresh':
        return await handleRefresh(req, res);
      case 'status':
        return await handleStatus(req, res);
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleLogin(req, res) {
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

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({
        success: false,
        error: error.message || 'Authentication failed'
      });
    }

    if (data.user) {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      const userData = {
        id: data.user.id,
        email: data.user.email,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        role: profile?.role || data.user.user_metadata?.role || 'participant',
        status: profile?.status || 'active',
        emailConfirmed: data.user.email_confirmed_at ? true : false
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userData,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });

  } catch (error) {
    console.error('Login exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, password, firstName, lastName, role = 'participant' } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  try {
    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role,
        firstName,
        lastName
      },
      email_confirm: true
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Registration failed'
      });
    }

    if (data.user) {
      // Create profile record
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          role: role,
          status: 'active'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway - profile can be created later
      }

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName,
          lastName,
          role,
          status: 'active'
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Registration failed'
    });

  } catch (error) {
    console.error('Registration exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
}

async function handleLogout(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
}

async function handleRefresh(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required'
    });
  }

  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
      console.error('Token refresh error:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      session: data.session
    });
  } catch (error) {
    console.error('Token refresh exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
}

async function handleStatus(req, res) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const userData = {
      id: user.id,
      email: user.email,
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      role: profile?.role || user.user_metadata?.role || 'participant',
      status: profile?.status || 'active',
      emailConfirmed: user.email_confirmed_at ? true : false
    };

    return res.status(200).json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Status check exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Status check failed'
    });
  }
}
