import { Router } from 'express';
import {
  createTask,
  getStudyTasks,
  getTask,
  updateTask,
  deleteTask,
  reorderTasks,
  duplicateTask,
  getTaskAnalytics
} from '../controllers/task.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const createTaskValidation = [
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('type').isIn(['navigation', 'interaction', 'survey', 'observation', 'custom']).withMessage('Invalid task type'),
  body('instructions').isLength({ min: 1 }).withMessage('Instructions are required'),
  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('timeLimit').optional().isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
  body('isRequired').optional().isBoolean().withMessage('isRequired must be a boolean'),
  body('config').optional().isObject().withMessage('Config must be an object')
];

const updateTaskValidation = [
  body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('type').optional().isIn(['navigation', 'interaction', 'survey', 'observation', 'custom']).withMessage('Invalid task type'),
  body('instructions').optional().isLength({ min: 1 }).withMessage('Instructions cannot be empty'),
  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('timeLimit').optional().isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
  body('isRequired').optional().isBoolean().withMessage('isRequired must be a boolean'),
  body('config').optional().isObject().withMessage('Config must be an object')
];

const reorderTasksValidation = [
  body('taskIds').isArray({ min: 1 }).withMessage('Task IDs array is required'),
  body('taskIds.*').isMongoId().withMessage('Each task ID must be valid')
];

const studyIdValidation = [
  param('studyId').isMongoId().withMessage('Invalid study ID')
];

const taskIdValidation = [
  param('id').isMongoId().withMessage('Invalid task ID')
];

// Routes

// Get all tasks for a study
router.get('/study/:studyId', validateRequest(studyIdValidation), getStudyTasks);

// Create task for a study
router.post('/study/:studyId', validateRequest([...studyIdValidation, ...createTaskValidation]), createTask);

// Reorder tasks for a study
router.put('/study/:studyId/reorder', validateRequest([...studyIdValidation, ...reorderTasksValidation]), reorderTasks);

// Task-specific routes
router.get('/:id', validateRequest(taskIdValidation), getTask);
router.put('/:id', validateRequest([...taskIdValidation, ...updateTaskValidation]), updateTask);
router.delete('/:id', validateRequest(taskIdValidation), deleteTask);
router.post('/:id/duplicate', validateRequest(taskIdValidation), duplicateTask);
router.get('/:id/analytics', validateRequest(taskIdValidation), getTaskAnalytics);

export default router;
