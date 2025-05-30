import { Router } from 'express';
import {
  startSession,
  getSession,
  updateSessionProgress,
  completeSession,
  pauseSession,
  resumeSession,
  getStudySessions,
  getSessionDetails,
  deleteSession
} from '../controllers/session.controller';
import { authenticateToken, authenticateSessionToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// Validation rules
const startSessionValidation = [
  body('participantInfo').isObject().withMessage('Participant info is required'),
  body('participantInfo.email').optional().isEmail().withMessage('Valid email required'),
  body('participantInfo.name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('participantInfo.age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1-120'),
  body('participantInfo.demographics').optional().isObject().withMessage('Demographics must be an object')
];

const updateProgressValidation = [
  body('action').isIn(['complete_task', 'next_task', 'previous_task']).withMessage('Invalid action'),
  body('taskId').optional().isMongoId().withMessage('Invalid task ID'),
  body('data').optional().isObject().withMessage('Data must be an object')
];

const completeSessionValidation = [
  body('feedback').optional().isObject().withMessage('Feedback must be an object')
];

const getSessionsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'paused', 'completed', 'abandoned']).withMessage('Invalid status')
];

const studyIdValidation = [
  param('studyId').isMongoId().withMessage('Invalid study ID')
];

const sessionIdValidation = [
  param('id').isMongoId().withMessage('Invalid session ID')
];

// Public routes (for participants)
router.post('/start/:studyId', validateRequest([...studyIdValidation, ...startSessionValidation]), startSession);
router.get('/:id', validateRequest(sessionIdValidation), getSession);

// Routes with session token authentication (for participants during active sessions)
router.put('/:id/progress', 
  authenticateSessionToken, 
  validateRequest([...sessionIdValidation, ...updateProgressValidation]), 
  updateSessionProgress
);
router.post('/:id/complete', 
  authenticateSessionToken, 
  validateRequest([...sessionIdValidation, ...completeSessionValidation]), 
  completeSession
);
router.post('/:id/pause', 
  authenticateSessionToken, 
  validateRequest(sessionIdValidation), 
  pauseSession
);
router.post('/:id/resume', 
  authenticateSessionToken, 
  validateRequest(sessionIdValidation), 
  resumeSession
);

// Protected routes (for researchers)
router.use(authenticateToken);

router.get('/study/:studyId/sessions', 
  validateRequest([...studyIdValidation, ...getSessionsValidation]), 
  getStudySessions
);
router.get('/:id/details', validateRequest(sessionIdValidation), getSessionDetails);
router.delete('/:id', validateRequest(sessionIdValidation), deleteSession);

export default router;
