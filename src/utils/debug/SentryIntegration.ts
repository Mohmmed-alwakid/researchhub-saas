import * as Sentry from '@sentry/react';


/**
 * 🔍 Sentry Integration for ResearchHub
 * Professional error tracking with ResearchHub-specific context
 */

interface ResearchContext {
  studyId?: string;
  studyType?: string;
  phase?: string;
  blocksCount?: number;
  participantsCount?: number;
}

interface StudyData {
  id: string;
  type: string;
  blocks?: unknown[];
  templateId?: string;
}

interface ParticipantData {
  id: string;
  studyId: string;
  currentBlock?: number;
  timeSpent?: number;
}

interface PaymentData {
  id: string;
  amount: number;
  currency?: string;
}

interface ErrorContext {
  type?: string;
  userRole?: string;
  feature?: string;
  studyId?: string;
  studyType?: string;
  studyPhase?: string;
  participantId?: string;
  currentBlock?: number;
  participantJourney?: string;
}

class ResearchHubSentry {
  private isInitialized: boolean = false;
  private researchContext: Map<string, ResearchContext> = new Map();

  /**
   * Initialize Sentry with ResearchHub-specific configuration
   */
  init(): void {
    if (this.isInitialized) return;

    const dsn = import.meta.env.VITE_SENTRY_DSN;
    
    // Only initialize if DSN is provided
    if (!dsn) {
      console.warn('🔍 Sentry DSN not found. Error tracking disabled.');
      return;
    }

    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      
      // Performance monitoring
      integrations: [
        Sentry.browserTracingIntegration({
          // Track page loads and navigation
          // Note: tracePropagationTargets removed due to API changes
        }),
      ],
      
      // Performance monitoring sample rate
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      
      // Error sampling (100% in dev, 50% in prod)
      sampleRate: import.meta.env.PROD ? 0.5 : 1.0,
      
      // Release tracking
      release: `researchhub@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
      
      // Custom breadcrumb filtering
      beforeBreadcrumb: (breadcrumb) => this.beforeBreadcrumb(breadcrumb),
    });

    this.isInitialized = true;
    console.log('🔍 Sentry initialized for ResearchHub');
  }

  /**
   * Custom breadcrumb processing
   */
  private beforeBreadcrumb(breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb | null {
    // Enhance navigation breadcrumbs with ResearchHub context
    if (breadcrumb.category === 'navigation') {
      breadcrumb.data = {
        ...breadcrumb.data,
        userRole: this.getCurrentUserRole(),
        studyContext: this.getCurrentStudyContext(),
      };
    }

    // Filter sensitive data from breadcrumbs
    if (breadcrumb.data) {
      breadcrumb.data = this.sanitizeBreadcrumbData(breadcrumb.data);
    }

    return breadcrumb;
  }

  /**
   * Set user context with ResearchHub-specific data
   */
  setUserContext(user: { 
    id: string; 
    email?: string; 
    role?: string; 
    totalStudies?: number; 
    totalPoints?: number; 
    accountType?: string; 
  }): void {
    if (!this.isInitialized) return;

    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
      // ResearchHub specific context
      totalStudies: user.totalStudies || 0,
      totalPoints: user.totalPoints || 0,
      accountType: user.accountType || 'free',
    });
  }

  /**
   * Set research-specific context
   */
  setResearchContext(context: ResearchContext): void {
    if (!this.isInitialized) return;

    this.researchContext.set('current', context);
    
    Sentry.setContext('research', {
      studyId: context.studyId,
      studyType: context.studyType,
      phase: context.phase, // creation, active, completed
      blocksCount: context.blocksCount,
      participantsCount: context.participantsCount,
    });
  }

  /**
   * Track research-specific events
   */
  trackStudyEvent(action: string, studyData: StudyData): void {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      category: 'study',
      message: `Study ${action}`,
      level: 'info',
      data: {
        studyId: studyData.id,
        studyType: studyData.type,
        action,
        blocksCount: studyData.blocks?.length || 0,
        templateUsed: studyData.templateId || null,
      },
    });
  }

  /**
   * Track participant journey events
   */
  trackParticipantEvent(action: string, participantData: ParticipantData): void {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      category: 'participant',
      message: `Participant ${action}`,
      level: 'info',
      data: {
        participantId: participantData.id,
        studyId: participantData.studyId,
        action,
        blockIndex: participantData.currentBlock || 0,
        timeSpent: participantData.timeSpent || 0,
      },
    });
  }

  /**
   * Track payment events
   */
  trackPaymentEvent(action: string, paymentData: PaymentData): void {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      category: 'payment',
      message: `Payment ${action}`,
      level: action === 'failed' ? 'error' : 'info',
      data: {
        transactionId: paymentData.id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        action,
        provider: 'DodoPayments',
      },
    });
  }

  /**
   * Capture ResearchHub-specific errors
   */
  captureResearchError(error: Error, context: ErrorContext): void {
    if (!this.isInitialized) return;

    Sentry.withScope((scope) => {
      // Add research-specific tags
      scope.setTag('errorType', context.type || 'unknown');
      scope.setTag('userRole', context.userRole || 'unknown');
      scope.setTag('feature', context.feature || 'general');

      // Add research context
      if (context.studyId) {
        scope.setContext('study', {
          id: context.studyId,
          type: context.studyType,
          phase: context.studyPhase,
        });
      }

      if (context.participantId) {
        scope.setContext('participant', {
          id: context.participantId,
          currentBlock: context.currentBlock,
          journey: context.participantJourney,
        });
      }

      // Capture the error
      Sentry.captureException(error);
    });
  }

  /**
   * Get current user role from context
   */
  private getCurrentUserRole(): string {
    // This should integrate with your auth context
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get current study context
   */
  private getCurrentStudyContext(): Record<string, unknown> | null {
    const context = this.researchContext.get('current');
    return context ? {
      studyId: context.studyId,
      phase: context.phase,
      type: context.studyType,
    } : null;
  }

  /**
   * Sanitize breadcrumb data
   */
  private sanitizeBreadcrumbData(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...data };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    delete sanitized.personalData;
    
    return sanitized;
  }

  /**
   * Start performance span (updated API)
   */
  startSpan(name: string, operation: string): void {
    if (!this.isInitialized) return;
    
    // Use newer span API instead of deprecated transaction API
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Started ${operation}: ${name}`,
      level: 'info',
      data: {
        userRole: this.getCurrentUserRole(),
        feature: operation,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Add performance mark
   */
  addPerformanceMark(name: string, data: Record<string, unknown> = {}): void {
    if (!this.isInitialized) return;
    
    Sentry.addBreadcrumb({
      category: 'performance',
      message: name,
      level: 'info',
      data: {
        ...data,
        timestamp: Date.now(),
      },
    });
  }
}

// Create singleton instance
const sentryIntegration = new ResearchHubSentry();

export default sentryIntegration;

// Export helper functions for easy use
export const {
  init,
  setUserContext,
  setResearchContext,
  trackStudyEvent,
  trackParticipantEvent,
  trackPaymentEvent,
  captureResearchError,
  startSpan,
  addPerformanceMark,
} = sentryIntegration;
