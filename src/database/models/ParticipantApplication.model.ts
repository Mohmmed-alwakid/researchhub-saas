import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipantApplication {
  _id: string;
  studyId: string;
  participantId: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  screeningResponses: Array<{
    questionId: string;
    question: string;
    answer: string;
  }>;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface IParticipantApplicationDocument extends Omit<IParticipantApplication, '_id'>, Document {}

const ParticipantApplicationSchema: Schema = new Schema({
  studyId: {
    type: Schema.Types.ObjectId,
    ref: 'Study',
    required: true
  },
  participantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  screeningResponses: [{
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ParticipantApplicationSchema.index({ studyId: 1, status: 1 });
ParticipantApplicationSchema.index({ participantId: 1, appliedAt: -1 });
ParticipantApplicationSchema.index({ studyId: 1, participantId: 1 }, { unique: true }); // One application per participant per study

export const ParticipantApplication = mongoose.model<IParticipantApplicationDocument>('ParticipantApplication', ParticipantApplicationSchema);
