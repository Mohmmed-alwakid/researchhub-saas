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
exports.Participant = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ParticipantSchema = new mongoose_1.Schema({
    studyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Study',
        required: true,
        index: true
    },
    researcherId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.Mixed,
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
            type: mongoose_1.Schema.Types.ObjectId,
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
ParticipantSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
// Virtual for session count
ParticipantSchema.virtual('sessionCount').get(function () {
    return this.sessions?.length || 0;
});
// Pre-save middleware
ParticipantSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        switch (this.status) {
            case 'accepted':
                if (!this.acceptedAt)
                    this.acceptedAt = new Date();
                break;
            case 'completed':
                if (!this.completedAt)
                    this.completedAt = new Date();
                break;
        }
    }
    next();
});
// Instance methods
ParticipantSchema.methods.markAccepted = function () {
    this.status = 'accepted';
    this.acceptedAt = new Date();
    return this.save();
};
ParticipantSchema.methods.markCompleted = function () {
    this.status = 'completed';
    this.completedAt = new Date();
    return this.save();
};
ParticipantSchema.methods.addSession = function (sessionId) {
    if (!this.sessions)
        this.sessions = [];
    if (!this.sessions.includes(sessionId)) {
        this.sessions.push(sessionId);
    }
    return this.save();
};
// Static methods
ParticipantSchema.statics.findByStudy = function (studyId) {
    return this.find({ studyId }).populate('studyId', 'title').sort({ createdAt: -1 });
};
ParticipantSchema.statics.getStatsByResearcher = function (researcherId) {
    return this.aggregate([
        { $match: { researcherId: new mongoose_1.default.Types.ObjectId(researcherId) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
};
exports.Participant = mongoose_1.default.model('Participant', ParticipantSchema);
