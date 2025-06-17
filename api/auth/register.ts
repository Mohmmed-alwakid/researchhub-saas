import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../src/database/models/User.model';

// Database connection
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Validate input
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

    // Send verification email (async, don't wait)
    try {
      const verificationLink = `${process.env.CLIENT_URL || 'http://localhost:5175'}/verify-email?token=${verificationToken}`;
      const userName = `${firstName} ${lastName}`.trim();
      
      // Import email service dynamically to avoid issues
      const { emailService } = await import('../../src/server/services/email.service');
      emailService.sendVerificationEmail(email, userName, verificationLink);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

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

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
}
