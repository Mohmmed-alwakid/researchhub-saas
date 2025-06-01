import mongoose, { Schema, Document } from 'mongoose';
import type { IStudy } from '../../shared/types/index.js';

export interface IStudyDocument extends Omit<IStudy, '_id'>, Document {}

const StudyConfigurationSchema = new Schema({
  duration: {
    type: Number,
    required: true,
    min: [5, 'Study duration must be at least 5 minutes'],
    max: [480, 'Study duration cannot exceed 8 hours']
  },
  compensation: {
    type: Number,
    required: true,
    min: [0, 'Compensation cannot be negative']
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: [1, 'Must allow at least 1 participant'],
    max: [1000, 'Cannot exceed 1000 participants']
  },
  participantCriteria: {
    minAge: { type: Number, min: 13, max: 100 },
    maxAge: { type: Number, min: 13, max: 100 },
    location: [{ type: String }],
    devices: [{
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    }],
    customScreening: [{
      id: String,
      question: String,
      type: {
        type: String,
        enum: ['text', 'multiple-choice', 'boolean', 'number']
      },
      options: [String],
      required: Boolean,
      disqualifyAnswers: [String]
    }]
  },
  recordingOptions: {
    screen: { type: Boolean, default: true },
    audio: { type: Boolean, default: false },
    webcam: { type: Boolean, default: false },
    clicks: { type: Boolean, default: true },
    scrolls: { type: Boolean, default: true },
    keystrokes: { type: Boolean, default: false }
  },
  instructions: String,
  thankYouMessage: String
});

const StudyParticipantsSchema = new Schema({
  target: { type: Number, required: true },
  enrolled: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  active: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  qualified: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  disqualified: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const StudyAnalyticsSchema = new Schema({
  avgCompletionTime: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 },
  dropoffRate: { type: Number, default: 0 },
  satisfactionScore: { type: Number, default: 0 },
  completionsByDevice: {
    type: Map,
    of: Number,
    default: new Map()
  },
  demographicBreakdown: {
    type: Map,
    of: Number,
    default: new Map()
  }
});

const StudySchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Study title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Study description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },  researcher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  team: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  type: {
    type: String,
    enum: ['usability', 'survey', 'interview', 'card-sorting', 'a-b-testing'],
    required: [true, 'Study type is required']
  },  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  },
  recruitmentStatus: {
    type: String,
    enum: ['not_recruiting', 'recruiting', 'recruitment_closed'],
    default: 'not_recruiting'
  },
  configuration: {
    type: StudyConfigurationSchema,
    required: true  },
  settings: {
    maxParticipants: Number,
    duration: Number,
    compensation: Number
  },
  publishedAt: Date,
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  participants: {
    type: StudyParticipantsSchema,
    default: () => ({
      target: 0,
      enrolled: 0,
      completed: 0,
      active: [],
      qualified: [],
      disqualified: []
    })
  },
  analytics: {
    type: StudyAnalyticsSchema,
    default: () => ({
      avgCompletionTime: 0,
      successRate: 0,
      dropoffRate: 0,
      satisfactionScore: 0,
      completionsByDevice: new Map(),
      demographicBreakdown: new Map()
    })
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
StudySchema.index({ researcher: 1, status: 1 });
StudySchema.index({ status: 1, createdAt: -1 });
StudySchema.index({ type: 1 });

// Pre-save middleware to sync researcher and createdBy
StudySchema.pre('save', function(this: IStudyDocument) {
  if (this.researcher && !this.createdBy) {
    this.createdBy = this.researcher;
  }
  if (this.createdBy && !this.researcher) {
    this.researcher = this.createdBy;
  }
});

// Virtual for completion rate
StudySchema.virtual('completionRate').get(function(this: IStudyDocument) {
  if (this.participants.enrolled === 0) return 0;
  return (this.participants.completed / this.participants.enrolled) * 100;
});

// Virtual for enrollment rate
StudySchema.virtual('enrollmentRate').get(function(this: IStudyDocument) {
  if (this.participants.target === 0) return 0;
  return (this.participants.enrolled / this.participants.target) * 100;
});

export const Study = mongoose.model<IStudyDocument>('Study', StudySchema);
