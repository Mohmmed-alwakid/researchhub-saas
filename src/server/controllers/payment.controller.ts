import type { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { Payment } from '../../database/models/Payment.model';
import { Subscription } from '../../database/models/Subscription.model';
import { User } from '../../database/models/User.model';
import { APIError } from '../middleware/error.middleware';
import type { AuthRequest } from '../../shared/types/index.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

/**
 * Create payment intent for subscription
 */
export const createPaymentIntent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {    const userId = req.user?.id;
    const { planType, amount, currency = 'usd' } = req.body;

    if (!userId) {
      return next(new APIError('User not authenticated', 401));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new APIError('User not found', 404));
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      customer: user.stripeCustomerId || undefined,
      metadata: {
        userId,
        planType,
        email: user.email
      }
    });

    // Create payment record
    const payment = new Payment({
      user: userId,
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency,
      status: 'pending',
      type: 'subscription',
      metadata: {
        planType,
        paymentIntentId: paymentIntent.id
      }
    });

    await payment.save();

    res.status(201).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id
      },
      message: 'Payment intent created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create payment intent for participant compensation
 */
export const createParticipantPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {    const userId = req.user?.id;
    const { participantEmail, amount, currency = 'usd', description } = req.body;

    if (!userId) {
      return next(new APIError('User not authenticated', 401));
    }

    // Create payment intent for transfer to participant
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata: {
        researcherId: userId,
        participantEmail,
        type: 'participant_compensation',
        description
      }
    });

    // Create payment record
    const payment = new Payment({
      user: userId,
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency,
      status: 'pending',
      type: 'participant_compensation',
      metadata: {
        participantEmail,
        description,
        paymentIntentId: paymentIntent.id
      }
    });

    await payment.save();

    res.status(201).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id
      },
      message: 'Participant payment intent created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Stripe webhook events
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.log(`Webhook signature verification failed.`, errorMessage);
      res.status(400).send(`Webhook Error: ${errorMessage}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSuccess(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await Payment.findOne({ 
      stripePaymentIntentId: paymentIntent.id 
    });

    if (payment) {
      payment.status = 'succeeded';
      payment.processedAt = new Date();
      await payment.save();

      // If this is a subscription payment, create/update subscription
      if (payment.type === 'subscription') {
        const planType = payment.metadata?.planType;        if (planType) {
          await createOrUpdateSubscription(payment.userId.toString(), planType as string);
        }
      }
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await Payment.findOne({ 
      stripePaymentIntentId: paymentIntent.id 
    });

    if (payment) {
      payment.status = 'failed';
      payment.processedAt = new Date();
      await payment.save();
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const user = await User.findOne({ stripeCustomerId: customerId });

    if (user) {      await Subscription.findOneAndUpdate(
        { user: user._id },        {
          stripeSubscriptionId: subscription.id,
          status: subscription.status,          currentPeriodStart: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
          updatedAt: new Date()
        },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  try {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      }
    );
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

/**
 * Handle invoice payment success
 */
async function handleInvoicePaymentSuccess(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as unknown as { subscription: string }).subscription;
    if (subscriptionId) {
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        {
          lastPaymentDate: new Date(),
          updatedAt: new Date()
        }
      );
    }
  } catch (error) {
    console.error('Error handling invoice payment success:', error);
  }
}

/**
 * Create or update subscription
 */
async function createOrUpdateSubscription(userId: string, planType: string) {
  try {
    const planMapping: { [key: string]: { features: string[], limits: Record<string, string | number> } } = {
      basic: {
        features: ['basic_analytics', 'screen_recording', 'up_to_5_studies'],
        limits: { studies: 5, participants: 100, storage: '10GB' }
      },
      pro: {
        features: ['advanced_analytics', 'heatmaps', 'unlimited_studies', 'team_collaboration'],
        limits: { studies: -1, participants: 1000, storage: '100GB' }
      },
      enterprise: {
        features: ['custom_integrations', 'priority_support', 'unlimited_everything'],
        limits: { studies: -1, participants: -1, storage: 'unlimited' }
      }
    };

    const plan = planMapping[planType];
    if (!plan) return;

    await Subscription.findOneAndUpdate(
      { user: userId },
      {
        planType,
        status: 'active',
        features: plan.features,
        limits: plan.limits,
        startDate: new Date(),
        updatedAt: new Date()
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
  }
}

/**
 * Get user payments
 */
export const getUserPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, type, status } = req.query;    if (!userId) {
      return next(new APIError('User not authenticated', 401));
    }    const skip = (Number(page) - 1) * Number(limit);
    const filter: Record<string, unknown> = { user: userId };

    if (type) filter.type = type;
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment by ID
 */
export const getPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const payment = await Payment.findById(id);    if (!payment) {
      return next(new APIError('Payment not found', 404));
    }    // Check if user owns this payment
    if (payment.userId.toString() !== userId) {
      return next(new APIError('Access denied', 403));
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel payment
 */
export const cancelPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const payment = await Payment.findById(id);    if (!payment) {
      return next(new APIError('Payment not found', 404));
    }    if (payment.userId.toString() !== userId) {
      return next(new APIError('Access denied', 403));
    }

    if (payment.status !== 'pending') {
      return next(new APIError('Can only cancel pending payments', 400));
    }

    // Cancel payment intent in Stripe
    if (payment.stripePaymentIntentId) {
      await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
    }

    payment.status = 'canceled';
    payment.processedAt = new Date();
    await payment.save();

    res.json({
      success: true,
      data: payment,
      message: 'Payment cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};
