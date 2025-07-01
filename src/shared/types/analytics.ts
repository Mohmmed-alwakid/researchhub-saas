// Analytics types for the ResearchHub analytics system
export interface AnalyticsOverview {
  totalParticipants: number;
  totalResponses: number;
  completionRate: number;
  avgSessionTime: number;
  studyStatus: string;
  lastResponseAt: number | null;
}

export interface BlockInfo {
  totalBlocks: number;
  responsesByBlock: Record<string, number>;
  blockTypes: string[];
}

export interface TimelineData {
  date: string;
  count: number;
  uniqueParticipants: number;
}

export interface RecentResponse {
  id: string;
  blockId: string;
  sessionId: string;
  createdAt: string;
  responsePreview: string;
}

export interface OverviewAnalyticsData {
  overview: AnalyticsOverview;
  blocks: BlockInfo;
  timeline: TimelineData[];
  recentResponses: RecentResponse[];
}

export interface ResponseSummary {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  averageResponsesPerSession: number;
  totalResponseTime: number;
  averageSessionTime: number;
}

export interface DropoffAnalysis {
  dropoffPoints: Record<string, number>;
  mostCommonDropoff: string;
  dropoffRate: number;
}

export interface TimeAnalysis {
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  timeDistribution: {
    under_1_min: number;
    '1_to_5_min': number;
    '5_to_15_min': number;
    over_15_min: number;
  };
}

export interface ResponseQuality {
  totalTextResponses: number;
  averageLength: number;
  qualityDistribution: {
    short: number;
    medium: number;
    long: number;
  };
  engagementScore: number;
}

export interface BlockPerformance {
  blockId: string;
  blockType: string;
  title: string;
  responses: number;
  responseRate: number;
  averageTime: number;
  skipRate: number;
}

export interface ParticipantJourney {
  step: number;
  blockId: string;
  blockType: string;
  title: string;
  participants: number;
  conversionRate: number;
  dropoffFromPrevious: number;
}

export interface ResponseAnalyticsData {
  summary: ResponseSummary;
  dropoffAnalysis: DropoffAnalysis;
  timeAnalysis: TimeAnalysis;
  responseQuality: ResponseQuality;
  blockPerformance: BlockPerformance[];
  participantJourney: ParticipantJourney[];
}

// UI component types
export interface SessionData {
  date: string;
  sessions: number;
  completed: number;
}

export interface TaskCompletion {
  task: string;
  completion: number;
  avgTime: number;
}

export interface DeviceBreakdown {
  device: string;
  value: number;
  color: string;
}

export interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
  eventType: 'click' | 'move' | 'scroll';
  timestamp: number;
}

export interface EventData {
  id: string;
  timestamp: number;
  type: 'click' | 'scroll' | 'move';
  x: number;
  y: number;
  element?: string;
}

export interface SessionReplayData {
  id: string;
  participantId: string;
  startTime: string;
  duration: number;
  completionRate: number;
  recordingUrl: string;
  events: EventData[];
}

export interface AnalyticsUIData {
  overview: {
    totalSessions: number;
    completedSessions: number;
    averageDuration: number;
    completionRate: number;
    bounceRate: number;
    userSatisfaction: number;
  };
  sessionsByDay: SessionData[];
  taskCompletion: TaskCompletion[];
  deviceBreakdown: DeviceBreakdown[];
  heatmapData: HeatmapData[];
  sessions: SessionReplayData[];
  rawOverview?: OverviewAnalyticsData;
  rawResponses?: ResponseAnalyticsData;
}
