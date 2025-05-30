import { Router } from 'express';
import {
  createPaymentIntent,
  createParticipantPayment,
  handleWebhook,
  getUserPayments,
  getPayment,
  cancelPayment
} from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// Validation rules
const createPaymentIntentValidation = [
  body('planType').isIn(['basic', 'pro', 'enterprise']).withMessage('Invalid plan type'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency')
];

const createParticipantPaymentValidation = [
  body('participantEmail').isEmail().withMessage('Valid participant email is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency'),
  body('description').isLength({ min: 1, max: 500 }).withMessage('Description is required and must be less than 500 characters')
];

const getPaymentsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['subscription', 'participant_compensation', 'refund']).withMessage('Invalid payment type'),
  query('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled']).withMessage('Invalid status')
];

const paymentIdValidation = [
  param('id').isMongoId().withMessage('Invalid payment ID')
];

// Webhook route (no authentication required, Stripe handles verification)
router.post('/webhook', handleWebhook);

// Protected routes
router.use(authenticateToken);

router.post('/intent', validateRequest(createPaymentIntentValidation), createPaymentIntent);
router.post('/participant', validateRequest(createParticipantPaymentValidation), createParticipantPayment);
router.get('/', validateRequest(getPaymentsValidation), getUserPayments);
router.get('/:id', validateRequest(paymentIdValidation), getPayment);
router.post('/:id/cancel', validateRequest(paymentIdValidation), cancelPayment);

export default router;
