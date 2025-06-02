import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';
import type { IRecording } from '../../shared/types/index.js';
import { RecordingQuality, RecordingStatus } from '../../shared/types/index.js';

export interface IRecordingDocument extends Omit<IRecording, '_id' | 'sessionId' | 'studyId' | 'participantId'>, Document {
  _id: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  studyId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  lastAccessedAt?: Date;  // Additional properties not in base interface
  analytics?: {
    viewCount?: number;
    averageViewDuration?: number;
    heatmapData?: Record<string, unknown>;
    insights?: Array<{
      type?: string;
      value?: unknown;
      timestamp?: Date;
      confidence?: number;
    }>;
  };
  transcription?: {
    text?: string;
    confidence?: number;
    language?: string;
    segments?: Array<{
      start?: number;
      end?: number;
      text?: string;
      confidence?: number;
    }>;
  };
  compressionRatio?: number;
  processingLog?: Array<{
    step?: string;
    status?: string;
    startedAt?: Date;
    completedAt?: Date;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  }>;
  metadata?: {
    originalFormat?: string;
    codec?: string;
    bitrate?: number;
    frameRate?: number;
    uploadSource?: string;
    deviceInfo?: Record<string, unknown>;
    browserInfo?: Record<string, unknown>;
    sessionInfo?: Record<string, unknown>;
  };
}

const RecordingSchema: Schema<IRecordingDocument> = new Schema({  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
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
  recordingId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Recording metadata
  fileName: {
    type: String,
    required: true
  },
  originalFileName: String,
  mimeType: {
    type: String,
    default: 'video/webm'
  },
    // Status and processing
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing'
  },
  quality: {
    type: String,
    enum: ['low', 'medium', 'high', 'hd'],
    default: RecordingQuality.MEDIUM
  },
  
  // Timing information
  startedAt: {
    type: Date,
    required: true
  },
  endedAt: Date,
  duration: Number, // in seconds
  
  // File information
  fileSize: {
    type: Number,
    min: 0
  },
  filePath: String, // Local storage path
  
  // Cloud storage information
  cloudProvider: {
    type: String,
    enum: ['aws-s3', 'gcp-storage', 'azure-blob', 'local'],
    default: 'aws-s3'
  },
  cloudPath: String, // Cloud storage path
  cloudUrl: String, // Public/signed URL for access
  
  // Video properties
  videoProperties: {
    width: Number,
    height: Number,
    frameRate: Number,
    bitrate: Number,
    codec: String
  },
  
  // Audio properties
  audioProperties: {
    sampleRate: Number,
    bitrate: Number,
    channels: Number,
    codec: String
  },
  
  // Processing information
  processingStartedAt: Date,
  processingCompletedAt: Date,
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingErrors: [String],
  
  // Compression and optimization
  compressionRatio: Number,
  originalSize: Number,
  compressedSize: Number,
  
  // Access control
  isPublic: {
    type: Boolean,
    default: false
  },
  accessToken: String, // For secure access
  expiresAt: Date, // For temporary access
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: Date,
  
  // Analytics and insights
  analytics: {
    viewCount: {
      type: Number,
      default: 0
    },
    averageViewDuration: Number,
    heatmapData: Schema.Types.Mixed, // Heatmap coordinates and intensity
    clickEvents: [{
      timestamp: Number, // Seconds from start
      x: Number,
      y: Number,
      element: String
    }],
    scrollEvents: [{
      timestamp: Number,
      scrollTop: Number,
      scrollLeft: Number
    }],
    errorEvents: [{
      timestamp: Number,
      error: String,
      stack: String
    }]
  },
  
  // Transcription (if audio enabled)
  transcription: {
    text: String,
    confidence: Number,
    language: String,
    segments: [{
      start: Number,
      end: Number,
      text: String,
      confidence: Number
    }]
  },
  
  // Metadata and tags
  metadata: {
    deviceInfo: {
      userAgent: String,
      platform: String,
      screenResolution: String
    },
    networkInfo: {
      connectionType: String,
      effectiveType: String,
      downlink: Number
    },
    tags: [String],
    notes: String,
    flags: [String] // For marking special conditions
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
RecordingSchema.index({ sessionId: 1 });
RecordingSchema.index({ studyId: 1, createdAt: -1 });
RecordingSchema.index({ participantId: 1, createdAt: -1 });
RecordingSchema.index({ status: 1, processingStatus: 1 });
RecordingSchema.index({ cloudProvider: 1, cloudPath: 1 });
RecordingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for file size in MB
RecordingSchema.virtual('fileSizeMB').get(function(this: IRecordingDocument) {
  if (!this.fileSize) return 0;
  return Math.round(((this.fileSize as number) / (1024 * 1024)) * 100) / 100;
});

// Virtual for compression percentage
RecordingSchema.virtual('compressionPercentage').get(function(this: IRecordingDocument) {
  if (!this.originalSize || !this.compressedSize) return 0;
  return Math.round((((this.originalSize as number) - (this.compressedSize as number)) / (this.originalSize as number)) * 100);
});

// Virtual for recording quality score
RecordingSchema.virtual('qualityScore').get(function(this: IRecordingDocument) {
  const qualityScores = {
    [RecordingQuality.LOW]: 25,
    [RecordingQuality.MEDIUM]: 50,
    [RecordingQuality.HIGH]: 75,
    [RecordingQuality.ULTRA]: 100
  };
  return qualityScores[this.quality as keyof typeof qualityScores] || 50;
});

// Pre-save middleware to calculate duration and compression
RecordingSchema.pre('save', function(next) {
  // Calculate duration if start and end times are available
  if (this.startedAt && this.endedAt) {
    this.duration = Math.floor(
      (this.endedAt.getTime() - this.startedAt.getTime()) / 1000
    );
  }
  
  // Calculate compression ratio
  if (this.originalSize && this.fileSize) {
    this.compressionRatio = this.fileSize / this.originalSize;
    this.compressedSize = this.fileSize;
  }
  
  // Update last accessed time if being viewed
  if (this.isModified('analytics.viewCount')) {
    this.lastAccessedAt = new Date();
  }
  
  next();
});

// Static method to get recordings by study with analytics
RecordingSchema.statics.getStudyRecordings = function(studyId: string, options: Record<string, unknown> = {}) {
  const query: Record<string, unknown> = { studyId };
  
  if (options.status) {
    query.status = options.status;
  }
    if (options.dateRange) {
    query.createdAt = {
      $gte: (options.dateRange as { start: Date; end: Date }).start,
      $lte: (options.dateRange as { start: Date; end: Date }).end
    };
  }
  
  return this.find(query)
    .populate('sessionId')
    .populate('participantId', 'email firstName lastName')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get storage statistics
RecordingSchema.statics.getStorageStats = function(studyId?: string) {
  const matchStage = studyId ? { $match: { studyId: new mongoose.Types.ObjectId(studyId) } } : { $match: {} };
  
  return this.aggregate([
    matchStage,
    {
      $group: {
        _id: null,
        totalRecordings: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        averageSize: { $avg: '$fileSize' },
        totalDuration: { $sum: '$duration' },
        averageDuration: { $avg: '$duration' },
        compressionSavings: {
          $sum: { $subtract: ['$originalSize', '$fileSize'] }
        }
      }
    }
  ]);
};

// Instance method to start recording
RecordingSchema.methods.startRecording = function() {
  this.status = RecordingStatus.RECORDING;
  this.startedAt = new Date();
  return this.save();
};

// Instance method to stop recording
RecordingSchema.methods.stopRecording = function() {
  this.status = RecordingStatus.PROCESSING;
  this.endedAt = new Date();
  return this.save();
};

// Instance method to mark as completed
RecordingSchema.methods.completeProcessing = function(cloudUrl: string, fileSize: number) {
  this.status = RecordingStatus.COMPLETED;
  this.processingStatus = 'completed';
  this.processingCompletedAt = new Date();
  this.cloudUrl = cloudUrl;
  this.fileSize = fileSize;
  return this.save();
};

// Instance method to mark as failed
RecordingSchema.methods.markAsFailed = function(error: string) {
  this.status = RecordingStatus.FAILED;
  this.processingStatus = 'failed';
  if (!this.processingErrors) this.processingErrors = [];
  this.processingErrors.push(error);
  return this.save();
};

// Instance method to increment view count
RecordingSchema.methods.incrementViewCount = function() {
  if (!this.analytics) this.analytics = { viewCount: 0 };
  this.analytics.viewCount += 1;
  this.downloadCount += 1;
  return this.save();
};

// Instance method to generate access token
RecordingSchema.methods.generateAccessToken = function(expirationHours: number = 24) {
  this.accessToken = crypto.randomBytes(32).toString('hex');
  this.expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
  return this.save();
};

export const Recording = mongoose.model<IRecordingDocument>('Recording', RecordingSchema);
