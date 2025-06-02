import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUserDocument extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'researcher' | 'participant' | 'admin' | 'super_admin';
  avatar?: string;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  status: 'active' | 'inactive' | 'pending';
  refreshTokens?: Array<{
    token: string;
    createdAt: Date;
    userAgent: string;
    ipAddress: string;
  }>;
  lastLoginAt?: Date;
  loginCount?: number;  organization?: string;
  profile?: object;
  subscription?: object;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  isEmailVerified?: boolean;
  passwordChangedAt?: Date;  passwordResetToken?: string;
  passwordResetExpires?: Date;
  stripeCustomerId?: string;
  apiKeys?: Array<{
    key: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    lastUsed?: Date;
  }>;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  matchPassword(enteredPassword: string): Promise<boolean>;
  comparePassword(enteredPassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

const UserSchema: Schema = new Schema({  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },  role: {
    type: String,
    enum: ['researcher', 'participant', 'admin', 'super_admin'],
    default: 'participant'
  },
  avatar: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  refreshTokens: [{
    token: String,
    createdAt: Date,
    userAgent: String,
    ipAddress: String
  }],
  lastLoginAt: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  organization: String,
  profile: Schema.Types.Mixed,
  subscription: Schema.Types.Mixed,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  isEmailVerified: {
    type: Boolean,
    default: false
  },  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  stripeCustomerId: String,
  apiKeys: [{
    key: String,
    name: String,
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date
  }],
  name: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ role: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: IUserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Alias for matchPassword for compatibility
UserSchema.methods.comparePassword = async function(enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function(): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  return jwt.sign(
    { 
      id: this._id.toString(), 
      email: this.email, 
      role: this.role 
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
  );
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = function(): string {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key';
  return jwt.sign(
    { id: this._id.toString() },
    refreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' } as jwt.SignOptions
  );
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
