import mongoose, { Schema, Document } from 'mongoose';
import type { IPayment } from '../../shared/types/index.js';
import { PaymentStatus, PaymentMethod } from '../../shared/types/index.js';

export interface IPaymentDocument extends Omit<IPayment, '_id' | 'userId'>, Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  // Additional Mongoose-specific properties not in the base interface
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  refundedAt?: Date;
  statementDescriptor?: string;
  fraudDetection?: {
    flagged?: boolean;
    reason?: string;
    reviewStatus?: string;
  };
  webhookEvents?: Array<{
    eventType?: string;
    eventId?: string;
    receivedAt?: Date;
    processed?: boolean;
  }>;
  retryHistory?: Array<{
    attemptNumber?: number;
    attemptedAt?: Date;
    status?: string;
    failureReason?: string;
  }>;
  maxRetryAttempts?: number;
  nextRetryAt?: Date;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  invoiceDetails?: {
    invoiceNumber?: string;
    billingPeriodStart?: Date;
    billingPeriodEnd?: Date;
    subscriptionPlan?: string;
    itemsDescription?: string[];
  };
  disputeStatus?: string;
  disputeAmount?: number;
  disputeReason?: string;
  failureCode?: string;
  failureMessage?: string;
  declineCode?: string;
  refundStatus?: string;
  refundReason?: string;
  // Add methods
  markAsSucceeded(chargeId: string, amountReceived: number, fees?: any): Promise<IPaymentDocument>;
  markAsFailed(failureCode: string, failureMessage: string, failureReason?: string): Promise<IPaymentDocument>;
  processRefund(refundAmount: number, reason?: string): Promise<IPaymentDocument>;
  flagForFraud(reason: string): Promise<IPaymentDocument>;
  approveAfterReview(): Promise<IPaymentDocument>;
  addWebhookEvent(eventType: string, eventId: string): Promise<IPaymentDocument>;
}

const PaymentSchema: Schema<IPaymentDocument> = new Schema({  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    index: true
  },
  
  // Payment identifiers
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  stripeChargeId: {
    type: String,
    index: true
  },
  stripeInvoiceId: {
    type: String,
    index: true
  },
  stripeCustomerId: {
    type: String,
    required: true,
    index: true  },
  
  // Payment details
  type: {
    type: String,
    enum: ['payment', 'payout', 'refund', 'subscription'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Amount information
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    default: 'USD'
  },
  amountReceived: {
    type: Number,
    default: 0
  },
  
  // Fees and charges
  stripeFee: {
    type: Number,
    default: 0
  },
  applicationFee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    default: 0
  },
  
  // Payment method
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true
  },
  paymentMethodDetails: {
    // Card details (for card payments)
    card: {
      brand: String, // visa, mastercard, etc.
      last4: String,
      expMonth: Number,
      expYear: Number,
      country: String,
      funding: String // credit, debit, prepaid
    },
    // Bank details (for ACH/SEPA)
    bank: {
      accountType: String,
      bankName: String,
      country: String,
      last4: String
    },
    // PayPal details
    paypal: {
      payerEmail: String,
      payerId: String
    }
  },
  
  // Billing information
  billingDetails: {
    name: String,
    email: String,
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  
  // Timing information
  attemptedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date,
  failedAt: Date,
  refundedAt: Date,
  
  // Description and metadata
  description: String,
  statementDescriptor: String,
  
  // Refund information
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'succeeded', 'failed', 'cancelled'],
    default: 'none'
  },
  
  // Dispute information
  disputeStatus: {
    type: String,
    enum: ['none', 'warning_needs_response', 'warning_under_review', 'warning_closed', 'needs_response', 'under_review', 'charge_refunded', 'won', 'lost'],
    default: 'none'
  },
  disputeAmount: Number,
  disputeReason: String,
  
  // Failure information
  failureCode: String,
  failureMessage: String,
  failureReason: String,
  declineCode: String,
  
  // Invoice information (for subscription payments)
  invoiceDetails: {
    invoiceNumber: String,
    billingPeriodStart: Date,
    billingPeriodEnd: Date,
    subscriptionPlan: String,
    itemsDescription: [String]
  },
  
  // Risk and fraud detection
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  fraudDetection: {
    flagged: {
      type: Boolean,
      default: false
    },
    reason: String,
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending'
    }
  },
  
  // Webhooks and notifications
  webhookEvents: [{
    eventType: String,
    eventId: String,
    receivedAt: Date,
    processed: Boolean
  }],
  
  // Retry information (for failed payments)
  retryAttempts: {
    type: Number,
    default: 0
  },
  maxRetryAttempts: {
    type: Number,
    default: 3
  },
  nextRetryAt: Date,
  retryHistory: [{
    attemptNumber: Number,
    attemptedAt: Date,
    status: String,
    failureReason: String
  }],
  
  // Metadata and tags
  metadata: {
    source: String, // web, mobile, api
    userAgent: String,
    ipAddress: String,
    referrer: String,
    campaignId: String,
    notes: String,
    tags: [String],
    customFields: Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ subscriptionId: 1, createdAt: -1 });
PaymentSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ stripeChargeId: 1 });
PaymentSchema.index({ stripeCustomerId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, type: 1 });
PaymentSchema.index({ paidAt: 1 });
PaymentSchema.index({ 'fraudDetection.flagged': 1, 'riskLevel': 1 });
PaymentSchema.index({ nextRetryAt: 1 });

// Virtual for payment success rate
PaymentSchema.virtual('isSuccessful').get(function(this: IPaymentDocument) {
  return this.status === PaymentStatus.SUCCEEDED;
});

// Virtual for payment age in days
PaymentSchema.virtual('ageInDays').get(function(this: IPaymentDocument) {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now.getTime() - created.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for processing time
PaymentSchema.virtual('processingTime').get(function(this: IPaymentDocument) {
  if (!this.paidAt || !this.attemptedAt) return null;
  
  const processTime = (this.paidAt as Date).getTime() - (this.attemptedAt as Date).getTime();
  return Math.floor(processTime / 1000); // in seconds
});

// Virtual for effective amount (after fees and refunds)
PaymentSchema.virtual('effectiveAmount').get(function(this: IPaymentDocument) {
  return (this.amountReceived || 0) - (this.stripeFee || 0) - (this.applicationFee || 0) - (this.refundAmount || 0);
});

// Pre-save middleware
PaymentSchema.pre('save', function(this: IPaymentDocument, next) {
  // Calculate net amount
  if ((this.amountReceived || 0) > 0) {
    this.netAmount = (this.amountReceived || 0) - (this.stripeFee || 0) - (this.applicationFee || 0);
  }
  
  // Set paid date when status changes to succeeded
  if (this.isModified('status') && this.status === PaymentStatus.SUCCEEDED && !this.paidAt) {
    this.paidAt = new Date();
  }
  
  // Set failed date when status changes to failed
  if (this.isModified('status') && this.status === PaymentStatus.FAILED && !this.failedAt) {
    this.failedAt = new Date();
  }
  
  // Auto-set risk level based on risk score
  if (this.riskScore !== undefined) {
    if ((this.riskScore || 0) >= 80) this.riskLevel = 'critical';
    else if ((this.riskScore || 0) >= 60) this.riskLevel = 'high';
    else if ((this.riskScore || 0) >= 40) this.riskLevel = 'medium';
    else this.riskLevel = 'low';
  }
  
  next();
});

// Static method to get payment analytics
PaymentSchema.statics.getAnalytics = function(dateRange?: { start: Date; end: Date }, userId?: string) {
  const matchStage: any = {};
  
  if (dateRange) {
    matchStage.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  if (userId) {
    matchStage.userId = new mongoose.Types.ObjectId(userId);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalReceived: { $sum: '$amountReceived' },
        totalFees: { $sum: { $add: ['$stripeFee', '$applicationFee'] } },
        totalRefunds: { $sum: '$refundAmount' },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        averageAmount: { $avg: '$amount' },
        averageProcessingTime: { $avg: '$processingTime' }
      }
    },
    {
      $addFields: {
        successRate: {
          $multiply: [
            { $divide: ['$successfulPayments', '$totalPayments'] },
            100
          ]
        },
        netRevenue: {
          $subtract: ['$totalReceived', { $add: ['$totalFees', '$totalRefunds'] }]
        }
      }
    }
  ]);
};

// Static method to get failed payments for retry
PaymentSchema.statics.getRetryablePayments = function() {
  const now = new Date();
  
  return this.find({
    status: PaymentStatus.FAILED,
    retryAttempts: { $lt: 3 }, // Use hardcoded value instead of this.maxRetryAttempts
    nextRetryAt: { $lte: now }
  }).populate('userId', 'email firstName lastName')
    .populate('subscriptionId');
};

// Static method to get fraud alerts
PaymentSchema.statics.getFraudAlerts = function() {
  return this.find({
    $or: [
      { 'fraudDetection.flagged': true },
      { riskLevel: { $in: ['high', 'critical'] } },
      { disputeStatus: { $ne: 'none' } }
    ]
  }).sort({ createdAt: -1 })
    .populate('userId', 'email firstName lastName')
    .limit(50);
};

// Instance method to mark as succeeded
PaymentSchema.methods.markAsSucceeded = function(this: IPaymentDocument, chargeId: string, amountReceived: number, fees: any = {}) {
  this.status = PaymentStatus.SUCCEEDED;
  this.stripeChargeId = chargeId;
  this.amountReceived = amountReceived;
  this.stripeFee = fees.stripeFee || 0;
  this.applicationFee = fees.applicationFee || 0;
  this.paidAt = new Date();
  
  return this.save();
};

// Instance method to mark as failed
PaymentSchema.methods.markAsFailed = function(this: IPaymentDocument, failureCode: string, failureMessage: string, failureReason?: string) {
  this.status = PaymentStatus.FAILED;
  this.failureCode = failureCode;
  this.failureMessage = failureMessage;
  this.failureReason = failureReason;
  this.failedAt = new Date();
  
  // Add to retry history
  if (!this.retryHistory) this.retryHistory = [];
  this.retryHistory.push({
    attemptNumber: (this.retryAttempts || 0) + 1,
    attemptedAt: new Date(),
    status: 'failed',
    failureReason: failureMessage
  });
  
  this.retryAttempts = (this.retryAttempts || 0) + 1;
  
  // Schedule next retry if under limit
  if ((this.retryAttempts || 0) < (this.maxRetryAttempts || 3)) {
    const nextRetry = new Date();
    nextRetry.setHours(nextRetry.getHours() + Math.pow(2, this.retryAttempts || 0)); // Exponential backoff
    this.nextRetryAt = nextRetry;
  }
  
  return this.save();
};

// Instance method to process refund
PaymentSchema.methods.processRefund = function(this: IPaymentDocument, refundAmount: number, reason?: string) {
  this.refundAmount = (this.refundAmount || 0) + refundAmount;
  this.refundReason = reason;
  this.refundStatus = 'pending';
  this.refundedAt = new Date();
  
  // If fully refunded, update status
  if ((this.refundAmount || 0) >= (this.amountReceived || 0)) {
    this.status = PaymentStatus.CANCELED;
  }
  
  return this.save();
};

// Instance method to flag for fraud
PaymentSchema.methods.flagForFraud = function(this: IPaymentDocument, reason: string) {
  this.fraudDetection = {
    flagged: true,
    reason,
    reviewStatus: 'pending'
  };
  
  if (!this.riskLevel || this.riskLevel === 'low') {
    this.riskLevel = 'high';
  }
  
  return this.save();
};

// Instance method to approve after fraud review
PaymentSchema.methods.approveAfterReview = function(this: IPaymentDocument) {
  if (this.fraudDetection) {
    this.fraudDetection.reviewStatus = 'approved';
    this.fraudDetection.flagged = false;
  }
  
  return this.save();
};

// Instance method to add webhook event
PaymentSchema.methods.addWebhookEvent = function(this: IPaymentDocument, eventType: string, eventId: string) {
  if (!this.webhookEvents) this.webhookEvents = [];
  
  this.webhookEvents.push({
    eventType,
    eventId,
    receivedAt: new Date(),
    processed: false
  });
  
  return this.save();
};

export const Payment = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
