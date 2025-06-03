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
exports.Task = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TaskSchema = new mongoose_1.Schema({
    studyId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    }, type: {
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
            validator: function (v) {
                if (!v)
                    return true; // Optional field
                try {
                    new URL(v);
                    return true;
                }
                catch {
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
    }, status: {
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
TaskSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('order')) {
        const TaskModel = this.constructor;
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
TaskSchema.statics.getByStudy = function (studyId) {
    return this.find({ studyId }).sort({ order: 1 });
};
// Instance method to check if task can be started
TaskSchema.methods.canBeStarted = function () {
    return this.status === 'active';
};
// Instance method to get next task in sequence
TaskSchema.methods.getNextTask = async function () {
    const TaskModel = this.constructor;
    return TaskModel.findOne({
        studyId: this.studyId,
        order: { $gt: this.order },
        status: 'active'
    }).sort({ order: 1 });
};
exports.Task = mongoose_1.default.model('Task', TaskSchema);
