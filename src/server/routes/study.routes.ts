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
  body('description').optional().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('type').isIn(['usability', 'survey', 'interview', 'card-sorting', 'a-b-testing']).withMessage('Invalid study type'),
  body('targetParticipants').optional().isInt({ min: 1 }).withMessage('Target participants must be a positive integer'),
  body('duration').optional().isInt({ min: 5, max: 480 }).withMessage('Duration must be between 5 and 480 minutes'),
  body('compensation').optional().isNumeric({ no_symbols: false }).withMessage('Compensation must be a number'),
  body('requirements').optional().isArray().withMessage('Requirements must be an array'),
  body('tasks').optional().isArray().withMessage('Tasks must be an array'),
  body('settings.recordScreen').optional().isBoolean().withMessage('recordScreen must be a boolean'),
  body('settings.recordAudio').optional().isBoolean().withMessage('recordAudio must be a boolean'),
  body('settings.recordWebcam').optional().isBoolean().withMessage('recordWebcam must be a boolean'),
  body('settings.trackClicks').optional().isBoolean().withMessage('trackClicks must be a boolean'),
  body('settings.trackHovers').optional().isBoolean().withMessage('trackHovers must be a boolean'),
  body('settings.trackScrolls').optional().isBoolean().withMessage('trackScrolls must be a boolean')
];

const updateStudyValidation = [
  body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('type').optional().isIn(['usability', 'survey', 'interview', 'card-sorting', 'a-b-testing']).withMessage('Invalid study type'),
  body('targetParticipants').optional().isInt({ min: 1 }).withMessage('Target participants must be a positive integer'),
  body('duration').optional().isInt({ min: 5, max: 480 }).withMessage('Duration must be between 5 and 480 minutes'),
  body('compensation').optional().isNumeric({ no_symbols: false }).withMessage('Compensation must be a number'),
  body('requirements').optional().isArray().withMessage('Requirements must be an array'),
  body('tasks').optional().isArray().withMessage('Tasks must be an array'),
  body('settings.recordScreen').optional().isBoolean().withMessage('recordScreen must be a boolean'),
  body('settings.recordAudio').optional().isBoolean().withMessage('recordAudio must be a boolean'),
  body('settings.recordWebcam').optional().isBoolean().withMessage('recordWebcam must be a boolean'),
  body('settings.trackClicks').optional().isBoolean().withMessage('trackClicks must be a boolean'),
  body('settings.trackHovers').optional().isBoolean().withMessage('trackHovers must be a boolean'),
  body('settings.trackScrolls').optional().isBoolean().withMessage('trackScrolls must be a boolean')
];

const getStudiesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'active', 'paused', 'completed']).withMessage('Invalid status'),
  query('type').optional().isIn(['usability', 'survey', 'interview', 'card-sorting', 'a-b-testing']).withMessage('Invalid study type')
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
