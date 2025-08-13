/**
 * Sentry Backend Configuration for ResearchHub API
 * Server-side error tracking and performance monitoring
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

// Environment-specific configuration
const SENTRY_CONFIG = {
  development: {
    dsn: 'https://e76a1d4626dd95e2d0c2ca38816c91b4@o4509515744935936.ingest.de.sentry.io/4509826774204496',
    environment: 'development',
    debug: true,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    enabled: true
  },
  production: {
    dsn: 'https://e76a1d4626dd95e2d0c2ca38816c91b4@o4509515744935936.ingest.de.sentry.io/4509826774204496',
    environment: 'production',
    debug: false,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    enabled: true
  }
};

const currentEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const config = SENTRY_CONFIG[currentEnv];

/**
 * Initialize Sentry for ResearchHub Backend
 */
function initSentryBackend() {
  if (!config.enabled) {
    console.log('🔍 Sentry Backend disabled in configuration');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    debug: config.debug,
    
    // Performance and profiling
    integrations: [
      new ProfilingIntegration(),
    ],
    
    tracesSampleRate: config.tracesSampleRate,
    profilesSampleRate: config.profilesSampleRate,
    
    // Release information
    release: `researchhub-saas-api@${process.env.VERCEL_GIT_COMMIT_SHA || '1.0.0'}`,
    
    // Enhanced error filtering for API
    beforeSend(event, hint) {
      // Filter development noise
      if (currentEnv === 'development') {
        const error = hint.originalException;
        if (error?.code === 'ECONNREFUSED' || 
            error?.message?.includes('Cannot resolve module')) {
          return null;
        }
      }

      // Add ResearchHub API context
      if (event.exception) {
        event.tags = {
          ...event.tags,
          apiEndpoint: getAPIEndpointFromEvent(event),
          functionName: getFunctionNameFromEvent(event),
          userRole: event.user?.role || 'unknown'
        };
      }

      return event;
    }
  });

  console.log(`🔍 Sentry Backend initialized for ResearchHub API (${config.environment})`);
}

/**
 * Helper functions for backend context
 */
function getAPIEndpointFromEvent(event) {
  // Extract API endpoint from request data
  const request = event.request;
  if (request?.url) {
    const url = new URL(request.url);
    return url.pathname;
  }
  return 'unknown';
}

function getFunctionNameFromEvent(event) {
  // Extract Vercel function name from stack trace
  const frames = event.exception?.values?.[0]?.stacktrace?.frames || [];
  for (const frame of frames) {
    if (frame.filename?.includes('/api/')) {
      const match = frame.filename.match(/\/api\/([^\/]+)\.js/);
      return match ? match[1] : 'unknown';
    }
  }
  return 'unknown';
}

/**
 * Sentry middleware for Vercel functions
 */
function withSentry(handler) {
  return async (req, res) => {
    const transaction = Sentry.startTransaction({
      op: 'http',
      name: `${req.method} ${req.url}`,
    });

    Sentry.getCurrentScope().setSpan(transaction);

    try {
      // Add request context
      Sentry.setContext('request', {
        method: req.method,
        url: req.url,
        headers: sanitizeHeaders(req.headers),
        query: req.query,
        body: sanitizeBody(req.body)
      });

      // Execute the handler
      const result = await handler(req, res);
      
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('internal_error');
      
      // Capture error with enhanced context
      Sentry.withScope((scope) => {
        scope.setTag('function', getFunctionName(req.url));
        scope.setTag('method', req.method);
        scope.setLevel('error');
        
        Sentry.captureException(error);
      });
      
      throw error;
    } finally {
      transaction.finish();
    }
  };
}

/**
 * ResearchHub-specific backend utilities
 */
const BackendSentryUtils = {
  /**
   * Track API performance
   */
  trackAPIPerformance(endpoint, duration, success = true) {
    Sentry.addBreadcrumb({
      message: `API call: ${endpoint}`,
      category: 'researchhub.api',
      data: {
        endpoint,
        duration,
        success,
        timestamp: Date.now()
      },
      level: success ? 'info' : 'warning'
    });

    if (duration > 5000) { // Track slow API calls > 5s
      Sentry.captureMessage(`Slow API endpoint: ${endpoint} (${duration}ms)`, 'warning');
    }
  },

  /**
   * Track database operations
   */
  trackDatabaseOperation(operation, table, duration, success = true) {
    Sentry.addBreadcrumb({
      message: `Database ${operation}: ${table}`,
      category: 'researchhub.database',
      data: {
        operation,
        table,
        duration,
        success
      },
      level: success ? 'info' : 'error'
    });
  },

  /**
   * Track authentication events
   */
  trackAuthEvent(event, userId, success = true, error = null) {
    Sentry.withScope((scope) => {
      scope.setTag('auth.event', event);
      scope.setTag('auth.success', success);
      scope.setUser({ id: userId });
      
      if (success) {
        Sentry.addBreadcrumb({
          message: `Auth success: ${event}`,
          category: 'researchhub.auth',
          level: 'info'
        });
      } else {
        scope.setLevel('error');
        Sentry.captureException(error || new Error(`Auth failed: ${event}`));
      }
    });
  },

  /**
   * Track business events
   */
  trackBusinessEvent(event, data) {
    Sentry.addBreadcrumb({
      message: `Business event: ${event}`,
      category: 'researchhub.business',
      data,
      level: 'info'
    });
  }
};

/**
 * Utility functions
 */
function sanitizeHeaders(headers) {
  const sanitized = { ...headers };
  delete sanitized.authorization;
  delete sanitized.cookie;
  return sanitized;
}

function sanitizeBody(body) {
  if (!body) return undefined;
  
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  
  return JSON.stringify(sanitized).slice(0, 1000); // Limit size
}

function getFunctionName(url) {
  const match = url?.match(/\/api\/([^\/\?]+)/);
  return match ? match[1] : 'unknown';
}

module.exports = {
  initSentryBackend,
  withSentry,
  BackendSentryUtils,
  Sentry
};
