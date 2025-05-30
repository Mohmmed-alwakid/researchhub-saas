import { Router } from 'express';
import {
  submitFeedback,
  getSessionFeedback,
  getStudyFeedback,
  getTaskFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackAnalytics
} from '../controllers/feedback.controller';
import { authenticateToken, authenticateSessionToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// Validation rules
const submitFeedbackValidation = [
  body('type').isIn(['rating', 'comment', 'suggestion', 'issue', 'compliment']).withMessage('Invalid feedback type'),
  body('content').isLength({ min: 1, max: 2000 }).withMessage('Content is required and must be less than 2000 characters'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
];

const updateFeedbackValidation = [
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isString().withMessage('Each tag must be a string'),
  body('status').optional().isIn(['new', 'reviewed', 'resolved', 'archived']).withMessage('Invalid status')
];

const getFeedbackValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['rating', 'comment', 'suggestion', 'issue', 'compliment']).withMessage('Invalid feedback type'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('taskId').optional().isMongoId().withMessage('Invalid task ID')
];

const sessionIdValidation = [
  param('sessionId').isMongoId().withMessage('Invalid session ID')
];

const studyIdValidation = [
  param('studyId').isMongoId().withMessage('Invalid study ID')
];

const taskIdValidation = [
  param('taskId').isMongoId().withMessage('Invalid task ID')
];

const feedbackIdValidation = [
  param('id').isMongoId().withMessage('Invalid feedback ID')
];

// Routes with session token authentication (for participants)
router.post('/session/:sessionId', 
  authenticateSessionToken, 
  validateRequest([...sessionIdValidation, ...submitFeedbackValidation]), 
  submitFeedback
);
router.post('/session/:sessionId/task/:taskId', 
  authenticateSessionToken, 
  validateRequest([...sessionIdValidation, ...taskIdValidation, ...submitFeedbackValidation]), 
  submitFeedback
);

// Protected routes (for researchers)
router.use(authenticateToken);

router.get('/session/:sessionId', validateRequest(sessionIdValidation), getSessionFeedback);
router.get('/study/:studyId', 
  validateRequest([...studyIdValidation, ...getFeedbackValidation]), 
  getStudyFeedback
);
router.get('/task/:taskId', validateRequest(taskIdValidation), getTaskFeedback);
router.get('/study/:studyId/analytics', validateRequest(studyIdValidation), getFeedbackAnalytics);
router.get('/:id', validateRequest(feedbackIdValidation), getFeedback);
router.put('/:id', 
  validateRequest([...feedbackIdValidation, ...updateFeedbackValidation]), 
  updateFeedback
);
router.delete('/:id', validateRequest(feedbackIdValidation), deleteFeedback);

export default router;
