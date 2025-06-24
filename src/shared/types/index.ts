import type { Request } from 'express';
// import type { IUserDocument } from '../../database/models/index.js';

// Temporary user document interface
interface IUserDocument extends IUser {
  save(): Promise<void>;
}

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

// Participant types
export interface IParticipant {
  _id: string;
  studyId: string;
  researcherId: string;
  email: string;
  firstName: string;
  lastName: string;
  demographics?: Record<string, unknown>;
  status: 'invited' | 'accepted' | 'declined' | 'completed' | 'no_show';
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
  | 'thank_you';

// Block settings interface
export interface BlockSettings {
  [key: string]: unknown;
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
  | TreeTestBlock;

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
