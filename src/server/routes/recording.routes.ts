import { Router } from 'express';
import {
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  getRecording,
  getSessionRecordings,
  getStudyRecordings,
  updateRecording,
  deleteRecording,
  getRecordingUrl
} from '../controllers/recording.controller';
import { authenticateToken, authenticateSessionToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// Validation rules
const startRecordingValidation = [
  body('type').optional().isIn(['screen', 'webcam', 'microphone', 'screen_webcam']).withMessage('Invalid recording type'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
  body('metadata.screenResolution').optional().isString().withMessage('Screen resolution must be a string'),
  body('metadata.browser').optional().isString().withMessage('Browser must be a string')
];

const stopRecordingValidation = [
  body('fileUrl').isURL().withMessage('Valid file URL is required'),
  body('fileSize').isInt({ min: 1 }).withMessage('File size must be a positive integer'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer')
];

const updateRecordingValidation = [
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isString().withMessage('Each tag must be a string'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
];

const getRecordingsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['screen', 'webcam', 'microphone', 'screen_webcam']).withMessage('Invalid recording type'),
  query('status').optional().isIn(['recording', 'paused', 'completed', 'failed']).withMessage('Invalid status')
];

const sessionIdValidation = [
  param('sessionId').isMongoId().withMessage('Invalid session ID')
];

const studyIdValidation = [
  param('studyId').isMongoId().withMessage('Invalid study ID')
];

const recordingIdValidation = [
  param('id').isMongoId().withMessage('Invalid recording ID')
];

// Routes with session token authentication (for participants during recording)
router.post('/session/:sessionId/start', 
  authenticateSessionToken, 
  validateRequest([...sessionIdValidation, ...startRecordingValidation]), 
  startRecording
);
router.post('/:id/stop', 
  authenticateSessionToken, 
  validateRequest([...recordingIdValidation, ...stopRecordingValidation]), 
  stopRecording
);
router.post('/:id/pause', 
  authenticateSessionToken, 
  validateRequest(recordingIdValidation), 
  pauseRecording
);
router.post('/:id/resume', 
  authenticateSessionToken, 
  validateRequest(recordingIdValidation), 
  resumeRecording
);

// Protected routes (for researchers)
router.use(authenticateToken);

router.get('/:id', validateRequest(recordingIdValidation), getRecording);
router.get('/session/:sessionId', validateRequest(sessionIdValidation), getSessionRecordings);
router.get('/study/:studyId', 
  validateRequest([...studyIdValidation, ...getRecordingsValidation]), 
  getStudyRecordings
);
router.put('/:id', 
  validateRequest([...recordingIdValidation, ...updateRecordingValidation]), 
  updateRecording
);
router.delete('/:id', validateRequest(recordingIdValidation), deleteRecording);
router.get('/:id/url', validateRequest(recordingIdValidation), getRecordingUrl);

export default router;
