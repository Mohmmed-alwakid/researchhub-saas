import { Environment } from './AppConfig';


/**
 * Environment Configuration
 * Environment-specific configuration values and console error reduction
 */

// Sentry mock interface
interface SentryMock {
  captureException: () => void;
  captureMessage: () => void;
  configureScope: () => void;
  withScope: () => void;
}

declare global {
  interface Window {
    Sentry?: SentryMock;
  }
}

// Environment detection
export const getCurrentEnvironment = (): Environment => {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') return 'production';
  if (env === 'test') return 'test';
  return 'development';
};

// Sentry Configuration
export const initializeSentry = () => {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!sentryDsn) {
    // Suppress the "Sentry DSN not found" warning
    if (typeof window !== 'undefined') {
      window.Sentry = {
        captureException: () => {},
        captureMessage: () => {},
        configureScope: () => {},
        withScope: () => {}
      };
    }
    return;
  }

  // Initialize real Sentry if DSN is provided
  import('@sentry/browser').then(({ init }) => {
    init({
      dsn: sentryDsn,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    });
  });
};

// Suppress browser warnings
export const suppressBrowserWarnings = () => {
  if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Skip permission policy warnings and content script warnings
      if (message.includes('Permissions-Policy') || 
          message.includes('This page is not reloaded') ||
          message.includes('browsing-topics') ||
          message.includes('run-ad-auction')) {
        return;
      }
      
      originalWarn.apply(console, args);
    };
  }
};

// Environment-specific defaults
export const environmentDefaults = {
  development: {
    api: {
      baseUrl: 'http://localhost:3005', // Fixed port to prevent conflicts
      timeout: 10000,
      retryAttempts: 1,
    },
    features: {
      enableCollaboration: true,
      enableAdvancedBlocks: true,
      enableAnalytics: false,
      enablePayments: false,
      enableVideoRecording: false,
      enableAIIntegration: false,
    },
    monitoring: {
      enableErrorTracking: false,
      enablePerformanceMonitoring: false,
      enableAnalytics: false,
    },
    security: {
      enableCSRF: false,
      sessionTimeout: 86400000, // 24 hours
    },
  },
  production: {
    api: {
      baseUrl: '',
      timeout: 30000,
      retryAttempts: 3,
    },
    features: {
      enableCollaboration: true,
      enableAdvancedBlocks: true,
      enableAnalytics: true,
      enablePayments: true,
      enableVideoRecording: false,
      enableAIIntegration: false,
    },
    monitoring: {
      enableErrorTracking: true,
      enablePerformanceMonitoring: true,
      enableAnalytics: true,
    },
    security: {
      enableCSRF: true,
      sessionTimeout: 3600000, // 1 hour
    },
  },
  test: {
    api: {
      baseUrl: 'http://localhost:3003',
      timeout: 5000,
      retryAttempts: 0,
    },
    features: {
      enableCollaboration: false,
      enableAdvancedBlocks: false,
      enableAnalytics: false,
      enablePayments: false,
      enableVideoRecording: false,
      enableAIIntegration: false,
    },
    monitoring: {
      enableErrorTracking: false,
      enablePerformanceMonitoring: false,
      enableAnalytics: false,
    },
    security: {
      enableCSRF: false,
      sessionTimeout: 300000, // 5 minutes
    },
  },
} as const;

// Get environment-specific defaults
export const getEnvironmentDefaults = (env: Environment) => {
  return environmentDefaults[env];
};

// Check if running in specific environment
export const isEnvironment = (env: Environment): boolean => {
  return getCurrentEnvironment() === env;
};

// Environment validation
export const validateEnvironment = (): void => {
  const env = getCurrentEnvironment();
  const validEnvironments: Environment[] = ['development', 'production', 'test'];
  
  if (!validEnvironments.includes(env)) {
    throw new Error(`Invalid environment: ${env}. Must be one of: ${validEnvironments.join(', ')}`);
  }
};
