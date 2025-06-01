import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import createError from 'http-errors';
import { User } from '../../database/models/index';
import path from 'path';
import fs from 'fs';

/**
 * @desc    Upload avatar image
 * @route   POST /api/upload/avatar
 * @access  Private
 */
export const uploadAvatarController = asyncHandler(async (req: Request, res: Response) => {  if (!req.file) {
    throw createError.BadRequest('No file uploaded');
  }

  // Validate file type (additional check)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    // Delete uploaded file if validation fails
    fs.unlinkSync(req.file.path);
    throw createError.BadRequest('Only JPEG, PNG, GIF, and WebP files are allowed');
  }

  // Generate file URL
  const fileUrl = `/uploads/${req.file.filename}`;

  // Update user avatar in database
  const user = await User.findById(req.user!._id);
  if (!user) {
    // Delete uploaded file if user not found
    fs.unlinkSync(req.file.path);
    throw createError.NotFound('User not found');
  }  // Delete old avatar file if it exists
  const profileData = user.profile as { avatar?: string } | undefined;
  if (profileData?.avatar && profileData.avatar.startsWith('/uploads/')) {
    const oldFilePath = path.join(process.cwd(), profileData.avatar);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  // Update user profile with new avatar
  user.profile = user.profile || {};
  (user.profile as { avatar?: string }).avatar = fileUrl;
  await user.save();

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl
    }
  });
});

/**
 * @desc    Upload recording file
 * @route   POST /api/upload/recording
 * @access  Private
 */
export const uploadRecordingController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw createError.BadRequest('No file uploaded');
  }

  // Validate file type (additional check)
  const allowedTypes = ['video/webm', 'video/mp4', 'video/avi'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    // Delete uploaded file if validation fails
    fs.unlinkSync(req.file.path);
    throw createError.BadRequest('Only WebM, MP4, and AVI files are allowed');
  }

  // Generate file URL
  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    success: true,
    message: 'Recording uploaded successfully',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl
    }
  });
});

/**
 * @desc    Upload general file
 * @route   POST /api/upload/file
 * @access  Private
 */
export const uploadFileController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw createError.BadRequest('No file uploaded');
  }

  // Generate file URL
  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl
    }
  });
});
