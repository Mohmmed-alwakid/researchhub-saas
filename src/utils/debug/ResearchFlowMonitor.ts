/**
 * 📊 Research Flow Monitor for ResearchHub
 * Track study creation flows and participant journeys with drop-off detection
 */

interface StudyFlowData {
  type: 'study_creation' | 'study_edit' | 'study_launch' | 'study_complete';
  startTime: number;
  endTime?: number;
  steps: StudyFlowStep[];
  researcher: string;
  templateUsed?: string;
  blocksCount: number;
  duration?: number;
  completionRate: number;
  dropOffPoint?: string;
  errors: FlowError[];
}

interface StudyFlowStep {
  stepName: string;
  timestamp: number;
  duration: number;
  data?: Record<string, unknown>;
  success: boolean;
  errors?: string[];
}

interface ParticipantJourney {
  participantId: string;
  studyId: string;
  startTime: number;
  endTime?: number;
  steps: ParticipantStep[];
  blocksCompleted: number;
  totalBlocks: number;
  timeSpentPerBlock: number[];
  dropOffPoint?: string;
  completionRate: number;
  deviceInfo: DeviceInfo;
}

interface ParticipantStep {
  blockType: string;
  blockIndex: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  interactions: number;
  success: boolean;
  data?: Record<string, unknown>;
}

interface DeviceInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  isMobile: boolean;
  browser: string;
  os: string;
}

interface FlowError {
  timestamp: number;
  step: string;
  message: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface CriticalPath {
  name: string;
  steps: string[];
  expectedDuration: number;
  successThreshold: number;
}

class ResearchFlowMonitor {
  private studyFlows: Map<string, StudyFlowData> = new Map();
  private participantJourneys: Map<string, ParticipantJourney> = new Map();
  private criticalPaths: CriticalPath[] = [
    {
      name: 'study_creation',
      steps: ['template_selection', 'study_setup', 'block_configuration', 'preview', 'launch'],
      expectedDuration: 300000, // 5 minutes
      successThreshold: 0.8
    },
    {
      name: 'participant_onboarding',
      steps: ['landing', 'consent', 'demographics', 'instructions', 'first_block'],
      expectedDuration: 120000, // 2 minutes
      successThreshold: 0.9
    },
    {
      name: 'study_completion',
      steps: ['all_blocks', 'thank_you', 'rewards'],
      expectedDuration: 900000, // 15 minutes
      successThreshold: 0.7
    },
    {
      name: 'payment_processing',
      steps: ['calculation', 'validation', 'transfer', 'confirmation'],
      expectedDuration: 30000, // 30 seconds
      successThreshold: 0.95
    }
  ];

  private flowMetrics: Map<string, { count: number; avgDuration: number; successRate: number }> = new Map();

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Track study creation flow
   */
  trackStudyCreation(researcherId: string, templateId?: string): string {
    const flowId = this.generateFlowId();
    
    const studyFlow: StudyFlowData = {
      type: 'study_creation',
      startTime: Date.now(),
      steps: [],
      researcher: researcherId,
      templateUsed: templateId,
      blocksCount: 0,
      completionRate: 0,
      errors: []
    };

    this.studyFlows.set(flowId, studyFlow);
    
    // Log to debug console
    this.logToDebugConsole('Study creation flow started', {
      flowId,
      researcherId,
      templateId,
      timestamp: Date.now()
    });

    return flowId;
  }

  /**
   * Track study creation step
   */
  trackStudyStep(flowId: string, stepName: string, data?: Record<string, unknown>, success: boolean = true): void {
    const flow = this.studyFlows.get(flowId);
    if (!flow) return;

    const now = Date.now();
    const lastStep = flow.steps[flow.steps.length - 1];
    const duration = lastStep ? now - lastStep.timestamp : now - flow.startTime;

    const step: StudyFlowStep = {
      stepName,
      timestamp: now,
      duration,
      data,
      success,
      errors: success ? undefined : ['Step failed']
    };

    flow.steps.push(step);

    // Update completion rate
    const criticalPath = this.criticalPaths.find(cp => cp.name === 'study_creation');
    if (criticalPath) {
      flow.completionRate = flow.steps.length / criticalPath.steps.length;
    }

    // Check for drop-off
    if (!success) {
      flow.dropOffPoint = stepName;
      this.analyzeDropOff(flowId, stepName);
    }

    // Log step completion
    this.logToDebugConsole('Study creation step completed', {
      flowId,
      stepName,
      duration,
      success,
      completionRate: flow.completionRate
    });

    // Update metrics
    this.updateFlowMetrics('study_creation', flow);
  }

  /**
   * Complete study creation flow
   */
  completeStudyCreation(flowId: string, blocksCount: number): void {
    const flow = this.studyFlows.get(flowId);
    if (!flow) return;

    flow.endTime = Date.now();
    flow.duration = flow.endTime - flow.startTime;
    flow.blocksCount = blocksCount;
    flow.completionRate = 1.0;

    // Analyze flow performance
    this.analyzeStudyCreationFlow(flow);

    this.logToDebugConsole('Study creation flow completed', {
      flowId,
      duration: flow.duration,
      blocksCount,
      steps: flow.steps.length
    });
  }

  /**
   * Track participant journey
   */
  trackParticipantJourney(participantId: string, studyId: string, totalBlocks: number): string {
    const journeyId = this.generateJourneyId();
    
    const journey: ParticipantJourney = {
      participantId,
      studyId,
      startTime: Date.now(),
      steps: [],
      blocksCompleted: 0,
      totalBlocks,
      timeSpentPerBlock: [],
      completionRate: 0,
      deviceInfo: this.getDeviceInfo()
    };

    this.participantJourneys.set(journeyId, journey);

    this.logToDebugConsole('Participant journey started', {
      journeyId,
      participantId,
      studyId,
      totalBlocks,
      device: journey.deviceInfo
    });

    return journeyId;
  }

  /**
   * Track participant block completion
   */
  trackParticipantBlock(
    journeyId: string, 
    blockType: string, 
    blockIndex: number, 
    startTime: number, 
    interactions: number = 0,
    success: boolean = true,
    data?: Record<string, unknown>
  ): void {
    const journey = this.participantJourneys.get(journeyId);
    if (!journey) return;

    const endTime = Date.now();
    const duration = endTime - startTime;

    const step: ParticipantStep = {
      blockType,
      blockIndex,
      startTime,
      endTime,
      duration,
      interactions,
      success,
      data
    };

    journey.steps.push(step);
    journey.timeSpentPerBlock[blockIndex] = duration;
    
    if (success) {
      journey.blocksCompleted++;
      journey.completionRate = journey.blocksCompleted / journey.totalBlocks;
    } else {
      journey.dropOffPoint = `block_${blockIndex}_${blockType}`;
      this.analyzeParticipantDropOff(journeyId, step);
    }

    // Check for concerning patterns
    this.analyzeParticipantBehavior(journey, step);

    this.logToDebugConsole('Participant block completed', {
      journeyId,
      blockType,
      blockIndex,
      duration,
      interactions,
      success,
      completionRate: journey.completionRate
    });
  }

  /**
   * Complete participant journey
   */
  completeParticipantJourney(journeyId: string): void {
    const journey = this.participantJourneys.get(journeyId);
    if (!journey) return;

    journey.endTime = Date.now();
    journey.completionRate = 1.0;

    // Generate journey insights
    const insights = this.generateJourneyInsights(journey);

    this.logToDebugConsole('Participant journey completed', {
      journeyId,
      totalDuration: journey.endTime - journey.startTime,
      blocksCompleted: journey.blocksCompleted,
      avgTimePerBlock: this.calculateAverageBlockTime(journey),
      insights
    });

    // Track completion in metrics
    this.updateJourneyMetrics(journey);
  }

  /**
   * Get current flow analytics
   */
  getFlowAnalytics(): Record<string, unknown> {
    const analytics = {
      activeStudyFlows: this.studyFlows.size,
      activeParticipantJourneys: this.participantJourneys.size,
      flowMetrics: Object.fromEntries(this.flowMetrics),
      criticalPathPerformance: this.analyzeCriticalPaths(),
      dropOffAnalysis: this.analyzeDropOffPatterns(),
      performanceInsights: this.generatePerformanceInsights()
    };

    return analytics;
  }

  /**
   * Get flow performance by type
   */
  getFlowPerformance(flowType: string): Record<string, unknown> {
    const flows = Array.from(this.studyFlows.values()).filter(f => f.type === flowType);
    
    if (flows.length === 0) return { message: 'No flows found for type', flowType };

    const completed = flows.filter(f => f.endTime);
    const avgDuration = completed.length > 0 
      ? completed.reduce((sum, f) => sum + (f.duration || 0), 0) / completed.length 
      : 0;

    const successRate = flows.length > 0 
      ? flows.filter(f => f.completionRate >= 0.8).length / flows.length 
      : 0;

    return {
      flowType,
      totalFlows: flows.length,
      completedFlows: completed.length,
      avgDuration,
      successRate,
      commonDropOffPoints: this.getCommonDropOffPoints(flows)
    };
  }

  /**
   * Analyze drop-off patterns
   */
  private analyzeDropOff(flowId: string, stepName: string): void {
    this.logToDebugConsole('Drop-off detected', {
      flowId,
      stepName,
      timestamp: Date.now(),
      severity: 'medium'
    });

    // Track drop-off patterns for analysis
    const dropOffKey = `dropoff_${stepName}`;
    const current = this.flowMetrics.get(dropOffKey) || { count: 0, avgDuration: 0, successRate: 0 };
    current.count++;
    this.flowMetrics.set(dropOffKey, current);
  }

  /**
   * Analyze participant drop-off
   */
  private analyzeParticipantDropOff(journeyId: string, step: ParticipantStep): void {
    this.logToDebugConsole('Participant drop-off detected', {
      journeyId,
      blockType: step.blockType,
      blockIndex: step.blockIndex,
      duration: step.duration,
      interactions: step.interactions,
      severity: 'high'
    });
  }

  /**
   * Analyze participant behavior patterns
   */
  private analyzeParticipantBehavior(journey: ParticipantJourney, step: ParticipantStep): void {
    // Check for unusually long time on block
    if (step.duration && step.duration > 180000) { // 3 minutes
      this.logToDebugConsole('Long time spent on block', {
        journeyId: Array.from(this.participantJourneys.keys()).find(k => this.participantJourneys.get(k) === journey),
        blockType: step.blockType,
        duration: step.duration,
        severity: 'medium'
      });
    }

    // Check for low interaction rate
    if (step.interactions === 0 && step.blockType !== 'context_screen') {
      this.logToDebugConsole('Zero interactions detected', {
        blockType: step.blockType,
        blockIndex: step.blockIndex,
        severity: 'medium'
      });
    }
  }

  /**
   * Generate journey insights
   */
  private generateJourneyInsights(journey: ParticipantJourney): Record<string, unknown> {
    const totalDuration = journey.endTime ? journey.endTime - journey.startTime : 0;
    const avgTimePerBlock = this.calculateAverageBlockTime(journey);
    const fastestBlock = Math.min(...journey.timeSpentPerBlock.filter(t => t > 0));
    const slowestBlock = Math.max(...journey.timeSpentPerBlock);

    return {
      totalDuration,
      avgTimePerBlock,
      fastestBlock,
      slowestBlock,
      deviceType: journey.deviceInfo.isMobile ? 'mobile' : 'desktop',
      completionRate: journey.completionRate,
      interactionPattern: this.analyzeInteractionPattern(journey)
    };
  }

  /**
   * Analyze critical path performance
   */
  private analyzeCriticalPaths(): Record<string, unknown> {
    const pathAnalysis: Record<string, unknown> = {};

    this.criticalPaths.forEach(path => {
      const flows = Array.from(this.studyFlows.values()).filter(f => f.type === path.name);
      const completed = flows.filter(f => f.completionRate >= path.successThreshold);
      
      pathAnalysis[path.name] = {
        expectedDuration: path.expectedDuration,
        successThreshold: path.successThreshold,
        actualSuccessRate: flows.length > 0 ? completed.length / flows.length : 0,
        avgDuration: completed.length > 0 
          ? completed.reduce((sum, f) => sum + (f.duration || 0), 0) / completed.length 
          : 0
      };
    });

    return pathAnalysis;
  }

  /**
   * Utility methods
   */
  private generateFlowId(): string {
    return `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateJourneyId(): string {
    return `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      isMobile: window.innerWidth < 768,
      browser: this.getBrowserName(),
      os: this.getOSName()
    };
  }

  private getBrowserName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOSName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private calculateAverageBlockTime(journey: ParticipantJourney): number {
    const times = journey.timeSpentPerBlock.filter(t => t > 0);
    return times.length > 0 ? times.reduce((sum, t) => sum + t, 0) / times.length : 0;
  }

  private analyzeInteractionPattern(journey: ParticipantJourney): string {
    const interactions = journey.steps.map(s => s.interactions);
    const avgInteractions = interactions.reduce((sum, i) => sum + i, 0) / interactions.length;
    
    if (avgInteractions > 10) return 'high_engagement';
    if (avgInteractions > 5) return 'medium_engagement';
    if (avgInteractions > 1) return 'low_engagement';
    return 'minimal_engagement';
  }

  private getCommonDropOffPoints(flows: StudyFlowData[]): string[] {
    const dropOffs = flows
      .filter(f => f.dropOffPoint)
      .map(f => f.dropOffPoint!)
      .reduce((acc, point) => {
        acc[point] = (acc[point] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(dropOffs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([point]) => point);
  }

  private analyzeDropOffPatterns(): Record<string, unknown> {
    const allFlows = Array.from(this.studyFlows.values());
    const dropOffs = allFlows.filter(f => f.dropOffPoint);
    
    return {
      totalFlows: allFlows.length,
      dropOffCount: dropOffs.length,
      dropOffRate: allFlows.length > 0 ? dropOffs.length / allFlows.length : 0,
      commonDropOffPoints: this.getCommonDropOffPoints(allFlows)
    };
  }

  private generatePerformanceInsights(): Record<string, unknown> {
    const flows = Array.from(this.studyFlows.values());
    const journeys = Array.from(this.participantJourneys.values());

    return {
      studyCreationInsights: {
        avgCreationTime: flows.length > 0 
          ? flows.reduce((sum, f) => sum + (f.duration || 0), 0) / flows.length 
          : 0,
        successRate: flows.length > 0 
          ? flows.filter(f => f.completionRate >= 0.8).length / flows.length 
          : 0
      },
      participantInsights: {
        avgCompletionTime: journeys.length > 0 
          ? journeys.reduce((sum, j) => sum + this.calculateAverageBlockTime(j), 0) / journeys.length 
          : 0,
        completionRate: journeys.length > 0 
          ? journeys.filter(j => j.completionRate >= 0.7).length / journeys.length 
          : 0,
        mobileVsDesktop: this.analyzeMobileVsDesktop(journeys)
      }
    };
  }

  private analyzeMobileVsDesktop(journeys: ParticipantJourney[]): Record<string, unknown> {
    const mobile = journeys.filter(j => j.deviceInfo.isMobile);
    const desktop = journeys.filter(j => !j.deviceInfo.isMobile);

    return {
      mobileCount: mobile.length,
      desktopCount: desktop.length,
      mobileCompletionRate: mobile.length > 0 
        ? mobile.filter(j => j.completionRate >= 0.7).length / mobile.length 
        : 0,
      desktopCompletionRate: desktop.length > 0 
        ? desktop.filter(j => j.completionRate >= 0.7).length / desktop.length 
        : 0
    };
  }

  private updateFlowMetrics(flowType: string, flow: StudyFlowData): void {
    const current = this.flowMetrics.get(flowType) || { count: 0, avgDuration: 0, successRate: 0 };
    current.count++;
    
    if (flow.duration) {
      current.avgDuration = (current.avgDuration * (current.count - 1) + flow.duration) / current.count;
    }
    
    current.successRate = (current.successRate * (current.count - 1) + flow.completionRate) / current.count;
    
    this.flowMetrics.set(flowType, current);
  }

  private updateJourneyMetrics(journey: ParticipantJourney): void {
    // Track journey completion metrics
    const journeyKey = `${journey.studyId}_journey`;
    const existing = this.flowMetrics.get(journeyKey) || {
      count: 0,
      avgDuration: 0,
      successRate: 0
    };

    existing.count++;
    
    // Update average duration if journey is complete
    if (journey.endTime) {
      const duration = journey.endTime - journey.startTime;
      existing.avgDuration = (existing.avgDuration * (existing.count - 1) + duration) / existing.count;
    }
    
    // Update success rate based on completion
    const isComplete = journey.completionRate >= 1.0;
    existing.successRate = (existing.successRate * (existing.count - 1) + (isComplete ? 1 : 0)) / existing.count;
    
    this.flowMetrics.set(journeyKey, existing);
    
    // Log journey completion insights
    if (journey.dropOffPoint) {
      this.logToDebugConsole('Participant drop-off detected', {
        participantId: journey.participantId,
        studyId: journey.studyId,
        dropOffPoint: journey.dropOffPoint,
        completionRate: journey.completionRate,
        stepsCompleted: journey.steps.length,
        totalBlocks: journey.totalBlocks
      });
    }
  }

  private analyzeStudyCreationFlow(flow: StudyFlowData): void {
    // Generate insights about the study creation process
    const insights = {
      efficiency: flow.duration && flow.duration < 300000 ? 'high' : 'low',
      completeness: flow.completionRate,
      blocksCreated: flow.blocksCount,
      templateUsed: !!flow.templateUsed
    };

    this.logToDebugConsole('Study creation flow analysis', insights);
  }

  private initializeMonitoring(): void {
    // Set up periodic cleanup of old flows
    setInterval(() => {
      this.cleanupOldFlows();
    }, 3600000); // 1 hour
  }

  private cleanupOldFlows(): void {
    const cutoff = Date.now() - 86400000; // 24 hours ago
    
    // Clean up old study flows
    for (const [flowId, flow] of this.studyFlows.entries()) {
      if (flow.startTime < cutoff) {
        this.studyFlows.delete(flowId);
      }
    }

    // Clean up old participant journeys
    for (const [journeyId, journey] of this.participantJourneys.entries()) {
      if (journey.startTime < cutoff) {
        this.participantJourneys.delete(journeyId);
      }
    }
  }

  private logToDebugConsole(message: string, data: Record<string, unknown>): void {
    if (import.meta.env.DEV) {
      import('./DevDebugConsole').then(({ default: console }) => {
        console.log(message, data, 'study');
      });
    }
  }
}

// Create singleton instance
const researchFlowMonitor = new ResearchFlowMonitor();

export default researchFlowMonitor;
