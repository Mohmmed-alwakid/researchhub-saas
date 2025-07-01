import type { Request } from 'express';
// import type { IUserDocument } from '../../database/models/index.js';

// Temporary user document interface
interface IUserDocument extends IUser {
  save(): Promise<void>;
}

// User types
export interface IUser {
  _id: string;
  id?: string; // Alternative ID property for compatibility
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // Computed or alternative name property
  role: 'researcher' | 'participant' | 'admin' | 'super_admin';
  avatar?: string;
  isVerified: boolean;
  subscription?: ISubscription;
  createdAt: Date;
  updatedAt: Date;
}

// Supabase-specific user interface for compatibility
export interface SupabaseUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'accepted'; // Added 'accepted' for compatibility
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

// Participant types
export interface IParticipant {
  _id: string;
  studyId: string;
  researcherId: string;
  email: string;
  firstName: string;
  lastName: string;
  demographics?: Record<string, unknown>;
  status: 'invited' | 'accepted' | 'declined' | 'completed' | 'no_show' | 'screened' | 'qualified' | 'disqualified'; // Added missing status values
  invitedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  notes?: string;
  sessions?: string[];
  compensation?: number;
  createdAt: Date;
  updatedAt: Date;
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

// ============================================================================
// STUDY BLOCKS SYSTEM - Comprehensive Block-Based Architecture
// ============================================================================

// Base block interface that all blocks extend
export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
  title: string;
  description?: string;
  isRequired: boolean;
  settings: BlockSettings;
  conditionalLogic?: ConditionalRule[];
  analytics: AnalyticsConfig;
  metadata?: BlockMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// All supported block types
export type BlockType = 
  | 'welcome'
  | 'open_question'
  | 'opinion_scale'
  | 'simple_input'
  | 'multiple_choice'
  | 'context_screen'
  | 'yes_no'
  | 'five_second_test'
  | 'card_sort'
  | 'tree_test'
  | 'screener'
  | 'prototype_test'
  | 'live_website_test'
  | 'thank_you'
  | 'image_upload'
  | 'file_upload';

// Block settings interface
export interface BlockSettings {
  [key: string]: unknown;
  // Common settings
  message?: string;
  content?: string;
  duration?: number | string;
  question?: string;
  placeholder?: string;
  options?: string[];
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  labels?: {
    min?: string;
    max?: string;
    left?: string;
    right?: string;
  };
  instructions?: string;
  url?: string;
  nextSteps?: string;
  tasks?: string[];
  followUpQuestions?: Array<{ id: string; question: string; type: string }>;
  // Customization options
  customization?: BlockCustomization;
  validation?: BlockValidation;
  display?: BlockDisplay;
}

// Block customization options
export interface BlockCustomization {
  theme?: 'default' | 'minimal' | 'brand';
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    primary?: string;
    secondary?: string;
  };
  spacing?: 'compact' | 'default' | 'spacious';
  animation?: boolean;
}

// Block validation rules
export interface BlockValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customRules?: ValidationRule[];
}

// Block display options
export interface BlockDisplay {
  showProgressBar?: boolean;
  showTimer?: boolean;
  allowSkip?: boolean;
  autoAdvance?: boolean;
  timeLimit?: number; // seconds
}

// Conditional logic for blocks
export interface ConditionalRule {
  id: string;
  condition: LogicalCondition;
  action: ConditionalAction;
  priority: number;
}

export interface LogicalCondition {
  type: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
  field: string;
  value: unknown;
  operator?: 'AND' | 'OR';
}

export interface ConditionalAction {
  type: 'show' | 'hide' | 'skip' | 'redirect' | 'modify';
  target?: string;
  parameters?: Record<string, unknown>;
}

// Analytics configuration for blocks
export interface AnalyticsConfig {
  trackInteractions: boolean;
  trackTiming: boolean;
  trackDropoff: boolean;
  customEvents?: string[];
  heatmapTracking?: boolean;
}

// Block metadata
export interface BlockMetadata {
  category: string;
  subcategory?: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  tags: string[];
  version: string;
  author?: string;
  lastModified: Date;
  // Additional properties used in components
  icon?: string;
  color?: string;
  description?: string;
}

// Validation rule interface
export interface ValidationRule {
  id: string;
  type: string;
  parameters: Record<string, unknown>;
  errorMessage: string;
}

// ============================================================================
// SPECIFIC BLOCK TYPE INTERFACES
// ============================================================================

// 1. Welcome Screen Block
export interface WelcomeBlock extends BaseBlock {
  type: 'welcome';
  welcomeMessage: string;
  useCustomMessage: boolean;
  image?: string;
  buttons: {
    startText: string;
    exitText?: string;
  };
  studyOverview?: {
    showDuration: boolean;
    showParticipantCount: boolean;
    showCompensation: boolean;
  };
}

// 2. Open Question Block
export interface OpenQuestionBlock extends BaseBlock {
  type: 'open_question';
  question: string;
  placeholder?: string;
  followUpQuestions?: string[];
  aiFollowUp: {
    enabled: boolean;
    maxQuestions: number;
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  };
  responseSettings: {
    minWords?: number;
    maxWords?: number;
    allowRichText: boolean;
  };
}

// 3. Opinion Scale Block
export interface OpinionScaleBlock extends BaseBlock {
  type: 'opinion_scale';
  question: string;
  scaleType: 'numerical' | 'stars' | 'emotions' | 'likert' | 'custom';
  scaleRange: {
    min: number;
    max: number;
    step?: number;
  };
  labels: {
    left: string;
    right: string;
    center?: string;
  };
  customOptions?: OpinionScaleOption[];
  showNeutralOption: boolean;
}

export interface OpinionScaleOption {
  value: number;
  label: string;
  icon?: string;
  color?: string;
}

// 4. Simple Input Block
export interface SimpleInputBlock extends BaseBlock {
  type: 'simple_input';
  question: string;
  inputType: 'text' | 'number' | 'email' | 'date' | 'url' | 'phone';
  placeholder?: string;
  validation: {
    required: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  formatting?: {
    mask?: string;
    transform?: 'uppercase' | 'lowercase' | 'capitalize';
  };
}

// 5. Multiple Choice Block
export interface MultipleChoiceBlock extends BaseBlock {
  type: 'multiple_choice';
  question: string;
  options: MultipleChoiceOption[];
  selectionType: 'single' | 'multiple';
  randomizeOptions: boolean;
  allowOther: boolean;
  otherPlaceholder?: string;
  minSelections?: number;
  maxSelections?: number;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  value: string;
  icon?: string;
  description?: string;
  isExclusive?: boolean;
}

// 6. Context Screen Block
export interface ContextScreenBlock extends BaseBlock {
  type: 'context_screen';
  content: string;
  contentType: 'text' | 'html' | 'markdown';
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    caption?: string;
  };
  navigation: {
    showBack: boolean;
    showNext: boolean;
    autoAdvance: boolean;
    timeDelay?: number;
  };
}

// 7. Yes/No Block
export interface YesNoBlock extends BaseBlock {
  type: 'yes_no';
  question: string;
  displayStyle: 'buttons' | 'toggle' | 'cards' | 'icons';
  customLabels?: {
    yes: string;
    no: string;
  };
  customIcons?: {
    yes: string;
    no: string;
  };
  followUpLogic?: {
    onYes?: ConditionalAction;
    onNo?: ConditionalAction;
  };
}

// 8. 5-Second Test Block
export interface FiveSecondTestBlock extends BaseBlock {
  type: 'five_second_test';
  stimulus: {
    type: 'image' | 'webpage' | 'prototype';
    url: string;
    preloadTime?: number;
  };
  timing: {
    exposureDuration: number; // seconds, default 5
    memoryDelay?: number; // seconds between exposure and questions
  };
  questions: FiveSecondQuestion[];
  settings: {
    allowScreenshot: boolean;
    trackEyeMovement: boolean;
    recordReactions: boolean;
  };
}

export interface FiveSecondQuestion {
  id: string;
  question: string;
  type: 'open_text' | 'multiple_choice' | 'rating';
  options?: string[];
  required: boolean;
}

// 9. Card Sort Block
export interface CardSortBlock extends BaseBlock {
  type: 'card_sort';
  instructions: string;
  sortType: 'open' | 'closed' | 'hybrid';
  cards: CardSortItem[];
  categories?: CardSortCategory[];
  settings: {
    allowNewCategories: boolean;
    maxCategories?: number;
    minCardsPerCategory?: number;
    maxCardsPerCategory?: number;
    randomizeCards: boolean;
  };
  completionCriteria: {
    requireAllCards: boolean;
    allowUncategorized: boolean;
  };
}

export interface CardSortItem {
  id: string;
  text: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CardSortCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
}

// 10. Tree Test Block
export interface TreeTestBlock extends BaseBlock {
  type: 'tree_test';
  instructions: string;
  tree: TreeNode[];
  tasks: TreeTestTask[];
  settings: {
    showBreadcrumbs: boolean;
    allowBackNavigation: boolean;
    highlightPath: boolean;
    randomizeTasks: boolean;
  };
  completionCriteria: {
    requireAllTasks: boolean;
    maxAttempts?: number;
    timeLimit?: number;
  };
}

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  isDestination?: boolean;
  metadata?: Record<string, unknown>;
}

export interface TreeTestTask {
  id: string;
  scenario: string;
  expectedPath: string[];
  successCriteria: {
    exactMatch?: boolean;
    allowAlternatives?: string[][];
    maxClicks?: number;
  };
}

// 11. Thank You Block
export interface ThankYouBlock extends BaseBlock {
  type: 'thank_you';
  message: string;
  showSummary: boolean;
  nextSteps?: string;
  contact?: {
    email?: string;
    website?: string;
    social?: string;
  };
  completion?: {
    showCertificate: boolean;
    showReward: boolean;
    downloadResults: boolean;
  };
}

// 12. Image Upload Block
export interface ImageUploadBlock extends BaseBlock {
  type: 'image_upload';
  instructions: string;
  uploadSettings: {
    maxFiles: number;
    maxSizeBytes: number;
    allowedFormats: string[];
    requireDescription: boolean;
  };
  prompt?: string;
}

// 13. File Upload Block
export interface FileUploadBlock extends BaseBlock {
  type: 'file_upload';
  instructions: string;
  uploadSettings: {
    maxFiles: number;
    maxSizeBytes: number;
    allowedFormats: string[];
    requireDescription: boolean;
  };
  prompt?: string;
}

// 14. Screener Block
export interface ScreenerBlock extends BaseBlock {
  type: 'screener';
  questions: ScreeningQuestion[];
  logic: ScreeningLogic;
  settings: {
    randomizeQuestions: boolean;
    allowPartialCompletion: boolean;
    showProgress: boolean;
  };
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'yes_no' | 'number' | 'date';
  options?: string[];
  required: boolean;
  disqualifyAnswers?: string[];
  skipLogic?: ConditionalAction;
}

export interface ScreeningLogic {
  qualificationCriteria: QualificationCriterion[];
  disqualificationRules: DisqualificationRule[];
  quotas?: QuotaRule[];
}

export interface QualificationCriterion {
  id: string;
  questionId: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: unknown;
  weight?: number;
}

export interface DisqualificationRule {
  id: string;
  questionId: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: unknown;
  message?: string;
}

export interface QuotaRule {
  id: string;
  name: string;
  target: number;
  current: number;
  criteria: QualificationCriterion[];
}

// 15. Prototype Test Block
export interface PrototypeTestBlock extends BaseBlock {
  type: 'prototype_test';
  prototypeUrl: string;
  prototypeType: 'figma' | 'invision' | 'marvel' | 'framer' | 'principle' | 'url';
  tasks: PrototypeTask[];
  settings: {
    recordInteractions: boolean;
    trackClicks: boolean;
    trackScrolling: boolean;
    trackTime: boolean;
    allowZoom: boolean;
    allowFullscreen: boolean;
  };
}

export interface PrototypeTask {
  id: string;
  title: string;
  description: string;
  successCriteria: string[];
  timeLimit?: number;
  startUrl?: string;
  expectedFlow?: string[];
}

// 16. Live Website Test Block
export interface LiveWebsiteTestBlock extends BaseBlock {
  type: 'live_website_test';
  websiteUrl: string;
  tasks: WebsiteTask[];
  settings: {
    recordScreen: boolean;
    trackClicks: boolean;
    trackScrolling: boolean;
    trackMouseMovement: boolean;
    allowNavigation: boolean;
    restrictToDomain: boolean;
    captureConsoleErrors: boolean;
  };
}

export interface WebsiteTask {
  id: string;
  title: string;
  description: string;
  startUrl?: string;
  successCriteria: string[];
  timeLimit?: number;
  allowBackButton: boolean;
}

// ============================================================================
// STUDY BUILDER INTEGRATION TYPES
// ============================================================================

// StudyBuilderBlock interface used in StudyBuilder components
export interface StudyBuilderBlock {
  id: string;
  type: BlockType;
  order: number;
  title: string;
  description: string;
  settings: Record<string, unknown>;
}

// ============================================================================
// STUDY BLOCKS TEMPLATES SYSTEM
// ============================================================================

export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  blockType: BlockType;
  defaultSettings: BlockSettings;
  previewData?: unknown;
  metadata: BlockMetadata;
  usage: {
    usageCount: number;
    popularity: number;
    rating: number;
    studyTypes: string[];
  };
  customization: {
    allowCustomization: boolean;
    customizableFields: string[];
    presets?: BlockPreset[];
  };
}

export interface BlockPreset {
  id: string;
  name: string;
  description: string;
  settings: Partial<BlockSettings>;
  previewData?: unknown;
}

export interface StudyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  blocks: BaseBlock[];
  metadata: {
    estimatedDuration: number;
    participantCount: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    studyTypes: string[];
    tags: string[];
    author?: string;
    version: string;
    lastModified: Date;
  };
  usage: {
    usageCount: number;
    popularity: number;
    rating: number;
    reviews?: TemplateReview[];
  };
  customization: {
    allowCustomization: boolean;
    customizableBlocks: string[];
    requiredBlocks: string[];
  };
}

export interface TemplateReview {
  id: string;
  userId: string;
  rating: number;
  comment?: string;
  tags: string[];
  createdAt: Date;
}

// ============================================================================
// STUDY INTERFACE UPDATES
// ============================================================================

// Updated Study interface to support blocks
export interface IStudyV2 extends Omit<IStudy, 'type' | 'tasks'> {
  type: 'usability_test' | 'user_interview' | 'survey';
  blocks: BaseBlock[]; // New blocks-based system
  tasks?: string[] | ITask[]; // Legacy tasks for backward compatibility
  builderVersion: 'legacy' | 'blocks';
  template?: {
    id: string;
    name: string;
    customizations?: Record<string, unknown>;
  };
}

// Legacy compatibility interfaces removed - now using StudyBuilderBlock instead

export interface StudyBuilderType {
  id: string;
  name: string;
  description: string;
  icon?: string;
  allowedBlocks: BlockType[]; // Updated from allowedTasks to allowedBlocks
  forbiddenBlocks: BlockType[]; // Updated from forbiddenTasks to forbiddenBlocks
  maxBlocks: number; // Updated from maxTasks to maxBlocks
  minBlocks: number; // Updated from minTasks to minBlocks
  recordingRecommended: boolean;
  features: string[];
  defaultBlocks?: BlockType[]; // New: suggested blocks for this study type
  analytics: {
    trackUserJourney: boolean;
    trackDropoffPoints: boolean;
    generateInsights: boolean;
  };
}

// ============================================================================
// UNION TYPES AND TYPE ALIASES
// ============================================================================

// Union type for all specific block types
export type StudyBlock = 
  | WelcomeBlock
  | OpenQuestionBlock
  | OpinionScaleBlock
  | SimpleInputBlock
  | MultipleChoiceBlock
  | ContextScreenBlock
  | YesNoBlock
  | FiveSecondTestBlock
  | CardSortBlock
  | TreeTestBlock
  | ThankYouBlock
  | ImageUploadBlock
  | FileUploadBlock
  | ScreenerBlock
  | PrototypeTestBlock
  | LiveWebsiteTestBlock;

// Utility types for block operations
export type BlockUnion = StudyBlock;
export type StudyTypeUnion = IStudy['type'] | 'usability_test' | 'user_interview' | 'survey';

// Block response interfaces
export interface BlockResponse {
  blockId: string;
  blockType: BlockType;
  startedAt: Date;
  completedAt?: Date;
  duration: number;
  response: unknown;
  metadata?: {
    attempts: number;
    interactions: number;
    validationErrors: string[];
    userAgent?: string;
    viewport?: { width: number; height: number };
  };
}

// Block analytics interfaces
export interface BlockAnalytics {
  blockId: string;
  blockType: BlockType;
  metrics: {
    completionRate: number;
    averageTime: number;
    dropoffRate: number;
    interactionCount: number;
    errorRate: number;
    satisfactionScore?: number;
  };
  insights: {
    commonErrors: string[];
    userPatterns: string[];
    optimizationSuggestions: string[];
  };
}

// Type aliases for convenience
export type User = IUser;
export type Study = IStudy;
export type StudyV2 = IStudyV2;
export type Session = ISession;
export type Task = ITask; // Legacy compatibility
export type Block = StudyBlock;
export type Recording = IRecording;
export type Feedback = IFeedback;
export type Subscription = ISubscription;
export type Participant = IParticipant;
export type ParticipantApplication = IParticipantApplication;

// Enum types - Updated with block types
export type UserRole = 'researcher' | 'participant' | 'admin' | 'super_admin';
export type StudyType = 'usability' | 'survey' | 'interview' | 'card-sorting' | 'a-b-testing' | 'prototype';
export type StudyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type TaskType = 'navigation' | 'interaction' | 'questionnaire' | 'feedback'; // Legacy
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

// New block-specific enum types
export type BlockStatus = 'draft' | 'active' | 'completed' | 'skipped' | 'error';
export type BlockDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type BlockCategory = 'welcome' | 'data_collection' | 'interaction' | 'feedback' | 'testing' | 'navigation';

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

// Legacy task type constants
export const TaskType = {
  NAVIGATION: 'navigation' as const,
  INTERACTION: 'interaction' as const,
  QUESTIONNAIRE: 'questionnaire' as const,
  FEEDBACK: 'feedback' as const
} as const;

// New block type constants
export const BlockType = {
  WELCOME: 'welcome' as const,
  OPEN_QUESTION: 'open_question' as const,
  OPINION_SCALE: 'opinion_scale' as const,
  SIMPLE_INPUT: 'simple_input' as const,
  MULTIPLE_CHOICE: 'multiple_choice' as const,
  CONTEXT_SCREEN: 'context_screen' as const,
  YES_NO: 'yes_no' as const,
  FIVE_SECOND_TEST: 'five_second_test' as const,
  CARD_SORT: 'card_sort' as const,
  TREE_TEST: 'tree_test' as const
} as const;

export const BlockStatus = {
  DRAFT: 'draft' as const,
  ACTIVE: 'active' as const,
  COMPLETED: 'completed' as const,
  SKIPPED: 'skipped' as const,
  ERROR: 'error' as const
} as const;

export const BlockDifficulty = {
  BEGINNER: 'beginner' as const,
  INTERMEDIATE: 'intermediate' as const,
  ADVANCED: 'advanced' as const
} as const;

export const BlockCategory = {
  WELCOME: 'welcome' as const,
  DATA_COLLECTION: 'data_collection' as const,
  INTERACTION: 'interaction' as const,
  FEEDBACK: 'feedback' as const,
  TESTING: 'testing' as const,
  NAVIGATION: 'navigation' as const
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

// Template category constants based on Maze analysis
export const TEMPLATE_CATEGORIES = {
  'usability-testing': 'Usability Testing',
  'content-testing': 'Content Testing', 
  'feedback-survey': 'Feedback Survey',
  'user-interviews': 'User Interviews',
  'concept-validation': 'Concept Validation'
} as const;

export type TemplateCategory = keyof typeof TEMPLATE_CATEGORIES;

// Variable system for template customization
export interface TemplateVariable {
  key: string;
  label: string;
  defaultValue: string;
  placeholder: string;
  required: boolean;
  type: 'text' | 'url' | 'number';
}

// Enhanced template interface with variable support
export interface EnhancedStudyTemplate extends StudyTemplate {
  variables?: TemplateVariable[];
  categoryType: TemplateCategory;
  benefits: string[];
  whenToUse: string;
  insights: string[];
  estimatedTime: string;
  recommendedParticipants: string;
}

// Simplified study types based on Maze analysis
export const STUDY_TYPES = {
  'unmoderated': {
    id: 'unmoderated',
    name: 'Unmoderated Study',
    description: 'Set up surveys and usability tests for prototypes, websites, and apps.',
    icon: 'Users',
    recommended: true,
    features: ['Screen recording', 'Click tracking', 'Automated analysis', 'Scalable testing']
  },
  'moderated': {
    id: 'moderated', 
    name: 'Moderated Session',
    description: 'Schedule and run interviews, then turn insights into actionable data.',
    icon: 'Video',
    recommended: false,
    features: ['Live interaction', 'Real-time probing', 'Deep insights', 'Flexible discussion']
  }
} as const;

export type SimplifiedStudyType = keyof typeof STUDY_TYPES;

// Enhanced block descriptions based on Maze analysis
export const ENHANCED_BLOCK_DESCRIPTIONS = {
  'welcome': {
    displayName: 'Welcome Screen',
    description: 'Set the stage - Introduce your study and make participants feel comfortable',
    category: 'Introduction',
    icon: 'Hand',
    estimatedTime: '30 seconds',
    whenToUse: 'Start every study to provide context and instructions'
  },
  'five_second_test': {
    displayName: '5-Second Test',
    description: 'First Impression Testing - Show your design for 5 seconds and gather immediate feedback',
    category: 'Visual Testing',
    icon: 'Timer',
    estimatedTime: '2-3 minutes',
    whenToUse: 'Test initial reactions to designs, layouts, or landing pages'
  },
  'opinion_scale': {
    displayName: 'Rating & Satisfaction',
    description: 'Quantitative Feedback - Collect ratings and satisfaction scores with visual scales',
    category: 'Quantitative',
    icon: 'Star',
    estimatedTime: '1-2 minutes',
    whenToUse: 'Measure satisfaction, ease of use, or likelihood to recommend'
  },
  'open_question': {
    displayName: 'Qualitative Insights',
    description: 'Deep Understanding - Gather detailed feedback and understand user motivations',
    category: 'Qualitative',
    icon: 'MessageCircle',
    estimatedTime: '2-4 minutes',
    whenToUse: 'Understand the "why" behind user behaviors and preferences'
  },
  'yes_no': {
    displayName: 'Quick Decisions',
    description: 'Binary Feedback - Get clear yes/no answers on specific features or concepts',
    category: 'Validation',
    icon: 'CheckCircle',
    estimatedTime: '30 seconds',
    whenToUse: 'Validate assumptions or get quick decisions on features'
  },
  'multiple_choice': {
    displayName: 'Multiple Choice',
    description: 'Structured Options - Present specific choices and analyze user preferences',
    category: 'Selection',
    icon: 'List',
    estimatedTime: '1-2 minutes',
    whenToUse: 'When you need users to select from predefined options'
  },
  'simple_input': {
    displayName: 'Data Collection',
    description: 'Structured Input - Collect specific information like names, ages, or URLs',
    category: 'Data Entry',
    icon: 'Edit3',
    estimatedTime: '1-2 minutes',
    whenToUse: 'Gather demographic data or specific user information'
  },
  'context_screen': {
    displayName: 'Instructions & Context',
    description: 'Guidance Screen - Provide instructions or context between different study sections',
    category: 'Navigation',
    icon: 'Info',
    estimatedTime: '30 seconds',
    whenToUse: 'Break up long studies or provide task-specific instructions'
  },
  'prototype_test': {
    displayName: 'Interactive Testing',
    description: 'Live Interaction - Test real user interactions with your designs and prototypes',
    category: 'Interaction',
    icon: 'MousePointer',
    estimatedTime: '3-5 minutes',
    whenToUse: 'Test actual user flows and interaction patterns'
  },
  'card_sort': {
    displayName: 'Information Architecture',
    description: 'Organization Testing - Understand how users categorize and organize information',
    category: 'Architecture',
    icon: 'Grid',
    estimatedTime: '5-8 minutes',
    whenToUse: 'Design navigation structures or organize content categories'
  },
  'tree_test': {
    displayName: 'Navigation Testing',
    description: 'Findability Test - Evaluate how easily users can find information in your structure',
    category: 'Navigation',
    icon: 'GitBranch',
    estimatedTime: '3-5 minutes',
    whenToUse: 'Test information architecture and navigation effectiveness'
  },
  'thank_you': {
    displayName: 'Study Completion',
    description: 'Appreciation Message - Thank participants and provide next steps or rewards',
    category: 'Completion',
    icon: 'Heart',
    estimatedTime: '30 seconds',
    whenToUse: 'End every study with gratitude and clear completion confirmation'
  },
  'image_upload': {
    displayName: 'Visual Upload',
    description: 'Image Collection - Gather visual content and screenshots from participants',
    category: 'Media',
    icon: 'Image',
    estimatedTime: '2-3 minutes',
    whenToUse: 'Collect visual feedback, screenshots, or user-generated images'
  },
  'file_upload': {
    displayName: 'Document Collection',
    description: 'File Sharing - Allow participants to upload documents, PDFs, or other files',
    category: 'Media',
    icon: 'Upload',
    estimatedTime: '2-3 minutes',
    whenToUse: 'Collect documents, resumes, or other file-based feedback'
  }
} as const;

// ============================================================================
// COLLABORATIVE WORKSPACE SYSTEM - Phase 3: Collaborative Features
// ============================================================================

// Workspace types for team collaboration
export interface IWorkspace {
  _id: string;
  name: string;
  description?: string;
  slug: string; // URL-friendly identifier
  owner: string | IUser;
  settings: WorkspaceSettings;
  members: WorkspaceMember[];
  subscription?: WorkspaceSubscription;
  usage: WorkspaceUsage;
  billing?: WorkspaceBilling;
  status: 'active' | 'suspended' | 'archived';
  features: WorkspaceFeatures;
  branding?: WorkspaceBranding;
  integrations?: WorkspaceIntegration[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  visibility: 'private' | 'public' | 'invite_only';
  defaultStudyVisibility: 'private' | 'team' | 'public';
  allowGuestInvites: boolean;
  requireApprovalForStudies: boolean;
  requireApprovalForPublishing: boolean;
  autoArchiveInactiveStudies: boolean;
  autoArchiveDays?: number;
  enforceTemplateUsage: boolean;
  allowCustomBranding: boolean;
  timezone: string;
  language: string;
  notifications: WorkspaceNotificationSettings;
}

export interface WorkspaceNotificationSettings {
  emailNotifications: boolean;
  studyStarted: boolean;
  studyCompleted: boolean;
  newMemberJoined: boolean;
  pendingApprovals: boolean;
  weeklyDigest: boolean;
  slackIntegration?: {
    enabled: boolean;
    webhookUrl?: string;
    channels?: string[];
  };
}

export interface WorkspaceMember {
  _id: string;
  userId: string | IUser;
  workspaceId: string;
  role: WorkspaceRole;
  permissions: WorkspacePermissions;
  status: 'active' | 'invited' | 'suspended' | 'removed';
  invitedBy?: string | IUser;
  invitedAt?: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;
  metadata?: {
    department?: string;
    jobTitle?: string;
    location?: string;
    phoneNumber?: string;
    customFields?: Record<string, unknown>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceRole = 
  | 'owner'        // Full control, billing access
  | 'admin'        // Manage members, settings, approve studies
  | 'editor'       // Create and edit studies, manage participants
  | 'viewer'       // View studies and results, no editing
  | 'collaborator' // Edit assigned studies only
  | 'guest';       // Limited access to specific studies

export interface WorkspacePermissions {
  studies: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    publish: boolean;
    archive: boolean;
    viewAll: boolean;
    exportData: boolean;
  };
  members: {
    invite: boolean;
    remove: boolean;
    changeRoles: boolean;
    viewAll: boolean;
  };
  workspace: {
    editSettings: boolean;
    manageBilling: boolean;
    manageIntegrations: boolean;
    viewAnalytics: boolean;
    exportData: boolean;
  };
  approvals: {
    approveStudies: boolean;
    approvePublishing: boolean;
    viewPendingApprovals: boolean;
  };
}

export interface WorkspaceSubscription {
  plan: 'free' | 'team' | 'business' | 'enterprise';
  status: 'active' | 'trial' | 'canceled' | 'past_due' | 'expired';
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt?: Date;
  features: WorkspaceFeatures;
  limits: WorkspaceLimits;
  addOns?: WorkspaceAddOn[];
}

export interface WorkspaceFeatures {
  maxMembers: number;
  maxStudies: number;
  maxParticipantsPerStudy: number;
  recordingMinutes: number;
  advancedAnalytics: boolean;
  customBranding: boolean;
  ssoIntegration: boolean;
  apiAccess: boolean;
  whitelabelReports: boolean;
  prioritySupport: boolean;
  collaborativeEditing: boolean;
  approvalWorkflows: boolean;
  advancedPermissions: boolean;
  dataRetention: number; // days
  exportFormats: string[];
  integrations: string[];
}

export interface WorkspaceLimits {
  members: number;
  studies: number;
  monthlyParticipants: number;
  recordingMinutes: number;
  dataExports: number;
  apiCalls: number;
}

export interface WorkspaceAddOn {
  id: string;
  name: string;
  type: 'extra_members' | 'extra_recording' | 'advanced_analytics' | 'custom_integration';
  quantity: number;
  pricePerUnit: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
}

export interface WorkspaceUsage {
  currentPeriod: {
    studiesCreated: number;
    participantsRecruited: number;
    recordingMinutesUsed: number;
    dataExports: number;
    apiCallsUsed: number;
    activeMembers: number;
  };
  historical: {
    totalStudiesCreated: number;
    totalParticipants: number;
    totalRecordingMinutes: number;
    totalDataExports: number;
  };
  lastUpdated: Date;
}

export interface WorkspaceBilling {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paymentMethod?: {
    type: 'card' | 'bank_account';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
  invoiceEmails?: string[];
  nextInvoiceDate?: Date;
  nextInvoiceAmount?: number;
  currency: string;
}

export interface WorkspaceBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
  customEmailDomain?: string;
  emailTemplates?: {
    studyInvitation?: string;
    studyCompletion?: string;
    studyReminder?: string;
  };
  reportingTemplate?: string;
}

export interface WorkspaceIntegration {
  id: string;
  type: 'slack' | 'teams' | 'figma' | 'jira' | 'confluence' | 'zapier' | 'webhook' | 'sso';
  name: string;
  status: 'active' | 'error' | 'disabled';
  settings: Record<string, unknown>;
  lastSyncAt?: Date;
  errorMessage?: string;
  createdBy: string | IUser;
  createdAt: Date;
  updatedAt: Date;
}

// Invitation types
export interface IWorkspaceInvitation {
  _id: string;
  workspaceId: string | IWorkspace;
  email: string;
  role: WorkspaceRole;
  permissions?: Partial<WorkspacePermissions>;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';
  invitedBy: string | IUser;
  invitedAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  revokedAt?: Date;
  token: string;
  message?: string;
  metadata?: {
    source?: 'manual' | 'bulk' | 'api';
    customMessage?: string;
    remindersSent?: number;
    lastReminderAt?: Date;
  };
}

// Team collaboration on studies
export interface IStudyCollaboration {
  _id: string;
  studyId: string | IStudy;
  workspaceId: string | IWorkspace;
  collaborators: StudyCollaborator[];
  permissions: StudyCollaborationPermissions;
  settings: StudyCollaborationSettings;
  activity: CollaborationActivity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyCollaborator {
  userId: string | IUser;
  role: 'owner' | 'editor' | 'viewer' | 'reviewer';
  permissions: StudyCollaboratorPermissions;
  addedBy: string | IUser;
  addedAt: Date;
  lastActiveAt?: Date;
  isActive: boolean;
}

export interface StudyCollaboratorPermissions {
  editStudy: boolean;
  editBlocks: boolean;
  inviteParticipants: boolean;
  viewResults: boolean;
  exportData: boolean;
  manageParticipants: boolean;
  publishStudy: boolean;
  archiveStudy: boolean;
  addCollaborators: boolean;
}

export interface StudyCollaborationPermissions {
  allowRealTimeEditing: boolean;
  requireApprovalToPublish: boolean;
  allowComments: boolean;
  allowSuggestions: boolean;
  trackChanges: boolean;
  versionControl: boolean;
  lockEditingSections: boolean;
}

export interface StudyCollaborationSettings {
  notifications: {
    onChanges: boolean;
    onComments: boolean;
    onPublish: boolean;
    onParticipantResponse: boolean;
  };
  realTime: {
    enabled: boolean;
    showCursors: boolean;
    showActiveUsers: boolean;
    conflictResolution: 'manual' | 'auto' | 'last_writer_wins';
  };
  versioning: {
    enabled: boolean;
    autoSave: boolean;
    saveInterval: number; // minutes
    maxVersions: number;
  };
}

// Approval workflow system
export interface IApprovalWorkflow {
  _id: string;
  workspaceId: string | IWorkspace;
  name: string;
  description?: string;
  type: 'study_creation' | 'study_publishing' | 'participant_recruitment' | 'data_export' | 'custom';
  status: 'active' | 'inactive' | 'draft';
  stages: ApprovalStage[];
  settings: ApprovalWorkflowSettings;
  triggers: ApprovalTrigger[];
  createdBy: string | IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStage {
  _id: string;
  name: string;
  description?: string;
  order: number;
  type: 'single_approver' | 'multiple_approvers' | 'consensus' | 'automated';
  approvers: ApprovalStageApprover[];
  requirements: ApprovalRequirements;
  settings: ApprovalStageSettings;
  timeouts: ApprovalTimeouts;
}

export interface ApprovalStageApprover {
  userId?: string | IUser;
  role?: WorkspaceRole;
  type: 'user' | 'role' | 'anyone_with_permission';
  isRequired: boolean;
  canDelegate: boolean;
  weight?: number; // for weighted voting
}

export interface ApprovalRequirements {
  minimumApprovers?: number;
  requireAllApprovers?: boolean;
  allowSelfApproval?: boolean;
  requireComments?: boolean;
  requireReasons?: boolean;
  customCriteria?: ApprovalCriterion[];
}

export interface ApprovalCriterion {
  id: string;
  name: string;
  description: string;
  type: 'checkbox' | 'rating' | 'text' | 'file_upload';
  required: boolean;
  options?: string[];
  validationRules?: ValidationRule[];
}

export interface ApprovalStageSettings {
  allowParallelApproval: boolean;
  autoAdvanceOnApproval: boolean;
  notifyAllApprovers: boolean;
  escalationEnabled: boolean;
  reminderEnabled: boolean;
  delegationEnabled: boolean;
}

export interface ApprovalTimeouts {
  responseTimeout?: number; // hours
  escalationTimeout?: number; // hours
  autoApprovalTimeout?: number; // hours
  reminderInterval?: number; // hours
  maxReminders?: number;
}

export interface ApprovalWorkflowSettings {
  autoStart: boolean;
  allowSkipStages: boolean;
  requireSequentialApproval: boolean;
  allowWithdrawal: boolean;
  notifyOnStart: boolean;
  notifyOnComplete: boolean;
  retainHistory: boolean;
  historyRetentionDays: number;
}

export interface ApprovalTrigger {
  type: 'manual' | 'automatic' | 'scheduled' | 'conditional';
  conditions?: LogicalCondition[];
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
}

// Approval request for specific items
export interface IApprovalRequest {
  _id: string;
  workflowId: string | IApprovalWorkflow;
  workspaceId: string | IWorkspace;
  itemType: 'study' | 'participant_recruitment' | 'data_export' | 'template' | 'custom';
  itemId: string;
  requestedBy: string | IUser;
  currentStage: number;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'expired' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  responses: ApprovalResponse[];
  metadata: ApprovalRequestMetadata;
  deadlines: ApprovalDeadlines;
  notifications: ApprovalNotification[];
  history: ApprovalHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalResponse {
  _id: string;
  stageId: string;
  approverId: string | IUser;
  decision: 'approved' | 'rejected' | 'delegated' | 'escalated';
  comments?: string;
  reasons?: string[];
  attachments?: string[];
  criteriaResponses?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  respondedAt: Date;
  delegatedTo?: string | IUser;
}

export interface ApprovalRequestMetadata {
  title: string;
  description: string;
  requestedChanges?: string[];
  businessJustification?: string;
  impactAssessment?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  customFields?: Record<string, unknown>;
  attachments?: ApprovalAttachment[];
}

export interface ApprovalAttachment {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'spreadsheet' | 'other';
  url: string;
  size: number;
  uploadedBy: string | IUser;
  uploadedAt: Date;
}

export interface ApprovalDeadlines {
  requestedBy?: Date;
  escalationAt?: Date;
  hardDeadline?: Date;
  autoApprovalAt?: Date;
}

export interface ApprovalNotification {
  type: 'request_created' | 'response_required' | 'decision_made' | 'deadline_approaching' | 'escalated';
  sentTo: string[];
  sentAt: Date;
  method: 'email' | 'in_app' | 'slack' | 'teams';
  acknowledged?: Date;
}

export interface ApprovalHistoryEntry {
  _id: string;
  action: string;
  actorId: string | IUser;
  timestamp: Date;
  details?: Record<string, unknown>;
  previousState?: unknown;
  newState?: unknown;
}

// Real-time collaboration types
export interface ICollaborationSession {
  _id: string;
  studyId: string | IStudy;
  workspaceId: string | IWorkspace;
  activeUsers: ActiveCollaborator[];
  locks: CollaborationLock[];
  cursors: UserCursor[];
  changes: CollaborationChange[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActiveCollaborator {
  userId: string | IUser;
  sessionId: string;
  status: 'active' | 'idle' | 'offline';
  lastSeen: Date;
  currentBlock?: string;
  currentSection?: string;
  permissions: StudyCollaboratorPermissions;
  cursor?: UserCursor;
}

export interface UserCursor {
  userId: string;
  position: {
    blockId?: string;
    elementId?: string;
    x?: number;
    y?: number;
  };
  selection?: {
    start: number;
    end: number;
    text?: string;
  };
  lastMoved: Date;
}

export interface CollaborationLock {
  id: string;
  type: 'block' | 'section' | 'settings' | 'participants';
  resourceId: string;
  lockedBy: string | IUser;
  lockedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface CollaborationChange {
  _id: string;
  type: 'insert' | 'update' | 'delete' | 'move';
  userId: string | IUser;
  timestamp: Date;
  path: string; // JSON path to the changed property
  oldValue?: unknown;
  newValue?: unknown;
  blockId?: string;
  conflict?: boolean;
  resolved?: boolean;
  resolvedBy?: string | IUser;
  resolvedAt?: Date;
}

// Collaborator presence for real-time indicators
export interface CollaboratorPresence {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: WorkspaceRole;
  status: 'active' | 'idle' | 'away' | 'offline';
  lastActive: Date;
  lastSeen?: Date; // Added for compatibility with existing code
  currentLocation?: {
    studyId?: string;
    blockId?: string;
    section?: string;
  };
  currentElement?: string; // Added for compatibility with existing code
  sessionId?: string;
}

// Editing status for live collaboration
export interface EditingStatus {
  collaboratorId: string;
  elementType: 'block' | 'setting' | 'participant' | 'template';
  elementId?: string;
  action: 'editing' | 'viewing' | 'commenting';
  startedAt: Date;
  lastUpdate: Date;
}

// Activity types for activity feed
export interface CollaborationActivity {
  id: string;
  type: 'user_joined' | 'user_left' | 'block_added' | 'block_edited' | 'block_removed' | 
        'comment_added' | 'study_published' | 'participant_invited' | 'approval_requested' |
        'template_applied' | 'settings_changed';
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string; // Human-readable action description
  timestamp: Date;
  entityType?: 'study' | 'block' | 'participant' | 'template' | 'workspace';
  entityId?: string;
  entityName?: string;
  metadata?: {
    oldValue?: unknown;
    newValue?: unknown;
    blockType?: string;
    changes?: string[];
    location?: string;
  };
  priority: 'low' | 'medium' | 'high';
  category: 'content' | 'collaboration' | 'administration' | 'system';
}

// ============================================================================
// COMMENT SYSTEM TYPES
// ============================================================================

export interface IStudyComment {
  _id: string;
  studyId: string;
  blockId?: string;
  userId: string | IUser;
  authorId?: string; // Added for compatibility with existing code
  parentId?: string; // for threaded comments
  parentCommentId?: string; // Alternative property name used in some components
  content: string;
  type: 'comment' | 'suggestion' | 'issue' | 'question';
  status: 'open' | 'resolved' | 'acknowledged' | 'dismissed';
  position?: {
    blockId?: string;
    elementId?: string;
    x?: number;
    y?: number;
  };
  mentions?: string[]; // user IDs mentioned in the comment
  attachments?: CommentAttachment[];
  reactions?: CommentReaction[];
  metadata?: Record<string, unknown>;
  resolvedBy?: string | IUser;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'link';
  url: string;
  size?: number;
  thumbnailUrl?: string;
}

export interface CommentReaction {
  userId: string | IUser;
  emoji: string;
  addedAt: Date;
}

// ============================================================================
// APPROVAL WORKFLOW TYPES
// ============================================================================

export interface ApprovalItem {
  id: string;
  studyId: string;
  title: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  type: 'new_study' | 'study_modification' | 'template_creation' | 'participant_criteria';
  submittedAt: Date;
  lastUpdated: Date;
  description?: string;
  reviewers?: string[];
  approvedBy?: string;
  rejectedBy?: string;
  comments?: IStudyComment[];
  attachments?: string[];
  deadline?: Date;
  estimatedReviewTime?: number;
}

// ============================================================================
// ACTIVITY FEED TYPES  
// ============================================================================

export interface ActivityUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: WorkspaceRole;
}

export interface ActivityItem {
  id: string;
  type: 'user_joined' | 'user_left' | 'block_added' | 'block_edited' | 'block_removed' | 
        'comment_added' | 'study_published' | 'participant_invited' | 'approval_requested' | 
        'template_applied' | 'settings_changed' | 'study_approved' | 'study_rejected';
  user: ActivityUser;
  timestamp: Date;
  description: string;
  metadata?: {
    studyId?: string;
    blockId?: string;
    blockType?: string;
    commentId?: string;
    templateId?: string;
    participantCount?: number;
    changes?: string[];
    reason?: string;
    priority?: string;
    status?: string;
  };
  entityType?: 'study' | 'block' | 'comment' | 'template' | 'user' | 'workspace';
  entityId?: string;
  isRead?: boolean;
  importance?: 'low' | 'medium' | 'high';
}

// ============================================================================
