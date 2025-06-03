"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recording = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const index_js_1 = require("../../shared/types/index.js");
const RecordingSchema = new mongoose_1.Schema({ sessionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    studyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Study',
        required: true
    },
    participantId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        default: index_js_1.RecordingQuality.MEDIUM
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
        heatmapData: mongoose_1.Schema.Types.Mixed, // Heatmap coordinates and intensity
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
RecordingSchema.virtual('fileSizeMB').get(function () {
    if (!this.fileSize)
        return 0;
    return Math.round((this.fileSize / (1024 * 1024)) * 100) / 100;
});
// Virtual for compression percentage
RecordingSchema.virtual('compressionPercentage').get(function () {
    if (!this.originalSize || !this.compressedSize)
        return 0;
    return Math.round(((this.originalSize - this.compressedSize) / this.originalSize) * 100);
});
// Virtual for recording quality score
RecordingSchema.virtual('qualityScore').get(function () {
    const qualityScores = {
        [index_js_1.RecordingQuality.LOW]: 25,
        [index_js_1.RecordingQuality.MEDIUM]: 50,
        [index_js_1.RecordingQuality.HIGH]: 75,
        [index_js_1.RecordingQuality.ULTRA]: 100
    };
    return qualityScores[this.quality] || 50;
});
// Pre-save middleware to calculate duration and compression
RecordingSchema.pre('save', function (next) {
    // Calculate duration if start and end times are available
    if (this.startedAt && this.endedAt) {
        this.duration = Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
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
RecordingSchema.statics.getStudyRecordings = function (studyId, options = {}) {
    const query = { studyId };
    if (options.status) {
        query.status = options.status;
    }
    if (options.dateRange) {
        query.createdAt = {
            $gte: options.dateRange.start,
            $lte: options.dateRange.end
        };
    }
    return this.find(query)
        .populate('sessionId')
        .populate('participantId', 'email firstName lastName')
        .sort({ createdAt: -1 })
        .limit(options.limit || 50);
};
// Static method to get storage statistics
RecordingSchema.statics.getStorageStats = function (studyId) {
    const matchStage = studyId ? { $match: { studyId: new mongoose_1.default.Types.ObjectId(studyId) } } : { $match: {} };
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
RecordingSchema.methods.startRecording = function () {
    this.status = index_js_1.RecordingStatus.RECORDING;
    this.startedAt = new Date();
    return this.save();
};
// Instance method to stop recording
RecordingSchema.methods.stopRecording = function () {
    this.status = index_js_1.RecordingStatus.PROCESSING;
    this.endedAt = new Date();
    return this.save();
};
// Instance method to mark as completed
RecordingSchema.methods.completeProcessing = function (cloudUrl, fileSize) {
    this.status = index_js_1.RecordingStatus.COMPLETED;
    this.processingStatus = 'completed';
    this.processingCompletedAt = new Date();
    this.cloudUrl = cloudUrl;
    this.fileSize = fileSize;
    return this.save();
};
// Instance method to mark as failed
RecordingSchema.methods.markAsFailed = function (error) {
    this.status = index_js_1.RecordingStatus.FAILED;
    this.processingStatus = 'failed';
    if (!this.processingErrors)
        this.processingErrors = [];
    this.processingErrors.push(error);
    return this.save();
};
// Instance method to increment view count
RecordingSchema.methods.incrementViewCount = function () {
    if (!this.analytics)
        this.analytics = { viewCount: 0 };
    this.analytics.viewCount += 1;
    this.downloadCount += 1;
    return this.save();
};
// Instance method to generate access token
RecordingSchema.methods.generateAccessToken = function (expirationHours = 24) {
    this.accessToken = crypto_1.default.randomBytes(32).toString('hex');
    this.expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
    return this.save();
};
exports.Recording = mongoose_1.default.model('Recording', RecordingSchema);
