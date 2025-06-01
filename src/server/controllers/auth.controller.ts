import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { User } from '../../database/models/index.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';

/**
 * Generate JWT tokens
 */
const generateTokens = (userId: string) => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key';
  const accessToken = jwt.sign({ userId: userId.toString() }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ userId: userId.toString() }, jwtRefreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

/**
 * Set secure cookie options
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role = 'participant', organization } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError.conflict('User already exists with this email');
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role,
    organization,
    status: 'active',
    profile: {
      isOnboardingComplete: false,
      preferences: {
        emailNotifications: true,
        marketingEmails: false,
        language: 'en',
        timezone: 'UTC'
      }
    }  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens((user._id as mongoose.Types.ObjectId).toString());
  // Save refresh token to user
  user.refreshTokens = [{
    token: refreshToken,
    createdAt: new Date(),
    userAgent: req.get('User-Agent') || '',
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
  }];
  await user.save();

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, getCookieOptions());

  // Return user data and access token
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization,
        status: user.status,
        profile: user.profile,
        createdAt: user.createdAt
      },
      accessToken
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;  // Find user and include password for verification
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.matchPassword(password))) {
    throw createError.unauthorized('Invalid email or password');
  }

  // Check if account is active
  if (user.status !== 'active') {
    throw createError.forbidden('Account is not active. Please contact support.');
  }
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens((user._id as mongoose.Types.ObjectId).toString());

  // Clean up old refresh tokens (keep last 5)
  if (user.refreshTokens && user.refreshTokens.length >= 5) {
    user.refreshTokens = user.refreshTokens.slice(-4);
  }

  // Add new refresh token
  if (!user.refreshTokens) user.refreshTokens = [];  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    userAgent: req.get('User-Agent') || '',
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
  });

  // Update last login
  user.lastLoginAt = new Date();
  user.loginCount = (user.loginCount || 0) + 1;
  
  await user.save();

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, getCookieOptions());

  // Return user data and access token
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization,
        status: user.status,
        profile: user.profile,
        subscription: user.subscription,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      },
      accessToken
    }
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken && req.user) {
    // Remove refresh token from user record
    req.user.refreshTokens = req.user.refreshTokens?.filter(
      tokenObj => tokenObj.token !== refreshToken
    ) || [];
    await req.user.save();
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw createError.unauthorized('Refresh token not provided');
  }

  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as { userId: string };
    
    // Find user and verify refresh token exists
    const user = await User.findById(decoded.userId).populate('subscription');
    
    if (!user) {
      throw createError.unauthorized('Invalid refresh token');
    }

    const tokenExists = user.refreshTokens?.some(tokenObj => tokenObj.token === refreshToken);
    if (!tokenExists) {
      throw createError.unauthorized('Invalid refresh token');
    }

    // Check if account is active
    if (user.status !== 'active') {
      throw createError.forbidden('Account is not active');
    }    // Generate new access token
    const { accessToken, refreshToken: newRefreshToken } = generateTokens((user._id as mongoose.Types.ObjectId).toString());    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens?.map(tokenObj => 
      tokenObj.token === refreshToken 
        ? {
            token: newRefreshToken,
            createdAt: new Date(),
            userAgent: req.get('User-Agent') || '',
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
          }
        : tokenObj
    ) || [];

    await user.save();

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, getCookieOptions());

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          subscription: user.subscription
        }
      }
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError.unauthorized('Invalid refresh token');
    }
    throw error;
  }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id)
    .select('-refreshTokens');

  res.json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, organization, bio, avatar } = req.body;

  const user = await User.findById(req.user!._id);
  if (!user) {
    throw createError.notFound('User not found');
  }
  // Update allowed fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (organization !== undefined) user.organization = organization;
  
  // Initialize profile if it doesn't exist
  if (!user.profile) {
    user.profile = {};
  }
    // Update profile fields with proper typing
  const profileData = user.profile as Record<string, unknown>;
  if (bio !== undefined) profileData.bio = bio;
  if (avatar !== undefined) profileData.avatar = avatar;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization,
        profile: user.profile
      }
    }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!._id).select('+password');
  if (!user) {
    throw createError.notFound('User not found');
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw createError.badRequest('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  user.passwordChangedAt = new Date();

  // Invalidate all refresh tokens
  user.refreshTokens = [];

  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully. Please log in again.'
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not
    res.json({
      success: true,
      message: 'If a user with that email exists, a password reset link has been sent.'
    });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = resetTokenHash;
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.save();

  // TODO: Send email with reset link
  // const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
  // await sendPasswordResetEmail(user.email, resetUrl);

  res.json({
    success: true,
    message: 'Password reset link sent to your email'
  });
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token to compare with stored hash
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: resetTokenHash,
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    throw createError.badRequest('Invalid or expired reset token');
  }

  // Update password and clear reset token
  user.password = password;
  user.passwordChangedAt = new Date();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // Invalidate all sessions

  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful. Please log in with your new password.'
  });
});

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() }
  });

  if (!user) {
    throw createError.badRequest('Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

/**
 * @desc    Resend email verification
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
export const resendEmailVerification = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  if (user.isEmailVerified) {
    throw createError.badRequest('Email is already verified');
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await user.save();

  // TODO: Send verification email
  // const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email/${verificationToken}`;
  // await sendEmailVerification(user.email, verificationUrl);

  res.json({
    success: true,
    message: 'Verification email sent'
  });
});
