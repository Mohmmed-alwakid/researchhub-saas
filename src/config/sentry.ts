/**
 * Sentry Configuration for ResearchHub
 * Comprehensive error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react';

// Environment-specific configuration
const SENTRY_CONFIG = {
  development: {
    dsn: 'https://e76a1d4626dd95e2d0c2ca38816c91b4@o4509515744935936.ingest.de.sentry.io/4509826774204496',
    environment: 'development',
    debug: true,
    tracesSampleRate: 1.0, // 100% sampling in development
    enabled: true
  },
  production: {
    dsn: 'https://e76a1d4626dd95e2d0c2ca38816c91b4@o4509515744935936.ingest.de.sentry.io/4509826774204496',
    environment: 'production',
    debug: false,
    tracesSampleRate: 0.1, // 10% sampling in production
    enabled: true
  }
};

const currentEnv = import.meta.env.NODE_ENV === 'production' ? 'production' : 'development';
const config = SENTRY_CONFIG[currentEnv];

/**
 * Initialize Sentry for ResearchHub Frontend
 */
export function initSentry() {
  if (!config.enabled) {
    console.log('🔍 Sentry disabled in configuration');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    debug: config.debug,
    
    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
    ],

    // Sampling rates
    tracesSampleRate: config.tracesSampleRate,

    // Release and user context
    release: `researchhub-saas@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    
    // Enhanced transport configuration to handle blocking
    transport: Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport),
    
    // Graceful error handling for transport failures
    beforeSend(event, hint) {
      // Filter out development noise
      if (currentEnv === 'development') {
        const error = hint.originalException as Error;
        
        // Skip HMR and development errors
        if (error?.message?.includes('HMR') || 
            error?.message?.includes('Module build failed') ||
            error?.message?.includes('WebSocket connection') ||
            error?.message?.includes('Failed to fetch')) {
          return null;
        }
      }

      // Enhanced error context for ResearchHub
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error) {
          // Add ResearchHub-specific context
          event.tags = {
            ...event.tags,
            component: getComponentFromPath(window.location.pathname),
            feature: getFeatureFromPath(window.location.pathname),
            userRole: getCurrentUserRole(),
            studyContext: getCurrentStudyContext()
          };
        }
      }

      return event;
    },

    // Enhanced breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Add ResearchHub-specific breadcrumbs
      if (breadcrumb.category === 'ui.click') {
        const target = breadcrumb.data?.target as string;
        if (target) {
          breadcrumb.data = {
            ...breadcrumb.data,
            researchhubAction: getResearchHubAction(target)
          };
        }
      }

      return breadcrumb;
    }
  });

  console.log(`🔍 Sentry initialized for ResearchHub (${config.environment})`);
}

/**
 * ResearchHub-specific helper functions
 */
function getComponentFromPath(pathname: string): string {
  if (pathname.includes('/studies')) return 'studies';
  if (pathname.includes('/templates')) return 'templates';
  if (pathname.includes('/admin')) return 'admin';
  if (pathname.includes('/dashboard')) return 'dashboard';
  if (pathname.includes('/builder')) return 'study-builder';
  return 'unknown';
}

function getFeatureFromPath(pathname: string): string {
  if (pathname.includes('/studies')) return 'studies';
  if (pathname.includes('/templates')) return 'templates';
  if (pathname.includes('/admin')) return 'admin';
  if (pathname.includes('/dashboard')) return 'dashboard';
  if (pathname.includes('/builder')) return 'study-builder';
  if (pathname.includes('/participants')) return 'participants';
  if (pathname.includes('/results')) return 'results';
  return 'general';
}

function getCurrentUserRole(): string {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?.role || 'anonymous';
  } catch {
    return 'unknown';
  }
}

function getCurrentStudyContext(): string {
  try {
    const pathname = window.location.pathname;
    const studyMatch = pathname.match(/\/studies\/([^/]+)/);
    return studyMatch ? studyMatch[1] : 'none';
  } catch {
    return 'unknown';
  }
}

function getResearchHubAction(target: string): string {
  if (target.includes('launch') || target.includes('publish')) return 'study-launch';
  if (target.includes('save') || target.includes('update')) return 'content-save';
  if (target.includes('delete') || target.includes('remove')) return 'content-delete';
  if (target.includes('create') || target.includes('add')) return 'content-create';
  if (target.includes('login') || target.includes('signup')) return 'authentication';
  return 'interaction';
}

/**
 * Custom Sentry utilities for ResearchHub
 */
export const SentryUtils = {
  /**
   * Track study creation events
   */
  trackStudyCreation(studyData: { type?: string; templateId?: string; blocks?: unknown[] }) {
    Sentry.addBreadcrumb({
      message: 'Study creation initiated',
      category: 'researchhub.study',
      data: {
        studyType: studyData.type,
        templateUsed: studyData.templateId || 'none',
        blocksCount: studyData.blocks?.length || 0
      },
      level: 'info'
    });
  },

  /**
   * Track participant interactions
   */
  trackParticipantAction(action: string, studyId: string, blockId?: string) {
    Sentry.addBreadcrumb({
      message: `Participant ${action}`,
      category: 'researchhub.participant',
      data: {
        action,
        studyId,
        blockId,
        timestamp: Date.now()
      },
      level: 'info'
    });
  },

  /**
   * Track API errors with context
   */
  trackAPIError(endpoint: string, error: Error | null, requestData?: Record<string, unknown>) {
    Sentry.withScope((scope) => {
      scope.setTag('api.endpoint', endpoint);
      scope.setContext('api.request', {
        endpoint,
        data: requestData ? JSON.stringify(requestData).slice(0, 1000) : undefined,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        Sentry.captureException(error);
      }
    });
  },

  /**
   * Track performance issues
   */
  trackPerformanceIssue(component: string, duration: number, context?: Record<string, unknown>) {
    if (duration > 2000) { // Track slow operations > 2s
      Sentry.withScope((scope) => {
        scope.setTag('performance.component', component);
        scope.setContext('performance.metrics', {
          duration,
          component,
          context
        });
        
        Sentry.captureMessage(`Slow operation detected: ${component} (${duration}ms)`, 'warning');
      });
    }
  },

  /**
   * Set user context for better error tracking
   */
  setUserContext(user: { id: string; email: string; role: string; subscription?: { plan: string } }) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription?.plan
    });
  },

  /**
   * Clear user context on logout
   */
  clearUserContext() {
    Sentry.setUser(null);
  }
};

export default Sentry;
