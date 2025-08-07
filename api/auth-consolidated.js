/**
 * CONSOLIDATED AUTHENTICATION API
 * Merges: auth.js + auth-enhanced.js + auth-debug.js
 * Handles: login, register, refresh, verify, debug, enhanced flows
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.hM5DhDshOQOhXIepbPWiznEDgpN9MzGhB0kzlxGd_6Y';

let supabase, supabaseAdmin;
let useLocalAuth = false;

// Initialize Supabase with fallback
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} catch (error) {
  console.warn('⚠️ Supabase initialization failed, using local auth fallback');
  useLocalAuth = true;
}

// Test accounts for development (from TESTING_RULES_MANDATORY.md)
const TEST_ACCOUNTS = {
  participant: {
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123',
    role: 'participant'
  },
  researcher: {
    email: 'abwanwr77+Researcher@gmail.com',
    password: 'Testtest123',
    role: 'researcher'
  },
  admin: {
    email: 'abwanwr77+admin@gmail.com',
    password: 'Testtest123',
    role: 'admin'
  }
};

/**
 * Helper function to get authorization header (multiple methods)
 */
function getAuthHeader(req) {
  return req.headers.authorization || 
         req.headers.Authorization || 
         req.headers['authorization'] || 
         req.headers['Authorization'];
}

/**
 * Helper function to validate JWT token
 */
async function validateToken(token) {
  try {
    if (!token || !token.startsWith('Bearer ')) {
      return { valid: false, error: 'Invalid token format' };
    }

    const jwt = token.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(jwt);

    if (error || !user) {
      return { valid: false, error: 'Invalid or expired token' };
    }

    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Helper function to generate mock JWT token for local development
 */
function generateMockToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  })).toString('base64');
  return `${header}.${payload}.mock-signature`;
}

/**
 * Local authentication fallback for development
 */
async function handleLocalAuth(email, password, res) {
  console.log('🔧 Using local auth fallback for:', email);
  
  // Find test account
  const testAccount = Object.values(TEST_ACCOUNTS).find(acc => acc.email === email);
  
  if (!testAccount || testAccount.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'Invalid test account credentials'
    });
  }
  
  // Create mock user data
  const mockUser = {
    id: `mock-${testAccount.role}-${Date.now()}`,
    email: testAccount.email,
    role: testAccount.role,
    user_metadata: {
      first_name: testAccount.role.charAt(0).toUpperCase() + testAccount.role.slice(1),
      last_name: 'User',
      role: testAccount.role
    }
  };
  
  const mockToken = generateMockToken(mockUser);
  
  return res.status(200).json({
    success: true,
    message: 'Local authentication successful',
    user: mockUser,
    session: {
      access_token: mockToken,
      refresh_token: `refresh-${mockToken}`,
      expires_in: 86400
    },
    local_auth: true
  });
}

/**
 * Register new user
 */
async function handleRegister(req, res) {
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

  try {
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

    return res.status(200).json({
      success: true,
      message: 'Registration successful',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Registration exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Login user
 */
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
    // Check if this is a test account first (for local development)
    const testAccountEmails = Object.values(TEST_ACCOUNTS).map(acc => acc.email);
    if (testAccountEmails.includes(email)) {
      console.log('🔧 Test account detected, using local auth fallback...');
      return await handleLocalAuth(email, password, res);
    }

    // Try Supabase authentication for non-test accounts
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      
      // For connectivity issues, fall back to local auth if it's a test account
      if (error.message && error.message.includes('fetch failed')) {
        console.log('🔄 Network connectivity issue, checking for test account fallback...');
        if (testAccountEmails.includes(email)) {
          return await handleLocalAuth(email, password, res);
        }
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Try to fetch user profile from profiles table to get role and other details
    let profileData = null;
    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      if (profileError) {
        console.log('Profile table not accessible, using user_metadata:', profileError.message);
        profileData = null;
      } else {
        profileData = profile;
      }
    } catch (error) {
      console.log('Profile fetch failed, using user_metadata:', error.message);
      profileData = null;
    }

    // Return user with profile data including role
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: profileData?.first_name || data.user.user_metadata?.first_name || '',
        lastName: profileData?.last_name || data.user.user_metadata?.last_name || '',
        role: profileData?.role || data.user.user_metadata?.role || 'participant',
        status: profileData?.status,
        emailConfirmed: data.user.email_confirmed_at ? true : false
      },
      session: data.session
    });
  } catch (error) {
    console.error('Login exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Refresh token
 */
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
      error: 'Internal server error'
    });
  }
}

/**
 * Logout user
 */
async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authHeader = getAuthHeader(req);
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header required'
    });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: req.body.refresh_token || ''
    });

    if (!error) {
      await supabase.auth.signOut();
    }

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout exception:', error);
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  }
}

/**
 * Get user status/profile
 */
async function handleStatus(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authHeader = getAuthHeader(req);
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header required'
    });
  }

  try {
    const validation = await validateToken(authHeader);
    
    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: validation.error
      });
    }

    const supabaseUser = validation.user;

    // Try to fetch user profile from profiles table to get role and other details
    let profileData = null;
    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', supabaseUser.email)
        .single();
      
      if (profileError) {
        console.log('Profile table not accessible, using user_metadata:', profileError.message);
        profileData = null;
      } else {
        profileData = profile;
      }
    } catch (error) {
      console.log('Profile fetch failed, using user_metadata:', error.message);
      profileData = null;
    }

    // Format user data consistently with login response
    const formattedUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      firstName: profileData?.first_name || supabaseUser.user_metadata?.first_name || '',
      lastName: profileData?.last_name || supabaseUser.user_metadata?.last_name || '',
      role: profileData?.role || supabaseUser.user_metadata?.role || 'participant',
      status: profileData?.status,
      emailConfirmed: supabaseUser.email_confirmed_at ? true : false
    };

    console.log('🔍 Status Response - Formatted User:', {
      originalUser: supabaseUser,
      profileData: profileData,
      formattedUser: formattedUser,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      user: formattedUser
    });
  } catch (error) {
    console.error('Status check exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Verify token (enhanced validation)
 */
async function handleVerify(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { token } = req.body;
  const authHeader = getAuthHeader(req) || `Bearer ${token}`;

  if (!authHeader) {
    return res.status(400).json({
      success: false,
      error: 'Token required'
    });
  }

  try {
    const validation = await validateToken(authHeader);
    
    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        valid: false,
        error: validation.error
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      user: validation.user
    });
  } catch (error) {
    console.error('Token verification exception:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Debug authentication (development helper)
 */
async function handleDebug(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authHeader = getAuthHeader(req);
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: {
        authorization: req.headers.authorization,
        'content-type': req.headers['content-type'],
        origin: req.headers.origin,
        referer: req.headers.referer
      },
      query: req.query,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
      },
      authHeader: {
        present: !!authHeader,
        value: authHeader ? `${authHeader.substring(0, 20)}...` : null
      }
    };

    // If auth header present, validate it
    if (authHeader) {
      const validation = await validateToken(authHeader);
      debugInfo.tokenValidation = {
        valid: validation.valid,
        error: validation.error,
        userId: validation.user?.id || null,
        userEmail: validation.user?.email || null
      };
    }

    return res.status(200).json({
      success: true,
      debug: debugInfo
    });
  } catch (error) {
    console.error('Debug exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Debug failed',
      details: error.message
    });
  }
}

/**
 * Enhanced registration with role management
 */
async function handleEnhancedRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, password, firstName, lastName, role = 'participant', organizationId } = req.body;

  try {
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
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

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    // Create user profile in database
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          first_name: firstName,
          last_name: lastName,
          role: role,
          organization_id: organizationId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // User created in auth but profile failed - handle gracefully
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Enhanced registration successful',
      user: authData.user,
      session: authData.session
    });
  } catch (error) {
    console.error('Enhanced registration exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Test accounts management
 */
async function handleTestAccounts(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Test accounts not available in production'
    });
  }

  return res.status(200).json({
    success: true,
    testAccounts: TEST_ACCOUNTS,
    note: 'Use these accounts for testing (development only)'
  });
}

/**
 * Main handler - routes to appropriate sub-handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    console.log(`=== AUTH ACTION: ${action} ===`);

    switch (action) {
      case 'register':
        return await handleRegister(req, res);
      
      case 'login':
        return await handleLogin(req, res);
      
      case 'refresh':
        return await handleRefresh(req, res);
      
      case 'logout':
        return await handleLogout(req, res);
      
      case 'status':
        return await handleStatus(req, res);
      
      case 'verify':
        return await handleVerify(req, res);
      
      case 'debug':
        return await handleDebug(req, res);
      
      case 'enhanced-register':
        return await handleEnhancedRegister(req, res);
      
      case 'test-accounts':
        return await handleTestAccounts(req, res);
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action',
          availableActions: [
            'register', 'login', 'refresh', 'logout', 'status', 
            'verify', 'debug', 'enhanced-register', 'test-accounts'
          ]
        });
    }
  } catch (error) {
    console.error('Auth handler exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
