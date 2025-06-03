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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TaskCompletionSchema = new mongoose_1.Schema({
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
const SessionSchema = new mongoose_1.Schema({ studyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Study',
        required: true,
        index: true
    },
    participantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }, sessionToken: {
        type: String,
        required: true,
        unique: true
    }, status: {
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
        type: String
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
            data: mongoose_1.Schema.Types.Mixed
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
SessionSchema.index({ recordingId: 1 });
SessionSchema.index({ 'metadata.compensation.status': 1 });
// Virtual for session completion percentage
SessionSchema.virtual('completionPercentage').get(function () {
    if (!this.taskCompletions || this.taskCompletions.length === 0)
        return 0;
    const completedTasks = this.taskCompletions.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / this.taskCompletions.length) * 100);
});
// Virtual for total interaction events
SessionSchema.virtual('totalInteractions').get(function () {
    const mouseEvents = this.mouseEvents?.length || 0;
    const keyboardEvents = this.keyboardEvents?.length || 0;
    return mouseEvents + keyboardEvents;
});
// Pre-save middleware to calculate duration
SessionSchema.pre('save', function (next) {
    if (this.startedAt && this.completedAt) {
        this.duration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
    }
    // Update performance metrics
    if (this.taskCompletions && this.taskCompletions.length > 0) {
        const completedTasks = this.taskCompletions.filter(task => task.status === 'completed').length;
        this.performanceMetrics = {
            ...this.performanceMetrics,
            completionRate: (completedTasks / this.taskCompletions.length) * 100,
            errorCount: this.taskCompletions.reduce((sum, task) => sum + (task.errorCount || 0), 0)
        };
    }
    next();
});
// Static method to get sessions by study with analytics
SessionSchema.statics.getStudyAnalytics = function (studyId) {
    return this.aggregate([
        { $match: { studyId: new mongoose_1.default.Types.ObjectId(studyId) } },
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
SessionSchema.methods.startSession = function () {
    this.status = 'in_progress';
    this.startedAt = new Date();
    return this.save();
};
// Instance method to complete session
SessionSchema.methods.completeSession = function () {
    this.status = 'completed';
    this.completedAt = new Date();
    return this.save();
};
// Instance method to add mouse event
SessionSchema.methods.addMouseEvent = function (event) {
    if (!this.mouseEvents)
        this.mouseEvents = [];
    this.mouseEvents.push({
        ...event,
        timestamp: new Date()
    });
};
// Instance method to add keyboard event
SessionSchema.methods.addKeyboardEvent = function (event) {
    if (!this.keyboardEvents)
        this.keyboardEvents = [];
    this.keyboardEvents.push({
        ...event,
        timestamp: new Date()
    });
};
exports.Session = mongoose_1.default.model('Session', SessionSchema);
