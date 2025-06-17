// Consolidated authentication endpoints to reduce Vercel function count
import connectDB from '../utils/db.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req;
  const action = url.split('/').pop(); // Get the last part of the URL

  try {
    switch (action) {
      case 'register':
        return await handleRegister(req, res);
      case 'login':
        return await handleLogin(req, res);
      case 'status':
        return await handleStatus(req, res);
      default:
        return res.status(404).json({
          success: false,
          error: 'Auth endpoint not found'
        });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Registration handler
async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { email, password, firstName, lastName, role = 'researcher' } = req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    });
  }

  // Check if MongoDB is configured
  if (!process.env.MONGODB_URI) {
    // Return mock success for testing
    return res.status(201).json({
      success: true,
      message: 'User registered successfully (DEMO MODE - No MongoDB configured)',
      user: {
        id: 'demo_' + Date.now(),
        email: email.toLowerCase(),
        firstName,
        lastName,
        role,
        status: 'active',
        isEmailVerified: true,
        createdAt: new Date().toISOString()
      },
      tokens: {
        authToken: 'demo_token_' + Date.now(),
        refreshToken: 'demo_refresh_' + Date.now()
      },
      demo: true
    });
  }

  // MongoDB operations
  await connectDB();
  
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'User with this email already exists'
    });
  }

  const user = new User({
    email: email.toLowerCase(),
    password,
    firstName,
    lastName,
    role,
    status: 'active',
    isEmailVerified: true
  });

  await user.save();

  const authToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    userAgent: req.headers['user-agent'] || 'Unknown',
    ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
  });
  await user.save();

  const userResponse = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt
  };

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: userResponse,
    tokens: {
      authToken,
      refreshToken
    }
  });
}

// Login handler
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  // Check if MongoDB is configured
  if (!process.env.MONGODB_URI) {
    // Demo mode login
    if (password.length >= 6) {
      return res.status(200).json({
        success: true,
        message: 'Login successful (DEMO MODE)',
        user: {
          id: 'demo_user_' + Date.now(),
          email: email.toLowerCase(),
          firstName: 'Demo',
          lastName: 'User',
          role: 'researcher',
          status: 'active',
          isEmailVerified: true
        },
        tokens: {
          authToken: 'demo_token_' + Date.now(),
          refreshToken: 'demo_refresh_' + Date.now()
        },
        demo: true
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  }

  // MongoDB operations
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  if (user.status !== 'active') {
    return res.status(403).json({
      success: false,
      error: 'Account is not active'
    });
  }

  user.lastLoginAt = new Date();
  user.loginCount = (user.loginCount || 0) + 1;

  const authToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    userAgent: req.headers['user-agent'] || 'Unknown',
    ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
  });

  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  const userResponse = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    loginCount: user.loginCount,
    createdAt: user.createdAt
  };

  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: userResponse,
    tokens: {
      authToken,
      refreshToken
    }
  });
}

// Status handler
async function handleStatus(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: 'No valid token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  // Demo mode
  if (token.startsWith('demo_token_')) {
    return res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: 'demo_user',
        email: 'demo@researchhub.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'researcher',
        status: 'active',
        isEmailVerified: true
      },
      demo: true,
      message: 'User is authenticated (DEMO MODE)'
    });
  }

  // Check if MongoDB is configured
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      authenticated: false,
      message: 'Authentication not properly configured'
    });
  }

  // JWT verification
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        authenticated: false,
        message: 'Account is not active'
      });
    }

    res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        createdAt: user.createdAt
      },
      message: 'User is authenticated'
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: 'Invalid or expired token'
    });
  }
}
