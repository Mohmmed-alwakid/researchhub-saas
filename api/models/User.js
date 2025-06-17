// User model for MongoDB
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['researcher', 'participant', 'admin', 'super_admin'],
    default: 'researcher'
  },
  avatar: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    userAgent: String,
    ipAddress: String
  }],
  lastLoginAt: Date,
  loginCount: { type: Number, default: 0 },
  organization: String,
  profile: Object,
  subscription: Object,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  isEmailVerified: { type: Boolean, default: false },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  stripeCustomerId: String,
  apiKeys: [{
    key: String,
    name: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    lastUsed: Date
  }],
  name: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export default mongoose.models.User || mongoose.model('User', userSchema);
