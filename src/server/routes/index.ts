import { Router } from 'express';
import authRoutes from './auth.routes';
import studyRoutes from './study.routes';
import taskRoutes from './task.routes';
import sessionRoutes from './session.routes';
import participantRoutes from './participant.routes';
import participantApplicationRoutes from './participantApplication.routes';
import uploadRoutes from './upload.routes';
import subscriptionRoutes from './subscription.routes';
import adminRoutes from './admin.routes';
// import recordingRoutes from './recording.routes';
// import feedbackRoutes from './feedback.routes';
// import paymentRoutes from './payment.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/studies', studyRoutes);
router.use('/tasks', taskRoutes);
router.use('/sessions', sessionRoutes);
router.use('/participants', participantRoutes);
router.use('/participant-applications', participantApplicationRoutes);
router.use('/upload', uploadRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/admin', adminRoutes);
// router.use('/recordings', recordingRoutes);
// router.use('/feedback', feedbackRoutes);
// router.use('/payments', paymentRoutes);

// Health check endpoint
router.get('/health', async (_req, res) => {
  try {
    // Set proper status code and headers for Railway healthcheck
    res.status(200).json({
      status: 'ok',
      success: true,
      message: 'ResearchHub API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      port: process.env.PORT || 3002
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      success: false,
      message: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// API documentation endpoint
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to ResearchHub API',
    version: '1.0.0',    endpoints: {
      auth: '/api/auth',
      studies: '/api/studies',
      tasks: '/api/tasks',
      sessions: '/api/sessions',
      participants: '/api/participants',
      recordings: '/api/recordings',
      feedback: '/api/feedback',
      payments: '/api/payments',
      subscriptions: '/api/subscriptions'
    },
    documentation: 'https://docs.researchhub.com/api'
  });
});

export default router;
