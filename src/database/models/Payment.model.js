"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const index_js_1 = require("../../shared/types/index.js");
const PaymentSchema = new mongoose_1.Schema({ userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    // Payment identifiers
    stripePaymentIntentId: {
        type: String,
        unique: true,
        sparse: true
    },
    stripeChargeId: {
        type: String
    },
    stripeInvoiceId: {
        type: String
    },
    stripeCustomerId: {
        type: String,
        required: true
    },
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
        enum: Object.values(index_js_1.PaymentMethod),
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
        customFields: mongoose_1.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Indexes for performance
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ subscriptionId: 1, createdAt: -1 });
PaymentSchema.index({ stripeChargeId: 1 });
PaymentSchema.index({ stripeCustomerId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, type: 1 });
PaymentSchema.index({ paidAt: 1 });
PaymentSchema.index({ 'fraudDetection.flagged': 1, 'riskLevel': 1 });
PaymentSchema.index({ nextRetryAt: 1 });
// Virtual for payment success rate
PaymentSchema.virtual('isSuccessful').get(function () {
    return this.status === index_js_1.PaymentStatus.SUCCEEDED;
});
// Virtual for payment age in days
PaymentSchema.virtual('ageInDays').get(function () {
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffTime = now.getTime() - created.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});
// Virtual for processing time
PaymentSchema.virtual('processingTime').get(function () {
    if (!this.paidAt || !this.attemptedAt)
        return null;
    const processTime = this.paidAt.getTime() - this.attemptedAt.getTime();
    return Math.floor(processTime / 1000); // in seconds
});
// Virtual for effective amount (after fees and refunds)
PaymentSchema.virtual('effectiveAmount').get(function () {
    return (this.amountReceived || 0) - (this.stripeFee || 0) - (this.applicationFee || 0) - (this.refundAmount || 0);
});
// Pre-save middleware
PaymentSchema.pre('save', function (next) {
    // Calculate net amount
    if ((this.amountReceived || 0) > 0) {
        this.netAmount = (this.amountReceived || 0) - (this.stripeFee || 0) - (this.applicationFee || 0);
    }
    // Set paid date when status changes to succeeded
    if (this.isModified('status') && this.status === index_js_1.PaymentStatus.SUCCEEDED && !this.paidAt) {
        this.paidAt = new Date();
    }
    // Set failed date when status changes to failed
    if (this.isModified('status') && this.status === index_js_1.PaymentStatus.FAILED && !this.failedAt) {
        this.failedAt = new Date();
    }
    // Auto-set risk level based on risk score
    if (this.riskScore !== undefined) {
        if ((this.riskScore || 0) >= 80)
            this.riskLevel = 'critical';
        else if ((this.riskScore || 0) >= 60)
            this.riskLevel = 'high';
        else if ((this.riskScore || 0) >= 40)
            this.riskLevel = 'medium';
        else
            this.riskLevel = 'low';
    }
    next();
});
// Static method to get payment analytics
PaymentSchema.statics.getAnalytics = function (dateRange, userId) {
    const matchStage = {};
    if (dateRange) {
        matchStage.createdAt = {
            $gte: dateRange.start,
            $lte: dateRange.end
        };
    }
    if (userId) {
        matchStage.userId = new mongoose_1.default.Types.ObjectId(userId);
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
PaymentSchema.statics.getRetryablePayments = function () {
    const now = new Date();
    return this.find({
        status: index_js_1.PaymentStatus.FAILED,
        retryAttempts: { $lt: 3 }, // Use hardcoded value instead of this.maxRetryAttempts
        nextRetryAt: { $lte: now }
    }).populate('userId', 'email firstName lastName')
        .populate('subscriptionId');
};
// Static method to get fraud alerts
PaymentSchema.statics.getFraudAlerts = function () {
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
PaymentSchema.methods.markAsSucceeded = function (chargeId, amountReceived, fees = {}) {
    this.status = index_js_1.PaymentStatus.SUCCEEDED;
    this.stripeChargeId = chargeId;
    this.amountReceived = amountReceived;
    this.stripeFee = fees.stripeFee || 0;
    this.applicationFee = fees.applicationFee || 0;
    this.paidAt = new Date();
    return this.save();
};
// Instance method to mark as failed
PaymentSchema.methods.markAsFailed = function (failureCode, failureMessage, failureReason) {
    this.status = index_js_1.PaymentStatus.FAILED;
    this.failureCode = failureCode;
    this.failureMessage = failureMessage;
    this.failureReason = failureReason;
    this.failedAt = new Date();
    // Add to retry history
    if (!this.retryHistory)
        this.retryHistory = [];
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
PaymentSchema.methods.processRefund = function (refundAmount, reason) {
    this.refundAmount = (this.refundAmount || 0) + refundAmount;
    this.refundReason = reason;
    this.refundStatus = 'pending';
    this.refundedAt = new Date();
    // If fully refunded, update status
    if ((this.refundAmount || 0) >= (this.amountReceived || 0)) {
        this.status = index_js_1.PaymentStatus.CANCELED;
    }
    return this.save();
};
// Instance method to flag for fraud
PaymentSchema.methods.flagForFraud = function (reason) {
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
PaymentSchema.methods.approveAfterReview = function () {
    if (this.fraudDetection) {
        this.fraudDetection.reviewStatus = 'approved';
        this.fraudDetection.flagged = false;
    }
    return this.save();
};
// Instance method to add webhook event
PaymentSchema.methods.addWebhookEvent = function (eventType, eventId) {
    if (!this.webhookEvents)
        this.webhookEvents = [];
    this.webhookEvents.push({
        eventType,
        eventId,
        receivedAt: new Date(),
        processed: false
    });
    return this.save();
};
exports.Payment = mongoose_1.default.model('Payment', PaymentSchema);
