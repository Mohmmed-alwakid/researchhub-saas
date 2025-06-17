// Real registration with database connection debugging
import connectDB from '../utils/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    console.log('=== REGISTRATION DEBUG START ===');
    console.log('Environment check:', {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV
    });

    const { email, password, firstName, lastName, role = 'researcher' } = req.body;
    console.log('Request body parsed:', { email, firstName, lastName, role });

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      console.log('Validation failed: missing fields');
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    console.log('Step 1: Attempting database connection...');
    
    // Try to connect to database
    let dbConnection;
    try {
      dbConnection = await connectDB();
      console.log('Step 1 SUCCESS: Database connected');
    } catch (dbError) {
      console.error('Step 1 FAILED: Database connection error:', {
        message: dbError.message,
        name: dbError.name,
        stack: dbError.stack?.split('\n').slice(0, 3)
      });
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: dbError.message
      });
    }

    console.log('Step 2: Checking if user exists...');
    
    // Check if user already exists
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email.toLowerCase() });
      console.log('Step 2 SUCCESS: User check completed', { userExists: !!existingUser });
    } catch (userCheckError) {
      console.error('Step 2 FAILED: User check error:', {
        message: userCheckError.message,
        name: userCheckError.name
      });
      return res.status(500).json({
        success: false,
        error: 'User check failed',
        details: userCheckError.message
      });
    }

    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    console.log('Step 3: Hashing password...');
    
    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
      console.log('Step 3 SUCCESS: Password hashed');
    } catch (hashError) {
      console.error('Step 3 FAILED: Password hashing error:', hashError.message);
      return res.status(500).json({
        success: false,
        error: 'Password hashing failed',
        details: hashError.message
      });
    }

    console.log('Step 4: Creating user...');
    
    // Create new user
    let newUser;
    try {
      newUser = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role
      });
      
      await newUser.save();
      console.log('Step 4 SUCCESS: User created with ID:', newUser._id);
    } catch (saveError) {
      console.error('Step 4 FAILED: User save error:', {
        message: saveError.message,
        name: saveError.name,
        code: saveError.code
      });
      return res.status(500).json({
        success: false,
        error: 'User creation failed',
        details: saveError.message
      });
    }

    console.log('Step 5: Generating tokens...');
    
    // Generate tokens
    let tokens;
    try {
      const authToken = jwt.sign(
        { 
          userId: newUser._id, 
          email: newUser.email, 
          role: newUser.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      tokens = { authToken, refreshToken };
      console.log('Step 5 SUCCESS: Tokens generated');
    } catch (tokenError) {
      console.error('Step 5 FAILED: Token generation error:', tokenError.message);
      return res.status(500).json({
        success: false,
        error: 'Token generation failed',
        details: tokenError.message
      });
    }

    console.log('=== REGISTRATION DEBUG SUCCESS ===');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        status: newUser.status
      },
      tokens
    });

  } catch (error) {
    console.error('=== REGISTRATION DEBUG FAILED ===');
    console.error('Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: {
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 5)
      }
    });
  }
}
