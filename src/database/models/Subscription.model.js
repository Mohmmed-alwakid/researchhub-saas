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
exports.Subscription = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const index_js_1 = require("../../shared/types/index.js");
const UsageLimitsSchema = new mongoose_1.Schema({
    studies: Number,
    participants: Number,
    recordings: Number,
    storage: Number, // in GB
    collaborators: Number,
    apiCalls: Number
}, { _id: false });
const UsageStatsSchema = new mongoose_1.Schema({
    studies: { type: Number, default: 0 },
    participants: { type: Number, default: 0 },
    recordings: { type: Number, default: 0 },
    storage: { type: Number, default: 0 }, // in GB
    collaborators: { type: Number, default: 0 },
    apiCalls: { type: Number, default: 0 },
    lastResetAt: { type: Date, default: Date.now }
}, { _id: false });
const SubscriptionSchema = new mongoose_1.Schema({ userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Plan details
    plan: {
        type: String,
        enum: Object.values(index_js_1.SubscriptionPlan),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(index_js_1.SubscriptionStatus),
        default: index_js_1.SubscriptionStatus.ACTIVE
    },
    // Stripe information
    stripeCustomerId: {
        type: String,
        required: true
    },
    stripeSubscriptionId: {
        type: String,
        required: true,
        unique: true
    },
    stripePriceId: {
        type: String,
        required: true
    },
    stripeProductId: {
        type: String,
        required: true
    },
    // Billing information
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'usd',
        uppercase: true
    },
    // Subscription timing
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: Date,
    currentPeriodStart: {
        type: Date,
        required: true
    },
    currentPeriodEnd: {
        type: Date,
        required: true
    },
    // Trial information
    trialStart: Date,
    trialEnd: Date,
    isTrialActive: {
        type: Boolean,
        default: false
    },
    trialDaysUsed: {
        type: Number,
        default: 0
    },
    // Usage tracking
    usageLimits: {
        type: UsageLimitsSchema,
        required: true
    },
    currentUsage: {
        type: UsageStatsSchema,
        default: () => ({})
    },
    usageHistory: [{
            period: {
                start: Date,
                end: Date
            },
            usage: UsageStatsSchema
        }],
    // Features and add-ons
    features: [{
            name: String,
            enabled: Boolean,
            metadata: mongoose_1.Schema.Types.Mixed
        }],
    addOns: [{
            name: String,
            stripePriceId: String,
            amount: Number,
            quantity: Number,
            enabled: Boolean
        }],
    // Cancellation and changes
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },
    cancelledAt: Date,
    cancellationReason: String,
    // Renewal and changes
    renewalDate: Date,
    renewalAmount: Number,
    pendingChanges: {
        newPlan: String,
        newAmount: Number,
        effectiveDate: Date,
        changeReason: String
    },
    // Discounts and coupons
    discountCoupon: {
        couponId: String,
        percentOff: Number,
        amountOff: Number,
        validUntil: Date,
        redeemedAt: Date
    },
    totalDiscount: {
        type: Number,
        default: 0
    },
    // Payment history reference
    lastPaymentDate: Date,
    lastPaymentAmount: Number,
    nextPaymentDate: Date,
    paymentFailureCount: {
        type: Number,
        default: 0
    },
    // Metadata and tracking
    metadata: {
        source: String, // signup source
        campaignId: String,
        referralCode: String,
        notes: String,
        tags: [String],
        customAttributes: mongoose_1.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Indexes for performance
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ stripeCustomerId: 1 });
SubscriptionSchema.index({ status: 1, plan: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });
SubscriptionSchema.index({ renewalDate: 1 });
SubscriptionSchema.index({ 'metadata.source': 1 });
// Virtual for days remaining in current period
SubscriptionSchema.virtual('daysRemaining').get(function () {
    if (!this.currentPeriodEnd)
        return 0;
    const now = new Date();
    const endValue = this.currentPeriodEnd;
    const end = typeof endValue === 'number'
        ? new Date(endValue * 1000)
        : endValue instanceof Date
            ? endValue
            : new Date(endValue);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
});
// Virtual for trial days remaining
SubscriptionSchema.virtual('trialDaysRemaining').get(function () {
    if (!this.isTrialActive || !this.trialEnd)
        return 0;
    const now = new Date();
    const endValue = this.trialEnd;
    const end = typeof endValue === 'number'
        ? new Date(endValue * 1000)
        : endValue instanceof Date
            ? endValue
            : new Date(endValue);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
});
// Virtual for usage percentage
SubscriptionSchema.virtual('usagePercentage').get(function () {
    if (!this.usageLimits || !this.currentUsage)
        return {};
    const percentages = {};
    for (const [key, limit] of Object.entries(this.usageLimits)) {
        if (typeof limit === 'number' && limit > 0) {
            const usage = this.currentUsage[key] || 0;
            percentages[key] = Math.round((Number(usage) / limit) * 100);
        }
    }
    return percentages;
});
// Virtual for plan features
SubscriptionSchema.virtual('planFeatures').get(function () {
    const planFeatures = {
        [index_js_1.SubscriptionPlan.FREE]: {
            studies: 1,
            participants: 50,
            recordings: 10,
            storage: 1,
            collaborators: 1,
            apiCalls: 1000,
            features: ['basic_analytics', 'screen_recording']
        },
        [index_js_1.SubscriptionPlan.BASIC]: {
            studies: 5,
            participants: 500,
            recordings: 100,
            storage: 10,
            collaborators: 3,
            apiCalls: 10000,
            features: ['advanced_analytics', 'heatmaps', 'screen_recording', 'exports']
        },
        [index_js_1.SubscriptionPlan.PRO]: {
            studies: 25,
            participants: 2500,
            recordings: 1000,
            storage: 100,
            collaborators: 10,
            apiCalls: 50000,
            features: ['all_analytics', 'white_label', 'api_access', 'priority_support']
        },
        [index_js_1.SubscriptionPlan.ENTERPRISE]: {
            studies: -1, // unlimited
            participants: -1,
            recordings: -1,
            storage: 1000,
            collaborators: -1,
            apiCalls: -1,
            features: ['custom_integrations', 'dedicated_support', 'sso', 'custom_branding']
        }
    };
    return planFeatures[this.plan] || planFeatures[index_js_1.SubscriptionPlan.FREE];
});
// Pre-save middleware
SubscriptionSchema.pre('save', function (next) {
    // Set usage limits based on plan
    if (this.isNew || this.isModified('plan')) {
        const planFeatures = this.planFeatures;
        this.usageLimits = {
            studies: planFeatures.studies,
            participants: planFeatures.participants,
            recordings: planFeatures.recordings,
            storage: planFeatures.storage,
            collaborators: planFeatures.collaborators,
            apiCalls: planFeatures.apiCalls
        };
    }
    // Update renewal date
    if (this.currentPeriodEnd) {
        this.renewalDate = this.currentPeriodEnd;
    } // Calculate next payment amount including add-ons
    let totalAmount = this.amount || 0;
    if (this.addOns && Array.isArray(this.addOns)) {
        totalAmount += this.addOns.reduce((sum, addon) => {
            return sum + (addon.enabled ? (addon.amount || 0) * (addon.quantity || 1) : 0);
        }, 0);
    }
    this.renewalAmount = totalAmount - (this.totalDiscount || 0);
    next();
});
// Static method to get subscription analytics
SubscriptionSchema.statics.getAnalytics = function (dateRange) {
    const matchStage = {};
    if (dateRange) {
        matchStage.createdAt = {
            $gte: dateRange.start,
            $lte: dateRange.end
        };
    }
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalSubscriptions: { $sum: 1 },
                activeSubscriptions: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                totalRevenue: { $sum: '$amount' },
                averageRevenue: { $avg: '$amount' },
                planDistribution: {
                    $push: '$plan'
                },
                trialConversions: {
                    $sum: { $cond: [{ $and: ['$isTrialActive', { $eq: ['$status', 'active'] }] }, 1, 0] }
                }
            }
        }
    ]);
};
// Static method to get expiring subscriptions
SubscriptionSchema.statics.getExpiring = function (days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return this.find({
        status: index_js_1.SubscriptionStatus.ACTIVE,
        currentPeriodEnd: { $lte: futureDate },
        cancelAtPeriodEnd: false
    }).populate('userId', 'email firstName lastName');
};
// Instance method to check if feature is available
SubscriptionSchema.methods.hasFeature = function (featureName) {
    const planFeatures = this.planFeatures;
    // Check plan features
    if (planFeatures.features.includes(featureName)) {
        return true;
    }
    // Check custom features
    if (this.features && Array.isArray(this.features)) {
        const customFeature = this.features.find((f) => f.name === featureName);
        return customFeature?.enabled || false;
    }
    return false;
};
// Instance method to check usage limits
SubscriptionSchema.methods.checkUsageLimit = function (limitType) {
    const limit = this.usageLimits[limitType];
    const current = this.currentUsage[limitType] || 0;
    if (limit === -1) { // Unlimited
        return { allowed: true, remaining: -1, percentage: 0 };
    }
    const remaining = Math.max(0, limit - current);
    const percentage = limit > 0 ? Math.round((current / limit) * 100) : 0;
    return {
        allowed: current < limit,
        remaining,
        percentage
    };
};
// Instance method to increment usage
SubscriptionSchema.methods.incrementUsage = function (usageType, amount = 1) {
    if (!this.currentUsage) {
        this.currentUsage = {};
    }
    const current = this.currentUsage[usageType] || 0;
    this.currentUsage[usageType] = current + amount;
    return this.save();
};
// Instance method to reset usage for new billing period
SubscriptionSchema.methods.resetUsage = function () {
    // Archive current usage
    if (this.currentUsage) {
        if (!this.usageHistory)
            this.usageHistory = [];
        this.usageHistory.push({
            period: {
                start: this.currentPeriodStart,
                end: this.currentPeriodEnd
            },
            usage: { ...this.currentUsage }
        });
    }
    // Reset current usage
    this.currentUsage = {
        studies: 0,
        participants: 0,
        recordings: 0,
        storage: 0,
        collaborators: 0,
        apiCalls: 0,
        lastResetAt: new Date()
    };
    return this.save();
};
// Instance method to cancel subscription
SubscriptionSchema.methods.cancel = function (reason, immediate = false) {
    if (immediate) {
        this.status = index_js_1.SubscriptionStatus.CANCELED;
        this.cancelledAt = new Date();
        this.endDate = new Date();
    }
    else {
        this.cancelAtPeriodEnd = true;
    }
    if (reason) {
        this.cancellationReason = reason;
    }
    return this.save();
};
// Instance method to reactivate subscription
SubscriptionSchema.methods.reactivate = function () {
    this.status = index_js_1.SubscriptionStatus.ACTIVE;
    this.cancelAtPeriodEnd = false;
    this.cancelledAt = undefined;
    this.cancellationReason = undefined;
    this.endDate = undefined;
    return this.save();
};
exports.Subscription = mongoose_1.default.model('Subscription', SubscriptionSchema);
