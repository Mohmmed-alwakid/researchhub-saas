import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { PaymentRequest, UserCredits, User } from '../../database/models/index.js';
import type { ApiResponse } from '../types/api.js';

const router = express.Router();

// Plan configurations (same as user routes)
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

// Admin Routes - Require admin role

// GET /api/admin/payments/requests - Get all payment requests
router.get('/requests', authenticateToken, requireRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      planType,
      search 
    } = req.query;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (planType) filter.planType = planType;

    let query = PaymentRequest.find(filter);

    // Add search functionality
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      query = PaymentRequest.find({
        ...filter,
        $or: [
          { userId: { $in: userIds } },
          { referenceNumber: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const paymentRequests = await query
      .populate('userId', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await PaymentRequest.countDocuments(filter);

    const response: ApiResponse = {
      success: true,
      data: {
        paymentRequests,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        },
        summary: {
          pending: await PaymentRequest.countDocuments({ status: 'pending' }),
          verified: await PaymentRequest.countDocuments({ status: 'verified' }),
          rejected: await PaymentRequest.countDocuments({ status: 'rejected' })
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

// PUT /api/admin/payments/requests/:id/verify - Verify payment
router.put('/requests/:id/verify', authenticateToken, requireRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user?.id;

    const paymentRequest = await PaymentRequest.findById(id);
    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        error: 'Payment request not found'
      });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Can only verify pending payments'
      });
    }

    // Update payment request
    paymentRequest.status = 'verified';
    paymentRequest.verifiedAt = new Date();
    paymentRequest.verifiedBy = adminId;
    paymentRequest.adminNotes = adminNotes;
    await paymentRequest.save();

    // Get plan configuration
    const planConfig = PLAN_CONFIGS[paymentRequest.planType as keyof typeof PLAN_CONFIGS];
    
    // Update or create user credits
    let userCredits = await UserCredits.findOne({ userId: paymentRequest.userId });
    
    if (!userCredits) {
      userCredits = new UserCredits({
        userId: paymentRequest.userId,
        totalCredits: planConfig.credits,
        usedCredits: 0,
        planType: paymentRequest.planType,
        features: planConfig.features,
        planStartDate: new Date(),
        planEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    } else {
      // Add credits to existing account
      userCredits.totalCredits += planConfig.credits;
      userCredits.planType = paymentRequest.planType;
      userCredits.features = planConfig.features;
      userCredits.planEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Extend 30 days
    }    // Add to payment history
    userCredits.paymentHistory.push({
      paymentRequestId: paymentRequest._id as mongoose.Types.ObjectId,
      creditsAdded: planConfig.credits,
      addedAt: new Date(),
      addedBy: adminId as mongoose.Types.ObjectId
    });

    userCredits.updatedBy = adminId;
    await userCredits.save();

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Payment verified and credits added successfully',
        paymentRequest,
        creditsAdded: planConfig.credits
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
});

// PUT /api/admin/payments/requests/:id/reject - Reject payment
router.put('/requests/:id/reject', authenticateToken, requireRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }

    const paymentRequest = await PaymentRequest.findById(id);
    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        error: 'Payment request not found'
      });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Can only reject pending payments'
      });
    }

    paymentRequest.status = 'rejected';
    paymentRequest.rejectedAt = new Date();
    paymentRequest.rejectionReason = rejectionReason;
    paymentRequest.adminNotes = adminNotes;
    await paymentRequest.save();

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Payment request rejected',
        paymentRequest
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject payment'
    });
  }
});

// POST /api/admin/payments/credits/add - Manually add credits to user
router.post('/credits/add', authenticateToken, requireRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    const { userId, credits, planType, reason } = req.body;
    const adminId = req.user?.id;

    if (!userId || !credits || credits <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid user ID and positive credits amount required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get or create user credits
    let userCredits = await UserCredits.findOne({ userId });
    
    if (!userCredits) {
      const defaultPlan = planType || 'basic';
      const planConfig = PLAN_CONFIGS[defaultPlan as keyof typeof PLAN_CONFIGS];
      
      userCredits = new UserCredits({
        userId,
        totalCredits: credits,
        usedCredits: 0,
        planType: defaultPlan,
        features: planConfig.features
      });
    } else {
      userCredits.totalCredits += credits;
      if (planType) {
        userCredits.planType = planType;
        const planConfig = PLAN_CONFIGS[planType as keyof typeof PLAN_CONFIGS];
        userCredits.features = planConfig.features;
      }
    }

    // Create a manual payment request record for tracking
    const manualPaymentRequest = new PaymentRequest({
      userId,
      planType: planType || userCredits.planType,
      amount: 0, // Manual credit addition
      currency: 'SAR',
      paymentMethod: 'manual_admin',
      status: 'verified',
      verifiedAt: new Date(),
      verifiedBy: adminId,
      adminNotes: reason || 'Manual credit addition by admin'
    });
    await manualPaymentRequest.save();    // Add to payment history
    userCredits.paymentHistory.push({
      paymentRequestId: manualPaymentRequest._id as mongoose.Types.ObjectId,
      creditsAdded: credits,
      addedAt: new Date(),
      addedBy: adminId as mongoose.Types.ObjectId
    });

    userCredits.updatedBy = adminId;
    await userCredits.save();

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Credits added successfully',
        userCredits,
        creditsAdded: credits
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add credits'
    });
  }
});

// GET /api/admin/payments/analytics - Payment analytics
router.get('/analytics', authenticateToken, requireRole(['admin', 'super_admin']), async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const analytics = {
      totalRevenue: await PaymentRequest.aggregate([
        { $match: { status: 'verified' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      monthlyRevenue: await PaymentRequest.aggregate([
        { 
          $match: { 
            status: 'verified',
            verifiedAt: { $gte: thirtyDaysAgo }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      paymentsByStatus: await PaymentRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      paymentsByPlan: await PaymentRequest.aggregate([
        { $group: { _id: '$planType', count: { $sum: 1 } } }
      ]),
      recentPayments: await PaymentRequest.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      activeSubscriptions: await UserCredits.countDocuments({
        isActive: true,
        planEndDate: { $gt: now }
      })
    };

    const response: ApiResponse = {
      success: true,
      data: { analytics }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

export default router;
