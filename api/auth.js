import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User schema (inline for simplicity)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, default: 'researcher' },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: String,
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Database connection
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Extract user from Authorization header
function extractUserFromToken(authHeader) {
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Route based on the URL path
    const { query } = req;
    const action = query.action || 'status';

    switch (action) {
      case 'register':
        return await handleRegister(req, res);
      case 'login':
        return await handleLogin(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'refresh':
        return await handleRefresh(req, res);
      case 'profile':
        return await handleProfile(req, res);
      case 'status':
      default:
        return res.status(200).json({
          success: true,
          message: 'Authentication API is running',
          endpoints: {
            register: '/api/auth?action=register',
            login: '/api/auth?action=login',
            logout: '/api/auth?action=logout',
            refresh: '/api/auth?action=refresh',
            profile: '/api/auth?action=profile'
          }
        });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, firstName, lastName, role = 'researcher' } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create verification token
  const verificationToken = jwt.sign(
    { email, timestamp: Date.now() },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '24h' }
  );

  // Create user
  const user = new User({
    email: email.toLowerCase(),
    password: hashedPassword,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    role,
    isEmailVerified: false,
    verificationToken,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await user.save();

  // Generate JWT tokens
  const accessToken = jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { 
      id: user._id, 
      email: user.email 
    },
    process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    { expiresIn: '7d' }
  );

  // Return user data (excluding password)
  const userData = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt
  };

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: userData,
    tokens: {
      accessToken,
      refreshToken
    }
  });
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate JWT tokens
  const accessToken = jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { 
      id: user._id, 
      email: user.email 
    },
    process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    { expiresIn: '7d' }
  );

  // Return user data (excluding password)
  const userData = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt
  };

  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: userData,
    tokens: {
      accessToken,
      refreshToken
    }
  });
}

async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
}

async function handleRefresh(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret'
    );

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      token: accessToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
}

async function handleProfile(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Extract user from token
  const userPayload = extractUserFromToken(req.headers.authorization);
  if (!userPayload) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Find user
  const user = await User.findById(userPayload.id).select('-password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Return user data
  const userData = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };

  res.status(200).json({
    success: true,
    user: userData
  });
}
