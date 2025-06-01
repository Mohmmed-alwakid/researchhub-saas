import type { Request } from 'express';
import type { IUserDocument } from '../../database/models/index.js';

// User types
export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'researcher' | 'participant' | 'admin' | 'super_admin';
  avatar?: string;
  isVerified: boolean;
  subscription?: ISubscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfile {
  user: string;
  bio?: string;
  organization?: string;
  website?: string;
  location?: string;
  expertise?: string[];
  demographics?: {
    age?: number;
    gender?: string;
    education?: string;
    income?: string;
    occupation?: string;
  };
}

// Authentication types
export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'researcher' | 'participant';
}

export interface IAuthResponse {
  user: IUser;
  token: string;
  refreshToken: string;
}

// Express Request with authenticated user
export interface AuthRequest extends Request {
  user?: IUserDocument;
}

// Study types
export interface IStudy {
  _id: string;
  title: string;
  description: string;
  researcher: string | IUser;
  createdBy: string | IUser; // alias for researcher for compatibility
  team?: (string | IUser)[]; // team members who can access the study
  type: 'usability' | 'survey' | 'interview' | 'card-sorting' | 'a-b-testing';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  visibility: 'private' | 'public';
  recruitmentStatus: 'not_recruiting' | 'recruiting' | 'recruitment_closed';
  configuration: IStudyConfiguration;
  settings?: {
    maxParticipants?: number;
    duration?: number;
    compensation?: number;
    [key: string]: unknown;
  };
  tasks: string[] | ITask[];
  participants: IStudyParticipants;
  analytics: IStudyAnalytics;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudyConfiguration {
  duration: number; // minutes
  compensation: number; // USD
  maxParticipants: number;
  participantCriteria: {
    minAge?: number;
    maxAge?: number;
    location?: string[];
    devices?: ('desktop' | 'mobile' | 'tablet')[];
    customScreening?: IScreeningQuestion[];
  };
  recordingOptions: {
    screen: boolean;
    audio: boolean;
    webcam: boolean;
    clicks: boolean;
    scrolls: boolean;
    keystrokes: boolean;
  };
  instructions?: string;
  thankYouMessage?: string;
}

export interface IScreeningQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple-choice' | 'boolean' | 'number';
  options?: string[];
  required: boolean;
  disqualifyAnswers?: string[];
}

export interface IStudyParticipants {
  target: number;
  enrolled: number;
  completed: number;
  active: string[];
  qualified: string[];
  disqualified: string[];
}

export interface IStudyAnalytics {
  avgCompletionTime: number;
  successRate: number;
  dropoffRate: number;
  satisfactionScore: number;
  completionsByDevice: Record<string, number>;
  demographicBreakdown: Record<string, number>;
}

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

// Task types
export interface ITask {
  _id: string;
  studyId: string;
  title: string;
  description: string;
  type: 'navigation' | 'interaction' | 'questionnaire' | 'prototype-test';
  order: number;
  configuration: ITaskConfiguration;
  successCriteria?: string[];
  timeLimit?: number; // seconds
  isRequired: boolean;
}

export interface ITaskConfiguration {
  url?: string;
  instructions: string;
  questions?: ITaskQuestion[];
  prototype?: {
    type: 'figma' | 'invision' | 'marvel' | 'url';
    url: string;
  };
  heatmapTracking: boolean;
  clickTracking: boolean;
  scrollTracking: boolean;
}

export interface ITaskQuestion {
  id: string;
  question: string;
  type: 'text' | 'rating' | 'multiple-choice' | 'boolean';
  options?: string[];
  required: boolean;
}

// Session types
export interface ISession {
  _id: string;
  studyId: string | IStudy;
  participantId: string | IUser;
  sessionToken: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  endedAt?: Date;
  updatedAt?: Date;
  duration?: number; // seconds
  
  // Task progress tracking
  taskCompletions: ITaskCompletion[];
  currentTaskIndex?: number;
  progress?: {
    currentTask: string | null;
    completedTasks: string[];
    totalTasks: number;
  };
  
  // Recording information
  recordingId?: string;
  recordingUrl?: string;
  recordingStartedAt?: Date;
  recordingEndedAt?: Date;
  recordingSize?: number;
  
  // Browser and device info
  browserInfo?: {
    userAgent?: string;
    viewport?: {
      width?: number;
      height?: number;
    };
    platform?: string;
    language?: string;
  };
  
  // Interaction data
  mouseEvents?: Array<{
    type: string;
    timestamp: Date;
    x?: number;
    y?: number;
    target?: string;
    data?: unknown;
  }>;
  keyboardEvents?: Array<{
    timestamp: Date;
    key?: string;
    target?: string;
  }>;
  
  // Performance metrics
  performanceMetrics?: {
    loadTime?: number;
    errorCount?: number;
    completionRate?: number;
    userSatisfactionScore?: number;
  };
  
  // Feedback and notes
  participantFeedback?: {
    overallRating?: number;
    difficultyRating?: number;
    comments?: string;
    usabilityScore?: number;
    recommendationScore?: number;
  };
  researcherNotes?: string;
  
  // Technical data
  ipAddress?: string;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Data storage
  data?: Record<string, unknown>;
  
  // Metadata
  metadata?: {
    source?: string;
    userAgent?: string;
    referrer?: string;
    compensation?: {
      amount?: number;
      currency?: string;
      status?: 'pending' | 'processing' | 'paid' | 'failed';
    };
    flags?: string[];
    tags?: string[];
  };
  
  // Legacy compatibility
  taskResponses?: ITaskResponse[];
  recordings?: IRecording[];
  feedback?: IFeedback[];
  deviceInfo?: IDeviceInfo;
  createdAt?: Date;
}

export interface ITaskResponse {
  taskId: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  success: boolean;
  answers: Record<string, unknown>;
  interactions: IInteraction[];
  errors?: string[];
}

export interface ITaskCompletion {
  taskId: string;
  status: 'pending' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  errorCount?: number;
  success?: boolean;
}

export interface IInteraction {
  type: 'click' | 'scroll' | 'keypress' | 'focus' | 'hover';
  timestamp: Date;
  coordinates?: { x: number; y: number };
  element?: string;
  value?: string;
  scrollPosition?: { x: number; y: number };
}

export interface IRecording {
  _id: string;
  sessionId: string;
  studyId: string;
  participantId: string;
  recordingId: string;
  fileName: string;
  originalFileName?: string;
  mimeType?: string;
  type: 'screen' | 'audio' | 'webcam';
  status?: 'recording' | 'processing' | 'completed' | 'failed';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  fileSize?: number;
  filePath?: string;
  cloudProvider?: 'aws-s3' | 'gcp-storage' | 'azure-blob' | 'local';
  cloudPath?: string;
  cloudUrl?: string;
  fileUrl?: string;
  videoProperties?: {
    width?: number;
    height?: number;
    frameRate?: number;
    bitrate?: number;
    codec?: string;
  };
  audioProperties?: {
    sampleRate?: number;
    bitrate?: number;
    channels?: number;
    codec?: string;
  };
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  processingErrors?: string[];
  compressionRatio?: number;
  originalSize?: number;
  compressedSize?: number;
  isPublic?: boolean;
  accessToken?: string;
  expiresAt?: Date;
  downloadCount?: number;
  tags?: string[];
  notes?: string;
  metadata?: Record<string, unknown>;
  url: string;
  size: number;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeedback {
  _id: string;
  studyId: string;
  participantId: string;
  sessionId: string;
  taskId?: string;
  type: 'rating' | 'comment' | 'suggestion' | 'issue' | 'compliment';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  content: string;
  title?: string;
  rating?: number;
  ratings?: {
    overall?: number;
    usability?: number;
    design?: number;
    performance?: number;
    satisfaction?: number;
  };
  categories?: Array<{
    name: string;
    rating?: number;
    comments?: string;
  }>;
  sentiment?: {
    score: number;
    magnitude: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  tags: string[];
  notes?: string;
  metadata?: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  timestamp: Date;
}

export interface IDeviceInfo {
  userAgent: string;
  screenResolution: { width: number; height: number };
  viewport: { width: number; height: number };
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

// Subscription types
export interface ISubscription {
  _id: string;
  userId: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'expired' | 'past_due' | 'cancel_at_period_end';
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  features: ISubscriptionFeatures;
  usage: IUsageMetrics;
}

export interface ISubscriptionFeatures {
  maxStudies: number;
  maxParticipantsPerStudy: number;
  recordingMinutes: number;
  advancedAnalytics: boolean;
  exportData: boolean;
  teamCollaboration: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
}

export interface IUsageMetrics {
  studiesCreated: number;
  participantsRecruited: number;
  recordingMinutesUsed: number;
  dataExports: number;
  lastResetDate: Date;
}

// API Response types
export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: IPagination;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Notification types
export interface INotification {
  _id: string;
  userId: string;
  type: 'study-completed' | 'participant-enrolled' | 'payment-received' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
}

// Payment types
export interface IPayment {
  _id: string;
  userId: string;
  subscriptionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeInvoiceId?: string;
  stripeCustomerId?: string;
  type: 'payment' | 'payout' | 'refund' | 'subscription';
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  amount: number;
  currency: string;
  amountReceived?: number;
  stripeFee?: number;
  applicationFee?: number;
  netAmount?: number;
  refundAmount?: number;
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'stripe';
  paymentMethodDetails?: {
    card?: {
      brand?: string;
      last4?: string;
      expMonth?: number;
      expYear?: number;
      country?: string;
      funding?: string;
    };
    bank?: {
      accountType?: string;
      bankName?: string;
      last4?: string;
      routingNumber?: string;
    };
  };
  description: string;
  failureReason?: string;
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  retryAttempts?: number;
  metadata?: Record<string, unknown>;
  paidAt?: Date;
  failedAt?: Date;
  attemptedAt?: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Heatmap types
export interface IHeatmapData {
  studyId: string;
  taskId?: string;
  url: string;
  clicks: IHeatmapPoint[];
  scrolls: IScrollData[];
  viewport: { width: number; height: number };
  generatedAt: Date;
}

export interface IHeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  timestamp: Date;
}

export interface IScrollData {
  depth: number;
  timeSpent: number;
  bounceRate: number;
}

// Analytics types
export interface IAnalyticsSummary {
  studyId: string;
  totalSessions: number;
  completedSessions: number;
  avgCompletionTime: number;
  avgSatisfactionScore: number;
  conversionFunnel: IFunnelStep[];
  taskPerformance: ITaskPerformance[];
  demographicInsights: IDemographicInsight[];
  deviceBreakdown: IDeviceBreakdown[];
  timeAnalysis: ITimeAnalysis;
}

export interface IFunnelStep {
  step: string;
  participants: number;
  dropoffRate: number;
}

export interface ITaskPerformance {
  taskId: string;
  taskTitle: string;
  completionRate: number;
  avgTime: number;
  successRate: number;
  errorRate: number;
  satisfactionScore: number;
}

export interface IDemographicInsight {
  category: string;
  segments: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
}

export interface IDeviceBreakdown {
  device: string;
  count: number;
  percentage: number;
  avgCompletionTime: number;
}

export interface ITimeAnalysis {
  hourlyDistribution: Array<{ hour: number; sessions: number }>;
  dailyDistribution: Array<{ day: string; sessions: number }>;
  peakTimes: Array<{ period: string; sessions: number }>;
}

// Type aliases for convenience
export type User = IUser;
export type Study = IStudy;
export type Session = ISession;
export type Task = ITask;
export type Recording = IRecording;
export type Feedback = IFeedback;
export type Subscription = ISubscription;
export type ParticipantApplication = IParticipantApplication;

// Enum types
export type UserRole = 'researcher' | 'participant' | 'admin' | 'super_admin';
export type StudyType = 'usability' | 'survey' | 'interview' | 'card-sorting' | 'a-b-testing' | 'prototype';
export type StudyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type TaskType = 'navigation' | 'interaction' | 'questionnaire' | 'feedback';
export type TaskStatus = 'draft' | 'active' | 'completed' | 'paused' | 'cancelled';
export type RecordingStatus = 'recording' | 'processing' | 'completed' | 'failed';
export type RecordingQuality = 'low' | 'medium' | 'high' | 'ultra';
export type FeedbackType = 'rating' | 'comment' | 'suggestion' | 'issue' | 'compliment';
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type PaymentType = 'payment' | 'payout' | 'refund' | 'subscription';
export type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer' | 'stripe';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due' | 'cancel_at_period_end';

// Enum constants for runtime usage
export const UserRole = {
  RESEARCHER: 'researcher' as const,
  PARTICIPANT: 'participant' as const,
  ADMIN: 'admin' as const,
  SUPER_ADMIN: 'super_admin' as const
} as const;

export const StudyType = {
  USABILITY: 'usability' as const,
  SURVEY: 'survey' as const,
  INTERVIEW: 'interview' as const,
  CARD_SORTING: 'card-sorting' as const,
  A_B_TESTING: 'a-b-testing' as const,
  PROTOTYPE: 'prototype' as const
} as const;

export const StudyStatus = {
  DRAFT: 'draft' as const,
  ACTIVE: 'active' as const,
  PAUSED: 'paused' as const,
  COMPLETED: 'completed' as const,
  ARCHIVED: 'archived' as const
} as const;

export const SessionStatus = {
  SCHEDULED: 'scheduled' as const,
  IN_PROGRESS: 'in_progress' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  NO_SHOW: 'no_show' as const
} as const;

export const TaskType = {
  NAVIGATION: 'navigation' as const,
  INTERACTION: 'interaction' as const,
  QUESTIONNAIRE: 'questionnaire' as const,
  FEEDBACK: 'feedback' as const
} as const;

export const RecordingStatus = {
  RECORDING: 'recording' as const,
  PROCESSING: 'processing' as const,
  COMPLETED: 'completed' as const,
  FAILED: 'failed' as const
} as const;

export const RecordingQuality = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  ULTRA: 'ultra' as const
} as const;

export const FeedbackStatus = {
  PENDING: 'pending' as const,
  REVIEWED: 'reviewed' as const,
  RESOLVED: 'resolved' as const,
  RESPONDED: 'responded' as const
} as const;

export const PaymentMethod = {
  CREDIT_CARD: 'credit_card' as const,
  PAYPAL: 'paypal' as const,
  BANK_TRANSFER: 'bank_transfer' as const,
  STRIPE: 'stripe' as const
} as const;

export const PaymentStatus = {
  PENDING: 'pending' as const,
  SUCCEEDED: 'succeeded' as const,
  FAILED: 'failed' as const,
  CANCELED: 'canceled' as const
} as const;

export const SubscriptionPlan = {
  FREE: 'free' as const,
  BASIC: 'basic' as const,
  PRO: 'pro' as const,
  ENTERPRISE: 'enterprise' as const
} as const;

export const SubscriptionStatus = {
  ACTIVE: 'active' as const,
  CANCELED: 'canceled' as const,
  EXPIRED: 'expired' as const,
  PAST_DUE: 'past_due' as const,
  CANCEL_AT_PERIOD_END: 'cancel_at_period_end' as const
} as const;
