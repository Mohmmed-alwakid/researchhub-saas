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
exports.Feedback = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FeedbackSchema = new mongoose_1.Schema({
    studyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Study',
        required: true,
        index: true
    },
    sessionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Session',
        index: true
    },
    participantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    taskId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Task',
        index: true
    },
    // Feedback type and content
    type: {
        type: String,
        enum: ['rating', 'comment', 'suggestion', 'issue', 'compliment'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    // Main feedback content
    content: {
        type: String,
        required: true,
        maxlength: 5000
    },
    title: {
        type: String,
        maxlength: 200
    },
    // Structured ratings
    ratings: {
        overall: {
            type: Number,
            min: 1,
            max: 5
        },
        usability: {
            type: Number,
            min: 1,
            max: 5
        },
        design: {
            type: Number,
            min: 1,
            max: 5
        },
        performance: {
            type: Number,
            min: 1,
            max: 5
        },
        satisfaction: {
            type: Number,
            min: 1,
            max: 5
        }
    },
    // Specific feedback categories
    categories: [{
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comments: String
        }],
    // Sentiment analysis
    sentiment: {
        score: {
            type: Number,
            min: -1,
            max: 1
        },
        magnitude: {
            type: Number,
            min: 0,
            max: 1
        },
        label: {
            type: String,
            enum: ['positive', 'negative', 'neutral', 'mixed']
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1
        }
    },
    // Context information
    context: {
        timestamp: {
            type: Date,
            default: Date.now
        },
        page: String,
        element: String,
        userAction: String,
        screenshot: String, // URL to screenshot
        coordinates: {
            x: Number,
            y: Number
        }
    },
    // Priority and severity
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    severity: {
        type: String,
        enum: ['minor', 'moderate', 'major', 'critical'],
        default: 'moderate'
    },
    // Tags and categorization
    tags: [String],
    // Follow-up information
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpNotes: String,
    resolutionNotes: String,
    // Research team response
    response: {
        content: String,
        respondedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date,
        isPublic: {
            type: Boolean,
            default: false
        }
    },
    // Metadata
    metadata: {
        source: {
            type: String,
            enum: ['session', 'survey', 'interview', 'observation', 'heatmap'],
            default: 'session'
        },
        device: {
            type: String,
            userAgent: String,
            platform: String,
            browser: String
        },
        isAnonymous: {
            type: Boolean,
            default: false
        },
        language: {
            type: String,
            default: 'en'
        },
        timezone: String,
        ipAddress: String,
        version: {
            type: String,
            default: '1.0'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Indexes for performance
FeedbackSchema.index({ studyId: 1, type: 1 });
FeedbackSchema.index({ participantId: 1, createdAt: -1 });
FeedbackSchema.index({ sessionId: 1, type: 1 });
FeedbackSchema.index({ status: 1, priority: 1 });
FeedbackSchema.index({ 'sentiment.label': 1, 'ratings.overall': 1 });
FeedbackSchema.index({ tags: 1 });
FeedbackSchema.index({ createdAt: -1 });
// Text search index
FeedbackSchema.index({
    content: 'text',
    title: 'text',
    'categories.comments': 'text'
});
// Virtual for average rating
FeedbackSchema.virtual('averageRating').get(function () {
    if (!this.ratings)
        return 0;
    const ratings = Object.values(this.ratings).filter(r => typeof r === 'number' && r > 0);
    if (ratings.length === 0)
        return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
});
// Virtual for feedback quality score
FeedbackSchema.virtual('qualityScore').get(function () {
    let score = 0;
    // Content length score (more detailed feedback is better)
    if (this.content) {
        const contentScore = Math.min(this.content.length / 100, 5);
        score += contentScore;
    }
    // Ratings completeness score
    const ratingsCount = this.ratings ? Object.keys(this.ratings).length : 0;
    score += ratingsCount;
    // Categories detail score
    const categoriesScore = this.categories ? this.categories.length * 0.5 : 0;
    score += categoriesScore;
    return Math.min(Math.round(score * 10) / 10, 10);
});
// Pre-save middleware for sentiment analysis and processing
FeedbackSchema.pre('save', async function (next) {
    // Auto-set priority based on ratings
    if (this.ratings && this.ratings.overall) {
        if (this.ratings.overall <= 2) {
            this.priority = 'high';
            this.severity = 'major';
        }
        else if (this.ratings.overall <= 3) {
            this.priority = 'medium';
            this.severity = 'moderate';
        }
        else {
            this.priority = 'low';
            this.severity = 'minor';
        }
    }
    // Auto-extract tags from content (basic keyword extraction)
    if (this.content && !this.tags.length) {
        const keywords = this.extractKeywords(this.content);
        this.tags = keywords.slice(0, 5); // Limit to 5 auto-generated tags
    }
    next();
});
// Static method to get feedback analytics for a study
FeedbackSchema.statics.getStudyAnalytics = function (studyId) {
    return this.aggregate([
        { $match: { studyId: new mongoose_1.default.Types.ObjectId(studyId) } },
        {
            $group: {
                _id: null,
                totalFeedback: { $sum: 1 },
                averageRating: { $avg: '$ratings.overall' },
                sentimentDistribution: {
                    $push: '$sentiment.label'
                },
                priorityDistribution: {
                    $push: '$priority'
                },
                typeDistribution: {
                    $push: '$type'
                }
            }
        },
        {
            $addFields: {
                sentimentCounts: {
                    $reduce: {
                        input: '$sentimentDistribution',
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                {
                                    $arrayToObject: [[{
                                                k: '$$this',
                                                v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] }
                                            }]]
                                }
                            ]
                        }
                    }
                }
            }
        }
    ]);
};
// Static method to get trending issues
FeedbackSchema.statics.getTrendingIssues = function (studyId, timeframe = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);
    return this.aggregate([
        {
            $match: {
                studyId: new mongoose_1.default.Types.ObjectId(studyId),
                createdAt: { $gte: startDate },
                priority: { $in: ['high', 'critical'] }
            }
        },
        {
            $group: {
                _id: '$tags',
                count: { $sum: 1 },
                averageRating: { $avg: '$ratings.overall' },
                latestFeedback: { $last: '$content' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
};
// Instance method for keyword extraction (basic implementation)
FeedbackSchema.methods.extractKeywords = function (text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'this', 'that', 'these', 'those']);
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));
    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    return Object.entries(wordCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);
};
// Instance method to mark as resolved
FeedbackSchema.methods.resolve = function (resolutionNotes, resolvedBy) {
    this.status = 'resolved';
    this.resolutionNotes = resolutionNotes;
    this.response = {
        ...this.response,
        respondedBy: resolvedBy,
        respondedAt: new Date()
    };
    return this.save();
};
// Instance method to add response
FeedbackSchema.methods.addResponse = function (content, respondedBy, isPublic = false) {
    this.response = {
        content,
        respondedBy,
        respondedAt: new Date(),
        isPublic
    };
    this.status = 'reviewed';
    return this.save();
};
exports.Feedback = mongoose_1.default.model('Feedback', FeedbackSchema);
