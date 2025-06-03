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
exports.Study = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const StudyConfigurationSchema = new mongoose_1.Schema({
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
const StudyParticipantsSchema = new mongoose_1.Schema({
    target: { type: Number, required: true },
    enrolled: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    active: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    qualified: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    disqualified: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }]
});
const StudyAnalyticsSchema = new mongoose_1.Schema({
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
const StudySchema = new mongoose_1.Schema({
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
    }, researcher: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    team: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    type: {
        type: String,
        enum: ['usability', 'survey', 'interview', 'card-sorting', 'a-b-testing'],
        required: [true, 'Study type is required']
    }, status: {
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
        required: true
    },
    settings: {
        maxParticipants: Number,
        duration: Number,
        compensation: Number
    },
    publishedAt: Date,
    tasks: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
StudySchema.pre('save', function () {
    if (this.researcher && !this.createdBy) {
        this.createdBy = this.researcher;
    }
    if (this.createdBy && !this.researcher) {
        this.researcher = this.createdBy;
    }
});
// Virtual for completion rate
StudySchema.virtual('completionRate').get(function () {
    if (this.participants.enrolled === 0)
        return 0;
    return (this.participants.completed / this.participants.enrolled) * 100;
});
// Virtual for enrollment rate
StudySchema.virtual('enrollmentRate').get(function () {
    if (this.participants.target === 0)
        return 0;
    return (this.participants.enrolled / this.participants.target) * 100;
});
exports.Study = mongoose_1.default.model('Study', StudySchema);
