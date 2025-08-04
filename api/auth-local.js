/**
 * LOCAL DEVELOPMENT AUTH API
 * Mock authentication system for local development when Supabase is unreachable
 */

// Test accounts for development (from TESTING_RULES_MANDATORY.md)
const TEST_ACCOUNTS = {
  'abwanwr77+participant@gmail.com': {
    id: 'user_participant_001',
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123',
    role: 'participant',
    firstName: 'Test',
    lastName: 'Participant',
    status: 'active',
    emailConfirmed: true
  },
  'abwanwr77+Researcher@gmail.com': {
    id: 'user_researcher_001',
    email: 'abwanwr77+Researcher@gmail.com',
    password: 'Testtest123',
    role: 'researcher',
    firstName: 'Test',
    lastName: 'Researcher', 
    status: 'active',
    emailConfirmed: true
  },
  'abwanwr77+admin@gmail.com': {
    id: 'user_admin_001',
    email: 'abwanwr77+admin@gmail.com',
    password: 'Testtest123',
    role: 'admin',
    firstName: 'Test',
    lastName: 'Admin',
    status: 'active',
    emailConfirmed: true
  }
};

function generateMockToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  // Simple base64 encoding for mock token (not secure, just for local dev)
  return 'mock_' + Buffer.from(JSON.stringify(payload)).toString('base64');
}

export default async function handler(req, res) {
  // Enable CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      
      case 'register':
        return await handleRegister(req, res);
      
      case 'refresh':
        return await handleRefresh(req, res);
      
      case 'logout':
        return await handleLogout(req, res);
      
      case 'status':
        return await handleStatus(req, res);
      
      case 'verify':
        return await handleVerify(req, res);
      
      case 'test-accounts':
        return await handleTestAccounts(req, res);
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action',
          availableActions: ['login', 'register', 'refresh', 'logout', 'status', 'verify', 'test-accounts']
        });
    }
  } catch (error) {
    console.error('Local auth handler exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
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

  console.log('🔑 Local Auth - Login attempt:', email);

  const user = TEST_ACCOUNTS[email];
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  const token = generateMockToken(user);
  const refreshToken = 'refresh_' + generateMockToken(user);

  console.log('✅ Local Auth - Login successful:', email, 'Role:', user.role);

  return res.status(200).json({
    success: true,
    message: 'Login successful (Local Development Mode)',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      emailConfirmed: user.emailConfirmed
    },
    session: {
      access_token: token,
      refresh_token: refreshToken,
      expires_in: 86400,
      token_type: 'bearer'
    }
  });
}

async function handleRegister(req, res) {
  return res.status(400).json({
    success: false,
    error: 'Registration disabled in local development mode. Use test accounts.'
  });
}

async function handleRefresh(req, res) {
  const { refresh_token } = req.body;
  
  if (!refresh_token || !refresh_token.startsWith('refresh_mock_')) {
    return res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }

  // Extract user data from refresh token
  try {
    const payload = refresh_token.replace('refresh_mock_', '');
    const userData = JSON.parse(Buffer.from(payload, 'base64').toString());
    const user = TEST_ACCOUNTS[userData.email];
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const newToken = generateMockToken(user);
    const newRefreshToken = 'refresh_' + generateMockToken(user);

    return res.status(200).json({
      success: true,
      session: {
        access_token: newToken,
        refresh_token: newRefreshToken,
        expires_in: 86400,
        token_type: 'bearer'
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid refresh token format'
    });
  }
}

async function handleLogout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
}

async function handleStatus(req, res) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No authorization token provided'
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token.startsWith('mock_')) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token format'
    });
  }

  try {
    const payload = token.replace('mock_', '');
    const userData = JSON.parse(Buffer.from(payload, 'base64').toString());
    const user = TEST_ACCOUNTS[userData.email];
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        emailConfirmed: user.emailConfirmed
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
}

async function handleVerify(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Email verification not required in local development mode'
  });
}

async function handleTestAccounts(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Test accounts for local development',
    accounts: Object.keys(TEST_ACCOUNTS).map(email => ({
      email,
      role: TEST_ACCOUNTS[email].role,
      password: 'Testtest123'
    }))
  });
}
