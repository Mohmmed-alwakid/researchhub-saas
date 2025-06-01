import type { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { Subscription } from '../../database/models/Subscription.model';
import { User } from '../../database/models/User.model';
import { Study } from '../../database/models/Study.model';
import { Session } from '../../database/models/Session.model';
import { APIError } from '../middleware/error.middleware';
import type { AuthRequest } from '../../shared/types/index.js';
import { SubscriptionStatus } from '../../shared/types/index.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

/**
 * Get user's current subscription
 */
export const getCurrentSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new APIError('User not authenticated', 401));
    }

    let subscription = await Subscription.findOne({ user: userId });

    // If no subscription exists, create a free tier subscription
    if (!subscription) {
      subscription = new Subscription({
        user: userId,
        planType: 'free',
        status: 'active',
        features: ['basic_analytics', 'up_to_2_studies'],
        limits: {
          studies: 2,
          participants: 50,
          storage: '1GB'
        },
        startDate: new Date()
      });
      await subscription.save();
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        description: 'Perfect for getting started with user research',
        price: 0,
        interval: 'month',
        features: [
          'Up to 2 studies',
          'Up to 50 participants per study',
          'Basic screen recording',
          'Basic analytics',
          '1GB storage',
          'Email support'
        ],
        limits: {
          studies: 2,
          participants: 50,
          storage: '1GB',
          teamMembers: 1
        },
        popular: false
      },
      {
        id: 'basic',
        name: 'Basic',
        description: 'Ideal for small teams and regular research',
        price: 29,
        interval: 'month',
        features: [
          'Up to 10 studies',
          'Up to 200 participants per study',
          'HD screen recording',
          'Advanced analytics',
          'Heatmaps',
          '10GB storage',
          'Priority email support'
        ],
        limits: {
          studies: 10,
          participants: 200,
          storage: '10GB',
          teamMembers: 3
        },
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'Best for growing teams and frequent research',
        price: 79,
        interval: 'month',
        features: [
          'Unlimited studies',
          'Up to 1000 participants per study',
          '4K screen recording',
          'Advanced analytics & insights',
          'Heatmaps & click tracking',
          'Team collaboration',
          '100GB storage',
          'Phone & chat support'
        ],
        limits: {
          studies: -1,
          participants: 1000,
          storage: '100GB',
          teamMembers: 10
        },
        popular: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations with complex needs',
        price: 199,
        interval: 'month',
        features: [
          'Unlimited everything',
          'Custom integrations',
          'Advanced security',
          'Dedicated account manager',
          'Custom analytics',
          'Unlimited team members',
          'Unlimited storage',
          '24/7 priority support'
        ],
        limits: {
          studies: -1,
          participants: -1,
          storage: 'unlimited',
          teamMembers: -1
        },
        popular: false
      }
    ];

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create subscription checkout session
 */
export const createCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { planId, successUrl, cancelUrl } = req.body;

    if (!userId) {
      return next(new APIError('User not authenticated', 401));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new APIError('User not found', 404));
    }

    // Plan price mapping (in cents)
    const planPrices: { [key: string]: string } = {
      basic: process.env.STRIPE_BASIC_PRICE_ID!,
      pro: process.env.STRIPE_PRO_PRICE_ID!,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!
    };

    const priceId = planPrices[planId];
    if (!priceId) {
      return next(new APIError('Invalid plan selected', 400));
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({        email: user.email,
        name: user.name,        metadata: {
          userId: (user._id as { toString(): string }).toString()
        }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId
      }
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update subscription plan
 */
export const updateSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { planId } = req.body;

    if (!userId) {
      return next(new APIError('User not authenticated', 401));
    }

    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription || !subscription.stripeSubscriptionId) {
      return next(new APIError('No active subscription found', 404));
    }

    // Plan price mapping
    const planPrices: { [key: string]: string } = {
      basic: process.env.STRIPE_BASIC_PRICE_ID!,
      pro: process.env.STRIPE_PRO_PRICE_ID!,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!
    };

    const newPriceId = planPrices[planId];
    if (!newPriceId) {
      return next(new APIError('Invalid plan selected', 400));
    }

    // Get current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      // Update subscription
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'always_invoice'
    });

    // Update local subscription
    subscription.planType = planId;
    subscription.updatedAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { cancelAtPeriodEnd = true } = req.body;

    if (!userId) {
      return next(new APIError('User not authenticated', 401));
    }

    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription || !subscription.stripeSubscriptionId) {
      return next(new APIError('No active subscription found', 404));
    }

    // Cancel subscription in Stripe
    if (cancelAtPeriodEnd) {      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
      subscription.status = SubscriptionStatus.CANCEL_AT_PERIOD_END;
    } else {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      subscription.status = 'canceled';
      subscription.cancelledAt = new Date();
    }

    subscription.updatedAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reactivate cancelled subscription
 */
export const reactivateSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new APIError('User not authenticated', 401));
    }    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription || !subscription.stripeSubscriptionId) {
      return next(new APIError('No subscription found', 404));
    }

    if (subscription.status !== SubscriptionStatus.CANCEL_AT_PERIOD_END) {
      return next(new APIError('Subscription is not set to cancel', 400));
    }

    // Reactivate subscription in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.updatedAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription reactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscription usage statistics
 */
export const getSubscriptionUsage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new APIError('User not authenticated', 401));
    }

    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      return next(new APIError('No subscription found', 404));
    }

    // Get current usage
    const studyCount = await Study.countDocuments({ 
      $or: [{ createdBy: userId }, { team: userId }] 
    });

    const totalParticipants = await Session.countDocuments({
      study: { $in: await Study.find({ 
        $or: [{ createdBy: userId }, { team: userId }] 
      }).distinct('_id') }
    });

    // Calculate storage usage (placeholder - would need actual file size tracking)
    const storageUsed = '2.5GB'; // This would be calculated from actual file storage    // Calculate usage percentages
    const studyUsagePercent = subscription.limits?.studies === -1 ? 0 : 
      Math.round((studyCount / (subscription.limits?.studies || 1)) * 100);

    const participantUsagePercent = subscription.limits?.participants === -1 ? 0 :
      Math.round((totalParticipants / (subscription.limits?.participants || 1)) * 100);

    res.json({
      success: true,
      data: {
        subscription,
        usage: {          studies: {
            current: studyCount,
            limit: subscription.limits?.studies,
            percentage: studyUsagePercent
          },
          participants: {
            current: totalParticipants,
            limit: subscription.limits?.participants,
            percentage: participantUsagePercent
          },
          storage: {
            current: storageUsed,
            limit: subscription.limits?.storage,
            percentage: 25 // Placeholder calculation
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get billing history
 */
export const getBillingHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { limit = 10 } = req.query;

    if (!userId) {
      return next(new APIError('User not authenticated', 401));
    }    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      res.json({
        success: true,
        data: { invoices: [] }
      });
      return;
    }

    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: Number(limit)
    });

    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: invoice.status,
      date: new Date(invoice.created * 1000),
      description: invoice.description,
      invoiceUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf
    }));

    res.json({
      success: true,
      data: {
        invoices: formattedInvoices
      }
    });
  } catch (error) {
    next(error);
  }
};
