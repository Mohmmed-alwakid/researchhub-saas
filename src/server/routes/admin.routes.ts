import { Router } from 'express';
import {
  getPlatformOverview,
  getAllUsers,
  updateUser,
  getSystemAnalytics,
  getAllStudies,
  updateStudyStatus,
  bulkUpdateUsers
} from '../controllers/admin.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(['admin', 'super_admin']));

// Validation rules
const updateUserValidation = [
  param('userId').isMongoId().withMessage('Valid user ID is required'),
  body('role').optional().isIn(['participant', 'researcher', 'admin', 'super_admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('name').optional().isString().trim().isLength({ min: 1 }).withMessage('Name must be a non-empty string'),
  body('email').optional().isEmail().withMessage('Valid email is required')
];

const updateStudyStatusValidation = [
  param('studyId').isMongoId().withMessage('Valid study ID is required'),
  body('status').isIn(['draft', 'active', 'paused', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('reason').optional().isString().trim().withMessage('Reason must be a string')
];

const bulkUpdateUsersValidation = [
  body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
  body('userIds.*').isMongoId().withMessage('All user IDs must be valid MongoDB IDs'),
  body('action').isIn(['activate', 'deactivate', 'changeRole']).withMessage('Invalid action'),
  body('value').optional().isString().trim().withMessage('Value must be a string when provided')
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isString().withMessage('SortBy must be a string'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('SortOrder must be asc or desc')
];

// Platform overview
router.get('/overview', getPlatformOverview);

// User management
router.get('/users', 
  validateRequest(paginationValidation),
  getAllUsers
);

router.put('/users/:userId',
  validateRequest(updateUserValidation),
  updateUser
);

router.put('/users/bulk',
  validateRequest(bulkUpdateUsersValidation),
  bulkUpdateUsers
);

// System analytics
router.get('/analytics',
  validateRequest([
    query('timeframe').optional().isIn(['7d', '30d', '90d']).withMessage('Invalid timeframe')
  ]),
  getSystemAnalytics
);

// Study oversight
router.get('/studies',
  validateRequest(paginationValidation),
  getAllStudies
);

router.put('/studies/:studyId/status',
  validateRequest(updateStudyStatusValidation),
  updateStudyStatus
);

export default router;
