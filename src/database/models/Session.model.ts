import mongoose, { Schema, Document } from 'mongoose';
import type { ISession } from '../../shared/types/index.js';

export interface ISessionDocument extends Omit<ISession, '_id' | 'studyId' | 'participantId' | 'taskCompletions'>, Document {
  _id: mongoose.Types.ObjectId;
  studyId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  // Override taskCompletions to use ObjectId for taskId
  taskCompletions: Array<{
    taskId: mongoose.Types.ObjectId;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
    status: 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'failed';
    successCriteriaMet?: Array<{
      criteriaId: string;
      met: boolean;
      notes?: string;
    }>;
    errorCount?: number;
    clickCount?: number;
    scrollDistance?: number;
    notes?: string;
  }>;
  mouseEvents?: Array<{
    type: string;
    timestamp: Date;
    x?: number;
    y?: number;
    target?: string;
    data?: unknown;
  }>;
  keyboardEvents?: Array<{
    timestamp: Date;
    key?: string;
    target?: string;
  }>;
  performanceMetrics?: {
    loadTime?: number;
    errorCount?: number;
    completionRate?: number;
    userSatisfactionScore?: number;
  };
  startedAt?: Date;
  completedAt?: Date;
  currentPeriodEnd?: Date;
  trialEnd?: Date;
  plan?: string;
  addOns?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  totalDiscount?: number;
  renewalAmount?: number;
  features?: Array<{
    name: string;
    enabled: boolean;
  }>;
}

const TaskCompletionSchema: Schema = new Schema({
  taskId: {
    type: String,
    ref: 'Task',
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: Date,
  duration: Number, // in seconds
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'skipped', 'failed'],
    default: 'not_started'
  },
  successCriteriaMet: [{
    criteriaId: String,
    met: Boolean,
    notes: String
  }],
  errorCount: {
    type: Number,
    default: 0
  },
  clickCount: {
    type: Number,
    default: 0
  },
  scrollDistance: {
    type: Number,
    default: 0
  },
  notes: String
}, { _id: false });

const SessionSchema: Schema<ISessionDocument> = new Schema({  studyId: {
    type: Schema.Types.ObjectId,
    ref: 'Study',
    required: true,
    index: true
  },
  participantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  scheduledAt: Date,
  startedAt: Date,
  completedAt: Date,
  duration: Number, // Total session duration in seconds
  
  // Task progress tracking
  taskCompletions: [TaskCompletionSchema],
  currentTaskIndex: {
    type: Number,
    default: 0
  },
  
  // Recording information
  recordingId: {
    type: String,
    index: true
  },
  recordingUrl: String,
  recordingStartedAt: Date,
  recordingEndedAt: Date,
  recordingSize: Number, // in bytes
  
  // Browser and device info
  browserInfo: {
    userAgent: String,
    viewport: {
      width: Number,
      height: Number
    },
    platform: String,
    language: String
  },
  
  // Interaction data
  mouseEvents: [{
    type: String, // click, move, scroll
    timestamp: Date,
    x: Number,
    y: Number,
    target: String,
    data: Schema.Types.Mixed
  }],
  keyboardEvents: [{
    timestamp: Date,
    key: String,
    target: String
  }],
  
  // Performance metrics
  performanceMetrics: {
    loadTime: Number,
    errorCount: Number,
    completionRate: Number,
    userSatisfactionScore: Number
  },
  
  // Feedback and notes
  participantFeedback: {
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    usabilityScore: Number,
    recommendationScore: Number
  },
  researcherNotes: String,
  
  // Technical data
  ipAddress: String,
  connectionQuality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor']
  },
  
  // Metadata
  metadata: {
    source: String, // recruitment source
    compensation: {
      amount: Number,
      currency: String,
      status: {
        type: String,
        enum: ['pending', 'processing', 'paid', 'failed'],
        default: 'pending'
      }
    },
    flags: [String], // for marking special conditions
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
SessionSchema.index({ studyId: 1, status: 1 });
SessionSchema.index({ participantId: 1, createdAt: -1 });
SessionSchema.index({ sessionToken: 1 }, { unique: true });
SessionSchema.index({ recordingId: 1 });
SessionSchema.index({ 'metadata.compensation.status': 1 });

// Virtual for session completion percentage
SessionSchema.virtual('completionPercentage').get(function() {
  if (!this.taskCompletions || this.taskCompletions.length === 0) return 0;
  
  const completedTasks = this.taskCompletions.filter(
    task => task.status === 'completed'
  ).length;
  
  return Math.round((completedTasks / this.taskCompletions.length) * 100);
});

// Virtual for total interaction events
SessionSchema.virtual('totalInteractions').get(function() {
  const mouseEvents = this.mouseEvents?.length || 0;
  const keyboardEvents = this.keyboardEvents?.length || 0;
  return mouseEvents + keyboardEvents;
});

// Pre-save middleware to calculate duration
SessionSchema.pre('save', function(next) {
  if (this.startedAt && this.completedAt) {
    this.duration = Math.floor(
      (this.completedAt.getTime() - this.startedAt.getTime()) / 1000
    );
  }
  
  // Update performance metrics
  if (this.taskCompletions && this.taskCompletions.length > 0) {
    const completedTasks = this.taskCompletions.filter(
      task => task.status === 'completed'
    ).length;
    
    this.performanceMetrics = {
      ...this.performanceMetrics,
      completionRate: (completedTasks / this.taskCompletions.length) * 100,
      errorCount: this.taskCompletions.reduce((sum, task) => sum + (task.errorCount || 0), 0)
    };
  }
  
  next();
});

// Static method to get sessions by study with analytics
SessionSchema.statics.getStudyAnalytics = function(studyId: string) {
  return this.aggregate([
    { $match: { studyId: new mongoose.Types.ObjectId(studyId) } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageDuration: { $avg: '$duration' },
        averageCompletionRate: { $avg: '$performanceMetrics.completionRate' },
        averageSatisfaction: { $avg: '$participantFeedback.overallRating' }
      }
    }
  ]);
};

// Instance method to start session
SessionSchema.methods.startSession = function() {
  this.status = 'in_progress';
  this.startedAt = new Date();
  return this.save();
};

// Instance method to complete session
SessionSchema.methods.completeSession = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Instance method to add mouse event
SessionSchema.methods.addMouseEvent = function(event: any) {
  if (!this.mouseEvents) this.mouseEvents = [];
  this.mouseEvents.push({
    ...event,
    timestamp: new Date()
  });
};

// Instance method to add keyboard event
SessionSchema.methods.addKeyboardEvent = function(event: any) {
  if (!this.keyboardEvents) this.keyboardEvents = [];
  this.keyboardEvents.push({
    ...event,
    timestamp: new Date()
  });
};

export const Session = mongoose.model<ISessionDocument>('Session', SessionSchema);
