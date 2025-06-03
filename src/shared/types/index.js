"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatus = exports.SubscriptionPlan = exports.PaymentStatus = exports.PaymentMethod = exports.FeedbackStatus = exports.RecordingQuality = exports.RecordingStatus = exports.TaskType = exports.SessionStatus = exports.StudyStatus = exports.StudyType = exports.UserRole = void 0;
// Enum constants for runtime usage
exports.UserRole = {
    RESEARCHER: 'researcher',
    PARTICIPANT: 'participant',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
};
exports.StudyType = {
    USABILITY: 'usability',
    SURVEY: 'survey',
    INTERVIEW: 'interview',
    CARD_SORTING: 'card-sorting',
    A_B_TESTING: 'a-b-testing',
    PROTOTYPE: 'prototype'
};
exports.StudyStatus = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    ARCHIVED: 'archived'
};
exports.SessionStatus = {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show'
};
exports.TaskType = {
    NAVIGATION: 'navigation',
    INTERACTION: 'interaction',
    QUESTIONNAIRE: 'questionnaire',
    FEEDBACK: 'feedback'
};
exports.RecordingStatus = {
    RECORDING: 'recording',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
};
exports.RecordingQuality = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    ULTRA: 'ultra'
};
exports.FeedbackStatus = {
    PENDING: 'pending',
    REVIEWED: 'reviewed',
    RESOLVED: 'resolved',
    RESPONDED: 'responded'
};
exports.PaymentMethod = {
    CREDIT_CARD: 'credit_card',
    PAYPAL: 'paypal',
    BANK_TRANSFER: 'bank_transfer',
    STRIPE: 'stripe'
};
exports.PaymentStatus = {
    PENDING: 'pending',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    CANCELED: 'canceled'
};
exports.SubscriptionPlan = {
    FREE: 'free',
    BASIC: 'basic',
    PRO: 'pro',
    ENTERPRISE: 'enterprise'
};
exports.SubscriptionStatus = {
    ACTIVE: 'active',
    CANCELED: 'canceled',
    EXPIRED: 'expired',
    PAST_DUE: 'past_due',
    CANCEL_AT_PERIOD_END: 'cancel_at_period_end'
};
