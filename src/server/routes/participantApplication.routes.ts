import { Router } from 'express';
import { body, query, param } from 'express-validator';
import {
  getPublicStudies,
  applyToStudy,
  getMyApplications,
  withdrawApplication,
  getStudyApplications,
  reviewApplication
} from '../controllers/participantApplication.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = Router();

// Public routes
router.get('/studies/public', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['usability', 'survey', 'interview', 'card-sorting', 'a-b-testing']).withMessage('Invalid study type'),
  query('search').optional().isString().withMessage('Search must be a string'),
  validateRequest([])
], getPublicStudies);

// Protected routes
router.use(authenticateToken);

// Validation arrays
const applyToStudyValidation = [
  param('studyId').isMongoId().withMessage('Invalid study ID'),
  body('screeningResponses').optional().isArray().withMessage('Screening responses must be an array'),
  body('screeningResponses.*.questionId').isString().withMessage('Question ID is required'),
  body('screeningResponses.*.question').isString().withMessage('Question text is required'),
  body('screeningResponses.*.answer').isString().withMessage('Answer is required')
];

const getMyApplicationsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'withdrawn']).withMessage('Invalid status')
];

const withdrawApplicationValidation = [
  param('applicationId').isMongoId().withMessage('Invalid application ID')
];

const getStudyApplicationsValidation = [
  param('studyId').isMongoId().withMessage('Invalid study ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'withdrawn']).withMessage('Invalid status')
];

const reviewApplicationValidation = [
  param('applicationId').isMongoId().withMessage('Invalid application ID'),
  body('action').isIn(['approve', 'reject']).withMessage('Action must be "approve" or "reject"'),
  body('rejectionReason').optional().isString().withMessage('Rejection reason must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

// Participant routes
router.post('/studies/:studyId/apply', validateRequest(applyToStudyValidation), applyToStudy);
router.get('/applications/my', validateRequest(getMyApplicationsValidation), getMyApplications);
router.patch('/applications/:applicationId/withdraw', validateRequest(withdrawApplicationValidation), withdrawApplication);

// Researcher routes
router.get('/studies/:studyId/applications', validateRequest(getStudyApplicationsValidation), getStudyApplications);
router.patch('/applications/:applicationId/review', validateRequest(reviewApplicationValidation), reviewApplication);

export default router;
