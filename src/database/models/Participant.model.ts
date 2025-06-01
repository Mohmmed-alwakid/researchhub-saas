import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipantDocument extends Document {
  _id: mongoose.Types.ObjectId;
  studyId: mongoose.Types.ObjectId;
  researcherId: mongoose.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  demographics?: Record<string, unknown>;
  status: 'invited' | 'accepted' | 'declined' | 'completed' | 'no_show';
  invitedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  notes?: string;
  sessions?: mongoose.Types.ObjectId[];
  compensation?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema: Schema<IParticipantDocument> = new Schema({
  studyId: {
    type: Schema.Types.ObjectId,
    ref: 'Study',
    required: true,
    index: true
  },
  researcherId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  demographics: {
    type: Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['invited', 'accepted', 'declined', 'completed', 'no_show'],
    default: 'invited',
    index: true
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  sessions: [{
    type: Schema.Types.ObjectId,
    ref: 'Session'
  }],
  compensation: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ParticipantSchema.index({ studyId: 1, email: 1 }, { unique: true });
ParticipantSchema.index({ researcherId: 1, status: 1 });
ParticipantSchema.index({ createdAt: -1 });

// Virtual for full name
ParticipantSchema.virtual('fullName').get(function(this: IParticipantDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for session count
ParticipantSchema.virtual('sessionCount').get(function(this: IParticipantDocument) {
  return this.sessions?.length || 0;
});

// Pre-save middleware
ParticipantSchema.pre('save', function(this: IParticipantDocument, next) {
  if (this.isModified('status')) {
    switch (this.status) {
      case 'accepted':
        if (!this.acceptedAt) this.acceptedAt = new Date();
        break;
      case 'completed':
        if (!this.completedAt) this.completedAt = new Date();
        break;
    }
  }
  next();
});

// Instance methods
ParticipantSchema.methods.markAccepted = function(this: IParticipantDocument) {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  return this.save();
};

ParticipantSchema.methods.markCompleted = function(this: IParticipantDocument) {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

ParticipantSchema.methods.addSession = function(this: IParticipantDocument, sessionId: mongoose.Types.ObjectId) {
  if (!this.sessions) this.sessions = [];
  if (!this.sessions.includes(sessionId)) {
    this.sessions.push(sessionId);
  }
  return this.save();
};

// Static methods
ParticipantSchema.statics.findByStudy = function(studyId: string | mongoose.Types.ObjectId) {
  return this.find({ studyId }).populate('studyId', 'title').sort({ createdAt: -1 });
};

ParticipantSchema.statics.getStatsByResearcher = function(researcherId: string | mongoose.Types.ObjectId) {
  return this.aggregate([
    { $match: { researcherId: new mongoose.Types.ObjectId(researcherId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

export const Participant = mongoose.model<IParticipantDocument>('Participant', ParticipantSchema);
