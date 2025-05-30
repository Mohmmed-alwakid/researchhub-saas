import { Router } from 'express';
import {
  getCurrentSubscription,
  getSubscriptionPlans,
  createCheckoutSession,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionUsage,
  getBillingHistory
} from '../controllers/subscription.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, query } from 'express-validator';

const router = Router();

// Validation rules
const createCheckoutValidation = [
  body('planId').isIn(['basic', 'pro', 'enterprise']).withMessage('Invalid plan ID'),
  body('successUrl').isURL().withMessage('Valid success URL is required'),
  body('cancelUrl').isURL().withMessage('Valid cancel URL is required')
];

const updateSubscriptionValidation = [
  body('planId').isIn(['basic', 'pro', 'enterprise']).withMessage('Invalid plan ID')
];

const cancelSubscriptionValidation = [
  body('cancelAtPeriodEnd').optional().isBoolean().withMessage('cancelAtPeriodEnd must be a boolean')
];

const getBillingHistoryValidation = [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];

// Public routes
router.get('/plans', getSubscriptionPlans);

// Protected routes
router.use(authenticateToken);

router.get('/current', getCurrentSubscription);
router.post('/checkout', validateRequest(createCheckoutValidation), createCheckoutSession);
router.put('/update', validateRequest(updateSubscriptionValidation), updateSubscription);
router.post('/cancel', validateRequest(cancelSubscriptionValidation), cancelSubscription);
router.post('/reactivate', reactivateSubscription);
router.get('/usage', getSubscriptionUsage);
router.get('/billing-history', validateRequest(getBillingHistoryValidation), getBillingHistory);

export default router;
