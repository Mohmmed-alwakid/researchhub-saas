import { Router } from 'express';
import {
  getParticipants,
  inviteParticipant,
  updateParticipant,
  deleteParticipant,
  getParticipant,
  getParticipantStats
} from '../controllers/participant.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const inviteParticipantValidation = [
  body('studyId').isMongoId().withMessage('Valid study ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('firstName').isLength({ min: 1, max: 50 }).withMessage('First name is required and must be less than 50 characters'),
  body('lastName').isLength({ min: 1, max: 50 }).withMessage('Last name is required and must be less than 50 characters'),
  body('demographics').optional().isObject().withMessage('Demographics must be an object')
];

const updateParticipantValidation = [
  body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be less than 50 characters'),
  body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be less than 50 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('status').optional().isIn(['invited', 'accepted', 'declined', 'completed', 'no_show']).withMessage('Invalid status'),
  body('demographics').optional().isObject().withMessage('Demographics must be an object'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
];

const getParticipantsValidation = [
  query('studyId').optional().isMongoId().withMessage('Valid study ID required'),
  query('status').optional().isIn(['invited', 'accepted', 'declined', 'completed', 'no_show']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const participantIdValidation = [
  param('id').isMongoId().withMessage('Invalid participant ID')
];

// Routes
router.get('/', validateRequest(getParticipantsValidation), getParticipants);
router.post('/invite', validateRequest(inviteParticipantValidation), inviteParticipant);
router.get('/stats', getParticipantStats);
router.get('/:id', validateRequest(participantIdValidation), getParticipant);
router.put('/:id', validateRequest([...participantIdValidation, ...updateParticipantValidation]), updateParticipant);
router.delete('/:id', validateRequest(participantIdValidation), deleteParticipant);

export default router;
