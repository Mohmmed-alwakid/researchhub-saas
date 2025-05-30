import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendEmailVerification,
  getCurrentUser,
  updateProfile
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { 
  userValidation
} from '../middleware/validation.middleware';

const router = Router();

// Public routes
router.post('/register', validateRequest(userValidation.register), register);
router.post('/login', validateRequest(userValidation.login), login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendEmailVerification);

// Protected routes
router.use(authenticateToken);
router.get('/me', getCurrentUser);
router.put('/me', validateRequest(userValidation.updateProfile), updateProfile);
router.post('/logout', logout);
router.post('/change-password', validateRequest(userValidation.changePassword), changePassword);

export default router;
