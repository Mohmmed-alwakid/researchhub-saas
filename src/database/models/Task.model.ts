import mongoose, { Schema, Document } from 'mongoose';
import type { ITask } from '../../shared/types/index.js';

export interface ITaskDocument extends Omit<ITask, '_id' | 'studyId'>, Document {
  _id: mongoose.Types.ObjectId;
  studyId: mongoose.Types.ObjectId;
  // Additional properties not in base interface but used by controllers
  updatedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
}

const TaskSchema: Schema = new Schema({
  studyId: {
    type: Schema.Types.ObjectId,
    ref: 'Study',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },  type: {
    type: String,
    enum: ['navigation', 'interaction', 'questionnaire', 'prototype-test'],
    required: true
  },
  instructions: {
    type: String,
    required: true,
    maxlength: 5000
  },
  expectedDuration: {
    type: Number,
    required: true,
    min: 1,
    max: 3600 // 1 hour max
  },
  successCriteria: [{
    description: {
      type: String,
      required: true,
      maxlength: 500
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  targetUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
  },
  order: {
    type: Number,
    required: true,
    min: 0
  },  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'paused', 'cancelled'],
    default: 'draft'
  },
  metadata: {
    estimatedCompletionRate: {
      type: Number,
      min: 0,
      max: 100
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    },
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
TaskSchema.index({ studyId: 1, order: 1 });
TaskSchema.index({ studyId: 1, status: 1 });
TaskSchema.index({ type: 1, status: 1 });

// Virtual for task completion stats
TaskSchema.virtual('completionStats', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'taskId',
  options: { 
    match: { status: 'completed' }
  }
});

// Pre-save middleware to ensure order is unique within study
TaskSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('order')) {
    const TaskModel = this.constructor as mongoose.Model<ITaskDocument>;
    const existingTask = await TaskModel.findOne({
      studyId: this.studyId,
      order: this.order,
      _id: { $ne: this._id }
    });
    
    if (existingTask) {
      const error = new Error('Task order must be unique within study');
      return next(error);
    }
  }
  next();
});

// Static method to get tasks by study with ordering
TaskSchema.statics.getByStudy = function(studyId: string) {
  return this.find({ studyId }).sort({ order: 1 });
};

// Instance method to check if task can be started
TaskSchema.methods.canBeStarted = function() {
  return this.status === 'active';
};

// Instance method to get next task in sequence
TaskSchema.methods.getNextTask = async function() {
  const TaskModel = this.constructor as mongoose.Model<ITaskDocument>;
  return TaskModel.findOne({
    studyId: this.studyId,
    order: { $gt: this.order },
    status: 'active'
  }).sort({ order: 1 });
};

export const Task = mongoose.model<ITaskDocument>('Task', TaskSchema);
