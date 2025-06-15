import express, { type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { PaymentRequest, UserCredits } from '../../database/models/index.js';
import type { ApiResponse } from '../types/api.js';

const router = express.Router();

// Configure multer for payment proof uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/payment-proofs/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

// Plan configurations
const PLAN_CONFIGS = {
  basic: {
    price: 99,
    currency: 'SAR',
    credits: 1000,
    features: {
      maxStudies: 5,
      maxParticipants: 100,
      maxRecordingMinutes: 500,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false
    }
  },
  pro: {
    price: 299,
    currency: 'SAR',
    credits: 3000,
    features: {
      maxStudies: 20,
      maxParticipants: 500,
      maxRecordingMinutes: 2000,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: false
    }
  },
  enterprise: {
    price: 999,
    currency: 'SAR',
    credits: 10000,
    features: {
      maxStudies: -1, // Unlimited
      maxParticipants: -1, // Unlimited
      maxRecordingMinutes: -1, // Unlimited
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true
    }
  }
};

// Company bank details for payment instructions
const BANK_DETAILS = {
  SAR: {
    accountName: 'ResearchHub Technologies',
    accountNumber: '1234567890',
    bankName: 'Al Rajhi Bank',
    iban: 'SA1234567890123456789012',
    swiftCode: 'RJHISARI'
  },
  USD: {
    accountName: 'ResearchHub Technologies',
    accountNumber: '9876543210',
    bankName: 'Saudi Investment Bank',
    iban: 'SA9876543210987654321098',
    swiftCode: 'SIBCSARI'
  }
};

// User Routes

// GET /api/payments/plans - Get available plans
router.get('/plans', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const plans = Object.entries(PLAN_CONFIGS).map(([key, config]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      ...config
    }));

    const response: ApiResponse = {
      success: true,
      data: { plans, bankDetails: BANK_DETAILS }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plans'
    });
  }
});

// POST /api/payments/request - Create payment request
router.post('/request', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { planType, currency = 'SAR', paymentMethod = 'bank_transfer' } = req.body;
    const userId = req.user?.id;

    if (!planType || !PLAN_CONFIGS[planType as keyof typeof PLAN_CONFIGS]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan type'
      });
    }

    const planConfig = PLAN_CONFIGS[planType as keyof typeof PLAN_CONFIGS];

    // Create payment request
    const paymentRequest = new PaymentRequest({
      userId,
      planType,
      amount: planConfig.price,
      currency,
      paymentMethod,
      bankDetails: BANK_DETAILS[currency as keyof typeof BANK_DETAILS]
    });

    await paymentRequest.save();

    const response: ApiResponse = {
      success: true,
      data: {
        paymentRequest: {
          id: paymentRequest._id,
          referenceNumber: paymentRequest.referenceNumber,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          bankDetails: paymentRequest.bankDetails,
          status: paymentRequest.status
        }
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating payment request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment request'
    });
  }
});

// POST /api/payments/:id/proof - Upload payment proof
router.post('/:id/proof', authenticateToken, upload.single('paymentProof'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Payment proof file is required'
      });
    }

    const paymentRequest = await PaymentRequest.findOne({
      _id: id,
      userId
    });

    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        error: 'Payment request not found'
      });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot upload proof for non-pending payment'
      });
    }

    paymentRequest.paymentProof = req.file.path;
    await paymentRequest.save();

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Payment proof uploaded successfully',
        filename: req.file.filename
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload payment proof'
    });
  }
});

// GET /api/payments/my-requests - Get user's payment requests
router.get('/my-requests', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    const paymentRequests = await PaymentRequest.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select('-bankDetails');

    const total = await PaymentRequest.countDocuments({ userId });

    const response: ApiResponse = {
      success: true,
      data: {
        paymentRequests,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment requests'
    });
  }
});

// GET /api/payments/credits - Get user's credit information
router.get('/credits', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    let userCredits = await UserCredits.findOne({ userId });

    if (!userCredits) {
      // Create default credits record
      userCredits = new UserCredits({
        userId,
        totalCredits: 0,
        usedCredits: 0,
        planType: 'basic',
        features: PLAN_CONFIGS.basic.features
      });
      await userCredits.save();
    }

    const response: ApiResponse = {
      success: true,
      data: { credits: userCredits }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching user credits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credits'
    });
  }
});

export default router;
