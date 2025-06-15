import mongoose, { Document, Schema } from 'mongoose';

export interface IUserCredits extends Document {
  userId: mongoose.Types.ObjectId;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  planType: 'basic' | 'pro' | 'enterprise' | 'custom';
  planStartDate: Date;
  planEndDate: Date;
  isActive: boolean;
  features: {
    maxStudies: number;
    maxParticipants: number;
    maxRecordingMinutes: number;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
  };
  paymentHistory: Array<{
    paymentRequestId: mongoose.Types.ObjectId;
    creditsAdded: number;
    addedAt: Date;
    addedBy: mongoose.Types.ObjectId;
  }>;
  lastUpdated: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const UserCreditsSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  totalCredits: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  usedCredits: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  availableCredits: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  planType: {
    type: String,
    enum: ['basic', 'pro', 'enterprise', 'custom'],
    required: true,
    default: 'basic'
  },
  planStartDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  planEndDate: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  features: {
    maxStudies: {
      type: Number,
      required: true,
      default: 5
    },
    maxParticipants: {
      type: Number,
      required: true,
      default: 100
    },
    maxRecordingMinutes: {
      type: Number,
      required: true,
      default: 500
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    customBranding: {
      type: Boolean,
      default: false
    }
  },
  paymentHistory: [{
    paymentRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentRequest',
      required: true
    },
    creditsAdded: {
      type: Number,
      required: true,
      min: 0
    },
    addedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for calculating available credits
UserCreditsSchema.virtual('calculatedAvailableCredits').get(function(this: IUserCredits) {
  return Math.max(0, this.totalCredits - this.usedCredits);
});

// Update availableCredits before saving
UserCreditsSchema.pre('save', function(this: IUserCredits, next) {
  this.availableCredits = Math.max(0, this.totalCredits - this.usedCredits);
  this.lastUpdated = new Date();
  next();
});

// Indexes for efficient queries
UserCreditsSchema.index({ userId: 1 });
UserCreditsSchema.index({ isActive: 1, planEndDate: 1 });
UserCreditsSchema.index({ planType: 1 });

// Methods for credit management
UserCreditsSchema.methods.addCredits = function(credits: number, paymentRequestId: mongoose.Types.ObjectId, addedBy: mongoose.Types.ObjectId) {
  this.totalCredits += credits;
  this.paymentHistory.push({
    paymentRequestId,
    creditsAdded: credits,
    addedAt: new Date(),
    addedBy
  });
  this.lastUpdated = new Date();
  this.updatedBy = addedBy;
  return this.save();
};

UserCreditsSchema.methods.useCredits = function(credits: number) {
  if (this.availableCredits >= credits) {
    this.usedCredits += credits;
    this.lastUpdated = new Date();
    return this.save();
  }
  throw new Error('Insufficient credits');
};

UserCreditsSchema.methods.isExpired = function() {
  return new Date() > this.planEndDate;
};

export const UserCredits = mongoose.model<IUserCredits>('UserCredits', UserCreditsSchema);
