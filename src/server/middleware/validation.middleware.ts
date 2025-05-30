import { body, param, query, validationResult } from 'express-validator';
import type { ValidationChain } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * Middleware to handle validation results
 */
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    next();
  };
};

/**
 * Custom validator for MongoDB ObjectId
 */
const isValidObjectId = (value: string): boolean => {
  return mongoose.Types.ObjectId.isValid(value);
};

/**
 * Common validation rules
 */
export const commonValidation = {
  // MongoDB ObjectId validation
  objectId: (field: string = 'id') => 
    param(field)
      .custom(isValidObjectId)
      .withMessage(`Invalid ${field} format`),

  // Email validation
  email: (field: string = 'email') =>
    body(field)
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),

  // Password validation
  password: (field: string = 'password') =>
    body(field)
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  // URL validation
  url: (field: string) =>
    body(field)
      .optional()
      .isURL()
      .withMessage(`${field} must be a valid URL`),

  // Date validation
  date: (field: string) =>
    body(field)
      .optional()
      .isISO8601()
      .toDate()
      .withMessage(`${field} must be a valid date`),

  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isString()
      .withMessage('Sort must be a string'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be either asc or desc')
  ]
};

/**
 * User validation rules
 */
export const userValidation = {
  register: [
    body('firstName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name is required and must be less than 50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name is required and must be less than 50 characters'),
    commonValidation.email(),
    commonValidation.password(),
    body('role')
      .optional()
      .isIn(['participant', 'researcher', 'admin'])
      .withMessage('Invalid role'),
    body('organization')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Organization name must be less than 100 characters')
  ],

  login: [
    commonValidation.email(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be less than 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be less than 50 characters'),
    body('organization')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Organization name must be less than 100 characters'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidation.password('newPassword'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match');
        }
        return true;
      })
  ]
};

/**
 * Study validation rules
 */
export const studyValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title is required and must be less than 200 characters'),
    body('description')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Description is required and must be less than 2000 characters'),
    body('type')
      .isIn(['usability', 'user_interview', 'survey', 'a_b_test', 'card_sorting', 'tree_testing'])
      .withMessage('Invalid study type'),
    body('targetParticipants')
      .isInt({ min: 1, max: 10000 })
      .withMessage('Target participants must be between 1 and 10000'),
    body('estimatedDuration')
      .isInt({ min: 1, max: 7200 })
      .withMessage('Estimated duration must be between 1 and 7200 seconds'),
    body('compensation.amount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Compensation amount must be a positive number'),
    body('compensation.currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be a 3-letter code'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each tag must be less than 50 characters')
  ],

  update: [
    commonValidation.objectId('studyId'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be less than 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Description must be less than 2000 characters'),
    body('targetParticipants')
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage('Target participants must be between 1 and 10000'),
    body('estimatedDuration')
      .optional()
      .isInt({ min: 1, max: 7200 })
      .withMessage('Estimated duration must be between 1 and 7200 seconds')
  ],

  getById: [
    commonValidation.objectId('studyId')
  ]
};

/**
 * Task validation rules
 */
export const taskValidation = {
  create: [
    commonValidation.objectId('studyId'),
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title is required and must be less than 200 characters'),
    body('description')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Description is required and must be less than 2000 characters'),
    body('type')
      .isIn(['navigation', 'information_finding', 'transaction', 'content_creation', 'comparison'])
      .withMessage('Invalid task type'),
    body('instructions')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Instructions are required and must be less than 5000 characters'),
    body('expectedDuration')
      .isInt({ min: 1, max: 3600 })
      .withMessage('Expected duration must be between 1 and 3600 seconds'),
    body('order')
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
    commonValidation.url('targetUrl'),
    body('successCriteria')
      .optional()
      .isArray()
      .withMessage('Success criteria must be an array'),
    body('successCriteria.*.description')
      .optional()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Success criteria description must be less than 500 characters')
  ],

  update: [
    commonValidation.objectId('taskId'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be less than 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Description must be less than 2000 characters'),
    body('instructions')
      .optional()
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Instructions must be less than 5000 characters'),
    body('expectedDuration')
      .optional()
      .isInt({ min: 1, max: 3600 })
      .withMessage('Expected duration must be between 1 and 3600 seconds'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer')
  ]
};

/**
 * Session validation rules
 */
export const sessionValidation = {
  create: [
    commonValidation.objectId('studyId'),
    commonValidation.objectId('participantId'),
    body('scheduledAt')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Scheduled date must be a valid date'),
    body('browserInfo.userAgent')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('User agent must be less than 500 characters'),
    body('browserInfo.viewport.width')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Viewport width must be a positive integer'),
    body('browserInfo.viewport.height')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Viewport height must be a positive integer')
  ],

  updateProgress: [
    commonValidation.objectId('sessionId'),
    body('currentTaskIndex')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Current task index must be a non-negative integer'),
    body('taskCompletions')
      .optional()
      .isArray()
      .withMessage('Task completions must be an array')
  ],

  addFeedback: [
    commonValidation.objectId('sessionId'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Feedback content is required and must be less than 5000 characters'),
    body('ratings.overall')
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage('Overall rating must be between 1 and 5'),
    body('type')
      .optional()
      .isIn(['general', 'task_specific', 'bug_report', 'suggestion', 'complaint'])
      .withMessage('Invalid feedback type')
  ]
};

/**
 * Recording validation rules
 */
export const recordingValidation = {
  start: [
    commonValidation.objectId('sessionId'),
    body('quality')
      .optional()
      .isIn(['low', 'medium', 'high', 'ultra'])
      .withMessage('Invalid recording quality'),
    body('videoProperties.width')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Video width must be a positive integer'),
    body('videoProperties.height')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Video height must be a positive integer')
  ],

  stop: [
    commonValidation.objectId('recordingId'),
    body('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
    body('fileSize')
      .optional()
      .isInt({ min: 1 })
      .withMessage('File size must be a positive integer')
  ]
};

/**
 * Payment validation rules
 */
export const paymentValidation = {
  createIntent: [
    body('amount')
      .isFloat({ min: 0.50 })
      .withMessage('Amount must be at least $0.50'),
    body('currency')
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be a 3-letter code'),
    body('paymentMethodId')
      .notEmpty()
      .withMessage('Payment method ID is required')
  ],

  processRefund: [
    commonValidation.objectId('paymentId'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Refund amount must be positive'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Refund reason must be less than 500 characters')
  ]
};

/**
 * Subscription validation rules
 */
export const subscriptionValidation = {
  create: [
    body('priceId')
      .notEmpty()
      .withMessage('Price ID is required'),
    body('paymentMethodId')
      .notEmpty()
      .withMessage('Payment method ID is required')
  ],

  update: [
    commonValidation.objectId('subscriptionId'),
    body('priceId')
      .optional()
      .notEmpty()
      .withMessage('Price ID cannot be empty')
  ],

  cancel: [
    commonValidation.objectId('subscriptionId'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Cancellation reason must be less than 500 characters'),
    body('immediate')
      .optional()
      .isBoolean()
      .withMessage('Immediate must be a boolean')
  ]
};

/**
 * Feedback validation rules
 */
export const feedbackValidation = {
  create: [
    commonValidation.objectId('studyId'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Content is required and must be less than 5000 characters'),
    body('type')
      .isIn(['general', 'task_specific', 'bug_report', 'suggestion', 'complaint'])
      .withMessage('Invalid feedback type'),
    body('ratings.overall')
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage('Overall rating must be between 1 and 5'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority level'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
  ],

  respond: [
    commonValidation.objectId('feedbackId'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Response content is required and must be less than 2000 characters'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean')
  ]
};

/**
 * File upload validation
 */
export const fileValidation = {
  avatar: [    body('file')
      .custom((_value, { req }) => {
        if (!req.file) {
          return true; // Optional file
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Only JPEG, PNG and GIF files are allowed');
        }
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
          throw new Error('File size cannot exceed 5MB');
        }
        return true;
      })
  ],

  recording: [    body('file')
      .custom((_value, { req }) => {
        if (!req.file) {
          throw new Error('Recording file is required');
        }
        const allowedTypes = ['video/webm', 'video/mp4', 'video/avi'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Only WebM, MP4 and AVI files are allowed');
        }
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (req.file.size > maxSize) {
          throw new Error('File size cannot exceed 500MB');
        }
        return true;
      })
  ]
};
