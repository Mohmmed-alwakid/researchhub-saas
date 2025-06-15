import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentRequest extends Document {
  userId: mongoose.Types.ObjectId;
  planType: 'basic' | 'pro' | 'enterprise';
  amount: number;
  currency: 'SAR' | 'USD';
  paymentMethod: 'bank_transfer' | 'local_payment';
  paymentProof?: string;
  status: 'pending' | 'verified' | 'rejected';
  referenceNumber: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    iban?: string;
  };
  adminNotes?: string;
  createdAt: Date;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
}

const PaymentRequestSchema: Schema = new Schema({  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // index: true - removed to avoid duplicate with compound index below
  },
  planType: {
    type: String,
    enum: ['basic', 'pro', 'enterprise'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['SAR', 'USD'],
    required: true,
    default: 'SAR'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'local_payment'],
    required: true,
    default: 'bank_transfer'
  },
  paymentProof: {
    type: String, // File path or URL to uploaded receipt
    required: false
  },  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
    // index: true - removed to avoid duplicate with compound index below
  },  referenceNumber: {
    type: String,
    required: true,
    unique: true
    // index: true - removed to avoid duplicate with single field index below
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    iban: String
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
PaymentRequestSchema.index({ userId: 1, status: 1 });
PaymentRequestSchema.index({ status: 1, createdAt: -1 });
// Note: referenceNumber has unique: true in schema, so no need for separate index

// Generate unique reference number before saving
PaymentRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.referenceNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.referenceNumber = `PAY-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

export const PaymentRequest = mongoose.model<IPaymentRequest>('PaymentRequest', PaymentRequestSchema);
