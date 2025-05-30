import { Router } from 'express';
import {
  createStudy,
  getStudies,
  getStudy,
  updateStudy,
  deleteStudy,
  publishStudy,
  pauseStudy,
  getStudyAnalytics
} from '../controllers/study.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const createStudyValidation = [
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category').isIn(['usability', 'user_interview', 'prototype_testing', 'survey', 'other']).withMessage('Invalid category'),
  body('settings.maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be a positive integer'),
  body('settings.estimatedDuration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
  body('settings.compensation').optional().isNumeric().withMessage('Compensation must be a number'),
  body('settings.isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
];

const updateStudyValidation = [
  body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('category').optional().isIn(['usability', 'user_interview', 'prototype_testing', 'survey', 'other']).withMessage('Invalid category'),
  body('settings.maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be a positive integer'),
  body('settings.estimatedDuration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
  body('settings.compensation').optional().isNumeric().withMessage('Compensation must be a number'),
  body('settings.isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
];

const getStudiesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'active', 'paused', 'completed']).withMessage('Invalid status'),
  query('category').optional().isIn(['usability', 'user_interview', 'prototype_testing', 'survey', 'other']).withMessage('Invalid category')
];

const studyIdValidation = [
  param('id').isMongoId().withMessage('Invalid study ID')
];

// Routes
router.get('/', validateRequest(getStudiesValidation), getStudies);
router.post('/', validateRequest(createStudyValidation), createStudy);
router.get('/:id', validateRequest(studyIdValidation), getStudy);
router.put('/:id', validateRequest([...studyIdValidation, ...updateStudyValidation]), updateStudy);
router.delete('/:id', validateRequest(studyIdValidation), deleteStudy);
router.post('/:id/publish', validateRequest(studyIdValidation), publishStudy);
router.post('/:id/pause', validateRequest(studyIdValidation), pauseStudy);
router.get('/:id/analytics', validateRequest(studyIdValidation), getStudyAnalytics);

export default router;
