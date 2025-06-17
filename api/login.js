// User login endpoint
import connectDB from '../utils/db.js';
import User from '../models/User.js';

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

  try {
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

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
