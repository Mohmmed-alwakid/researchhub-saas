/**
 * 🔍 Simple Sentry Integration for Afkar
 * Professional error tracking with Afkar-specific context
 */

import * as Sentry from '@sentry/react';

class AfkarSentry {
  private isInitialized: boolean = false;
  private researchContext: Map<string, unknown> = new Map();

  /**
   * Initialize Sentry with Afkar-specific configuration
   */
  init(): void {
    if (this.isInitialized) return;

    const dsn = import.meta.env.VITE_SENTRY_DSN;
    
    // Only initialize if DSN is provided
    if (!dsn) {
      console.warn('🔍 Sentry DSN not found. Error tracking disabled. Add VITE_SENTRY_DSN to your .env file.');
      return;
    }

    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      
      // Performance monitoring
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      
      // Performance monitoring sample rate
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      
      // Session replay sample rate
      replaysSessionSampleRate: import.meta.env.PROD ? 0.01 : 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Error sampling (100% in dev, 90% in prod)
      sampleRate: import.meta.env.PROD ? 0.9 : 1.0,
      
      // Release tracking
      release: `afkar@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    });

    this.isInitialized = true;
    console.log('🔍 Sentry initialized for Afkar');
  }

  /**
   * Set user context with Afkar-specific data
   */
  setUserContext(user: { id: string; email?: string; role?: string; [key: string]: unknown }): void {
    if (!this.isInitialized) return;

    Sentry.setUser({
      id: user.id,
      email: user.email ? this.sanitizeEmail(user.email) : undefined,
      role: user.role,
    });
  }

  /**
   * Set research-specific context
   */
  setResearchContext(context: { studyId?: string; studyType?: string; phase?: string }): void {
    if (!this.isInitialized) return;

    this.researchContext.set('current', context);
    
    Sentry.setContext('research', {
      studyId: context.studyId,
      studyType: context.studyType,
      phase: context.phase,
    });
  }

  /**
   * Track research-specific events
   */
  trackStudyEvent(action: string, studyData: { id: string; type: string; [key: string]: unknown }): void {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      category: 'study',
      message: `Study ${action}`,
      level: 'info',
      data: {
        studyId: studyData.id,
        studyType: studyData.type,
        action,
      },
    });
  }

  /**
   * Track participant journey events
   */
  trackParticipantEvent(action: string, participantData: { id: string; studyId: string; [key: string]: unknown }): void {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      category: 'participant',
      message: `Participant ${action}`,
      level: 'info',
      data: {
        participantId: participantData.id,
        studyId: participantData.studyId,
        action,
      },
    });
  }

  /**
   * Track payment events
   */
  trackPaymentEvent(action: string, paymentData: { id: string; amount: number; [key: string]: unknown }): void {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      category: 'payment',
      message: `Payment ${action}`,
      level: action === 'failed' ? 'error' : 'info',
      data: {
        transactionId: paymentData.id,
        amount: paymentData.amount,
        action,
        provider: 'DodoPayments',
      },
    });
  }

  /**
   * Capture Afkar-specific errors
   */
  captureResearchError(error: Error, context: { type?: string; userRole?: string; feature?: string; [key: string]: unknown }): void {
    if (!this.isInitialized) return;

    Sentry.withScope((scope) => {
      // Add research-specific tags
      scope.setTag('errorType', context.type || 'unknown');
      scope.setTag('userRole', context.userRole || 'unknown');
      scope.setTag('feature', context.feature || 'general');

      // Capture the error
      Sentry.captureException(error);
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

  /**
   * Sanitize email for privacy
   */
  private sanitizeEmail(email: string): string {
    return email.replace(/(.{2}).*@/, '$1***@');
  }
}

// Create singleton instance
const sentryIntegration = new AfkarSentry();

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
  addPerformanceMark,
} = sentryIntegration;
