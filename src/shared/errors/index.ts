/**
 * Centralized Error Handling System for ResearchHub
 * Based on Vibe-Coder-MCP architectural patterns
 * 
 * This module provides:
 * - Structured error types and categorization
 * - Comprehensive error handling utilities
 * - React error boundaries for UI components
 * - Centralized logging system
 * - Error recovery and retry mechanisms
 */

// Error Types and Utilities
export * from './ErrorTypes.js';
export * from './ErrorHandler.js';

// React Error Boundaries
export * from './ErrorBoundary.jsx';

// Logging System
export * from './Logger.js';

// Re-export commonly used utilities for convenience
export { 
  globalErrorHandler as errorHandler,
  handleError,
  createAuthError,
  createValidationError,
  createDatabaseError,
  retryOperation,
  safeAsync 
} from './ErrorHandler.js';

export {
  globalLogger as logger,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logCritical,
  logStudy,
  logUserAction,
  logPerformance,
  logApi
} from './Logger.js';

export {
  ErrorBoundary,
  StudyBuilderErrorBoundary,
  ParticipantSessionErrorBoundary,
  withErrorBoundary,
  useErrorHandler
} from './ErrorBoundary.jsx';

/**
 * Initialize error handling system
 * Call this early in your application startup
 */
export function initializeErrorHandling(config?: {
  enableRemoteLogging?: boolean;
  remoteEndpoint?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}) {
  // Set up global error handlers
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      globalErrorHandler.handleError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        {
          url: window.location.href,
          timestamp: new Date(),
          additionalData: { type: 'unhandledrejection' }
        }
      );
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      globalErrorHandler.handleError(
        event.error || new Error(event.message),
        {
          url: window.location.href,
          timestamp: new Date(),
          additionalData: {
            type: 'javascript-error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      );
    });
  }

  // Update logger configuration if provided
  if (config) {
    import('./Logger.js').then(({ globalLogger, LogLevel }) => {
      globalLogger.updateConfig({
        enableRemoteLogging: config.enableRemoteLogging || false,
        remoteEndpoint: config.remoteEndpoint,
        level: config.logLevel ? LogLevel[config.logLevel.toUpperCase() as keyof typeof LogLevel] : LogLevel.INFO
      });
    });
  }

  console.info('✅ ResearchHub Error Handling System initialized');
}

import { globalErrorHandler } from './ErrorHandler.js';
