/**
 * ResearchHub-Specific Development Utilities
 * Debugging tools for studies, blocks, participants, and application workflows
 */

import { globalDevTools, globalLogger } from '../errors/index.js';

export interface StudyDebugInfo {
  studyId: string;
  studyType: string;
  blockCount: number;
  participantCount: number;
  completionRate: number;
  averageSessionTime: number;
  issues: string[];
}

export interface BlockDebugInfo {
  blockId: string;
  blockType: string;
  renderTime: number;
  interactionCount: number;
  errorCount: number;
  averageResponseTime: number;
  dropoffRate: number;
}

export interface ParticipantDebugInfo {
  participantId: string;
  sessionId: string;
  currentBlock: string;
  completedBlocks: number;
  sessionDuration: number;
  interactionCount: number;
  errors: string[];
  userAgent: string;
}

export class ResearchHubDebugger {
  private studyMetrics = new Map<string, StudyDebugInfo>();
  private blockMetrics = new Map<string, BlockDebugInfo>();
  private participantSessions = new Map<string, ParticipantDebugInfo>();

  /**
   * Debug study creation and management
   */
  debugStudy(studyId: string, action: string, data?: Record<string, unknown>): void {
    const timerId = globalDevTools.startPerformanceTimer(`study-${action}`, 'custom', {
      studyId,
      action,
      ...data
    });

    globalLogger.study(`Study ${action}`, studyId, {
      action,
      debugMode: true,
      ...data
    });

    // Store timing for later analysis
    setTimeout(() => {
      const result = globalDevTools.endPerformanceTimer(timerId);
      if (result && result.duration) {
        console.log(`📊 Study ${action} took ${result.duration.toFixed(2)}ms`, {
          studyId,
          duration: result.duration,
          data
        });
      }
    }, 0);
  }

  /**
   * Debug block rendering and interactions
   */
  debugBlock(
    blockId: string,
    blockType: string,
    action: 'render' | 'interact' | 'complete' | 'error',
    metadata?: Record<string, unknown>
  ): void {
    const timerId = globalDevTools.startPerformanceTimer(`block-${action}`, 'component', {
      blockId,
      blockType,
      action,
      ...metadata
    });

    console.log(`🧩 Block Debug: ${blockType} (${blockId}) - ${action}`, metadata);

    // Update block metrics
    const existing = this.blockMetrics.get(blockId);
    if (existing) {
      if (action === 'interact') existing.interactionCount++;
      if (action === 'error') existing.errorCount++;
    } else {
      this.blockMetrics.set(blockId, {
        blockId,
        blockType,
        renderTime: 0,
        interactionCount: action === 'interact' ? 1 : 0,
        errorCount: action === 'error' ? 1 : 0,
        averageResponseTime: 0,
        dropoffRate: 0
      });
    }

    // End timing
    setTimeout(() => {
      const result = globalDevTools.endPerformanceTimer(timerId);
      if (result && result.duration) {
        const blockMetric = this.blockMetrics.get(blockId);
        if (blockMetric && action === 'render') {
          blockMetric.renderTime = result.duration;
        }
      }
    }, 0);
  }

  /**
   * Debug participant sessions and behavior
   */
  debugParticipant(
    participantId: string,
    sessionId: string,
    action: string,
    data?: Record<string, unknown>
  ): void {
    globalLogger.userAction(`Participant ${action}`, participantId, {
      sessionId,
      action,
      debugMode: true,
      ...data
    });

    const existing = this.participantSessions.get(sessionId);
    if (existing) {
      existing.interactionCount++;
      if (action === 'error' && data?.error) {
        existing.errors.push(String(data.error));
      }
    } else {
      this.participantSessions.set(sessionId, {
        participantId,
        sessionId,
        currentBlock: data?.blockId as string || 'unknown',
        completedBlocks: 0,
        sessionDuration: 0,
        interactionCount: 1,
        errors: action === 'error' && data?.error ? [String(data.error)] : [],
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      });
    }

    console.log(`👤 Participant Debug: ${participantId} - ${action}`, {
      sessionId,
      data,
      sessionInfo: this.participantSessions.get(sessionId)
    });
  }

  /**
   * Debug API interactions
   */
  debugApi(endpoint: string, method: string, data?: Record<string, unknown>): string {
    const timerId = globalDevTools.startPerformanceTimer(`api-${endpoint}`, 'api', {
      endpoint,
      method,
      ...data
    });

    console.log(`🌐 API Debug: ${method} ${endpoint}`, data);

    return timerId;
  }

  /**
   * Complete API debug timing
   */
  completeApiDebug(
    timerId: string,
    success: boolean,
    status?: number,
    error?: string,
    responseData?: unknown
  ): void {
    const result = globalDevTools.endPerformanceTimer(timerId);
    
    if (result) {
      console.log(`🌐 API Complete: ${result.name} (${result.duration?.toFixed(2)}ms)`, {
        success,
        status,
        error,
        duration: result.duration,
        responseSize: responseData ? JSON.stringify(responseData).length : 0
      });

      if (!success || (result.duration && result.duration > 2000)) {
        console.warn(`🐌 Slow/Failed API call detected:`, result);
      }
    }
  }

  /**
   * Debug authentication flows
   */
  debugAuth(action: string, userId?: string, role?: string, data?: Record<string, unknown>): void {
    globalLogger.userAction(`Auth ${action}`, userId || 'unknown', {
      role,
      action,
      debugMode: true,
      ...data
    });

    console.log(`🔐 Auth Debug: ${action}`, {
      userId,
      role,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Debug study builder operations
   */
  debugStudyBuilder(
    action: 'load' | 'save' | 'preview' | 'validate' | 'publish',
    studyData?: Record<string, unknown>
  ): void {
    const timerId = globalDevTools.startPerformanceTimer(`study-builder-${action}`, 'custom', {
      action,
      blockCount: studyData?.blocks ? (studyData.blocks as unknown[]).length : 0,
      ...studyData
    });

    console.log(`🏗️ Study Builder Debug: ${action}`, {
      studyData,
      timestamp: new Date().toISOString()
    });

    setTimeout(() => {
      const result = globalDevTools.endPerformanceTimer(timerId);
      if (result && result.duration) {
        console.log(`🏗️ Study Builder ${action} completed in ${result.duration.toFixed(2)}ms`);
      }
    }, 0);
  }

  /**
   * Debug template operations
   */
  debugTemplate(
    action: 'load' | 'apply' | 'preview' | 'customize',
    templateId?: string,
    data?: Record<string, unknown>
  ): void {
    console.log(`📋 Template Debug: ${action}`, {
      templateId,
      data,
      timestamp: new Date().toISOString()
    });

    globalLogger.info(`Template ${action}`, {
      templateId,
      action,
      debugMode: true,
      ...data
    });
  }

  /**
   * Get comprehensive debug summary
   */
  getDebugSummary() {
    const devSummary = globalDevTools.getPerformanceSummary();
    
    return {
      performance: devSummary,
      studies: {
        total: this.studyMetrics.size,
        metrics: Array.from(this.studyMetrics.values())
      },
      blocks: {
        total: this.blockMetrics.size,
        metrics: Array.from(this.blockMetrics.values()),
        averageRenderTime: this.calculateAverageBlockRenderTime(),
        slowBlocks: Array.from(this.blockMetrics.values()).filter(b => b.renderTime > 100)
      },
      participants: {
        activeSessions: this.participantSessions.size,
        sessions: Array.from(this.participantSessions.values()),
        totalErrors: Array.from(this.participantSessions.values())
          .reduce((sum, p) => sum + p.errors.length, 0)
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export debug data for analysis
   */
  exportDebugData() {
    return {
      devTools: globalDevTools.exportDebugData(),
      researchHub: this.getDebugSummary(),
      logs: globalLogger.getLogs({ limit: 100 }),
      errors: globalLogger.getLogs({ level: 2 }) // ERROR level and above
    };
  }

  /**
   * Clear all debug data
   */
  clearDebugData(): void {
    this.studyMetrics.clear();
    this.blockMetrics.clear();
    this.participantSessions.clear();
    globalDevTools.clearData();
    globalLogger.clearLogs();
    
    console.log('🧹 All debug data cleared');
  }

  private calculateAverageBlockRenderTime(): number {
    const renderTimes = Array.from(this.blockMetrics.values())
      .map(b => b.renderTime)
      .filter(t => t > 0);
    
    if (renderTimes.length === 0) return 0;
    
    return renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
  }
}

// Global instance
export const researchHubDebugger = new ResearchHubDebugger();

// Convenience functions for common debugging scenarios
export const debugStudy = (studyId: string, action: string, data?: Record<string, unknown>) =>
  researchHubDebugger.debugStudy(studyId, action, data);

export const debugBlock = (blockId: string, blockType: string, action: 'render' | 'interact' | 'complete' | 'error', metadata?: Record<string, unknown>) =>
  researchHubDebugger.debugBlock(blockId, blockType, action, metadata);

export const debugParticipant = (participantId: string, sessionId: string, action: string, data?: Record<string, unknown>) =>
  researchHubDebugger.debugParticipant(participantId, sessionId, action, data);

export const debugApi = (endpoint: string, method: string, data?: Record<string, unknown>) =>
  researchHubDebugger.debugApi(endpoint, method, data);

export const completeApiDebug = (timerId: string, success: boolean, status?: number, error?: string, responseData?: unknown) =>
  researchHubDebugger.completeApiDebug(timerId, success, status, error, responseData);

export const debugAuth = (action: string, userId?: string, role?: string, data?: Record<string, unknown>) =>
  researchHubDebugger.debugAuth(action, userId, role, data);

export const debugStudyBuilder = (action: 'load' | 'save' | 'preview' | 'validate' | 'publish', studyData?: Record<string, unknown>) =>
  researchHubDebugger.debugStudyBuilder(action, studyData);

export const debugTemplate = (action: 'load' | 'apply' | 'preview' | 'customize', templateId?: string, data?: Record<string, unknown>) =>
  researchHubDebugger.debugTemplate(action, templateId, data);

export const getDebugSummary = () => researchHubDebugger.getDebugSummary();

export const exportDebugData = () => researchHubDebugger.exportDebugData();

export const clearDebugData = () => researchHubDebugger.clearDebugData();
