/**
 * Error Handler Utilities for ResearchHub
 * Provides comprehensive error handling, logging, and recovery mechanisms
 */

import { ResearchHubError, ErrorCategory, ErrorSeverity, ErrorContext, ERROR_CODES } from './ErrorTypes.js';

export interface ErrorHandlerConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxRetryAttempts: number;
  retryDelayMs: number;
  enableErrorReporting: boolean;
}

export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorLog: ResearchHubError[] = [];
  private maxLogSize = 1000;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableRemoteLogging: false,
      logLevel: 'error',
      maxRetryAttempts: 3,
      retryDelayMs: 1000,
      enableErrorReporting: true,
      ...config
    };
  }

  /**
   * Handle and log errors with context
   */
  public handleError(error: Error | ResearchHubError, context?: ErrorContext): ResearchHubError {
    let researchHubError: ResearchHubError;

    if (error instanceof ResearchHubError) {
      researchHubError = error;
    } else {
      researchHubError = this.convertToResearchHubError(error, context);
    }

    // Log the error
    this.logError(researchHubError);

    // Store in memory for debugging
    this.storeError(researchHubError);

    // Report to external service if enabled
    if (this.config.enableErrorReporting) {
      this.reportError(researchHubError);
    }

    return researchHubError;
  }

  /**
   * Create standardized errors for common scenarios
   */
  public createAuthenticationError(message: string, context?: ErrorContext): ResearchHubError {
    return new ResearchHubError(message, {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      context,
      recoverable: true,
      retryable: false,
      userMessage: 'Please check your login credentials and try again.',
      technicalMessage: message
    });
  }

  public createValidationError(message: string, context?: ErrorContext): ResearchHubError {
    return new ResearchHubError(message, {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      code: ERROR_CODES.UI_FORM_VALIDATION_FAILED,
      context,
      recoverable: true,
      retryable: false,
      userMessage: 'Please check the form fields and correct any errors.',
      technicalMessage: message
    });
  }

  public createDatabaseError(message: string, context?: ErrorContext): ResearchHubError {
    return new ResearchHubError(message, {
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.CRITICAL,
      code: ERROR_CODES.DB_CONNECTION_FAILED,
      context,
      recoverable: true,
      retryable: true,
      userMessage: 'We\'re experiencing technical difficulties. Please try again in a moment.',
      technicalMessage: message
    });
  }

  public createStudyCreationError(message: string, context?: ErrorContext): ResearchHubError {
    return new ResearchHubError(message, {
      category: ErrorCategory.STUDY_CREATION,
      severity: ErrorSeverity.HIGH,
      code: ERROR_CODES.STUDY_MISSING_REQUIRED_FIELDS,
      context,
      recoverable: true,
      retryable: false,
      userMessage: 'There was an issue creating your study. Please check all required fields.',
      technicalMessage: message
    });
  }

  /**
   * Retry mechanism with exponential backoff
   */
  public async retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts?: number,
    delayMs?: number
  ): Promise<T> {
    const attempts = maxAttempts || this.config.maxRetryAttempts;
    const delay = delayMs || this.config.retryDelayMs;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === attempts) {
          throw this.handleError(error as Error, {
            additionalData: { 
              retryAttempts: attempt,
              finalAttempt: true
            }
          });
        }

        // Wait before retrying with exponential backoff
        await this.delay(delay * Math.pow(2, attempt - 1));
      }
    }

    throw new Error('Retry operation failed after maximum attempts');
  }

  /**
   * Safe async operation wrapper
   */
  public async safeAsync<T>(
    operation: () => Promise<T>,
    fallback?: T,
    context?: ErrorContext
  ): Promise<{ success: true; data: T } | { success: false; error: ResearchHubError; fallback?: T }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const handledError = this.handleError(error as Error, context);
      return { 
        success: false, 
        error: handledError,
        ...(fallback !== undefined && { fallback })
      };
    }
  }

  /**
   * Get error statistics for monitoring
   */
  public getErrorStats() {
    const stats = {
      totalErrors: this.errorLog.length,
      errorsByCategory: {} as Record<string, number>,
      errorsBySeverity: {} as Record<string, number>,
      recentErrors: this.errorLog.slice(-10),
      topErrors: {} as Record<string, number>
    };

    this.errorLog.forEach(error => {
      // Count by category
      stats.errorsByCategory[error.metadata.category] = 
        (stats.errorsByCategory[error.metadata.category] || 0) + 1;

      // Count by severity
      stats.errorsBySeverity[error.metadata.severity] = 
        (stats.errorsBySeverity[error.metadata.severity] || 0) + 1;

      // Count by error code
      stats.topErrors[error.metadata.code] = 
        (stats.topErrors[error.metadata.code] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error log (useful for testing)
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  private convertToResearchHubError(error: Error, context?: ErrorContext): ResearchHubError {
    // Try to categorize based on error message and type
    let category = ErrorCategory.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let code: string = ERROR_CODES.UNKNOWN_ERROR;

    if (error.name === 'TypeError') {
      category = ErrorCategory.UI;
      code = ERROR_CODES.UI_COMPONENT_RENDER_FAILED;
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      category = ErrorCategory.NETWORK;
      severity = ErrorSeverity.HIGH;
      code = ERROR_CODES.API_SERVICE_UNAVAILABLE;
    } else if (error.message.includes('supabase') || error.message.includes('database')) {
      category = ErrorCategory.DATABASE;
      severity = ErrorSeverity.CRITICAL;
      code = ERROR_CODES.DB_CONNECTION_FAILED;
    }

    return new ResearchHubError(error.message, {
      category,
      severity,
      code,
      context,
      recoverable: true,
      retryable: category === ErrorCategory.NETWORK || category === ErrorCategory.DATABASE,
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: error.message
    }, error);
  }

  private logError(error: ResearchHubError): void {
    if (!this.config.enableConsoleLogging) return;

    const logMethod = this.getLogMethod(error.metadata.severity);
    const logMessage = `[${error.errorId}] ${error.metadata.category}: ${error.message}`;
    
    logMethod(logMessage, {
      errorId: error.errorId,
      category: error.metadata.category,
      severity: error.metadata.severity,
      code: error.metadata.code,
      context: error.metadata.context,
      stackTrace: error.stackTrace
    });
  }

  private getLogMethod(severity: ErrorSeverity) {
    switch (severity) {
      case ErrorSeverity.LOW:
        return console.info;
      case ErrorSeverity.MEDIUM:
        return console.warn;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private storeError(error: ResearchHubError): void {
    this.errorLog.push(error);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize + 100);
    }
  }

  private async reportError(error: ResearchHubError): Promise<void> {
    // In the future, this could send to external error reporting service
    // For now, just log that we would report it
    if (error.metadata.severity === ErrorSeverity.CRITICAL) {
      console.error('CRITICAL ERROR WOULD BE REPORTED:', error.toJSON());
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global error handler instance
export const globalErrorHandler = new ErrorHandler({
  enableConsoleLogging: true,
  enableRemoteLogging: false,
  logLevel: 'error',
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
  enableErrorReporting: true
});

// Convenience functions for common error handling patterns
export const handleError = (error: Error | ResearchHubError, context?: ErrorContext) => 
  globalErrorHandler.handleError(error, context);

export const createAuthError = (message: string, context?: ErrorContext) => 
  globalErrorHandler.createAuthenticationError(message, context);

export const createValidationError = (message: string, context?: ErrorContext) => 
  globalErrorHandler.createValidationError(message, context);

export const createDatabaseError = (message: string, context?: ErrorContext) => 
  globalErrorHandler.createDatabaseError(message, context);

export const retryOperation = <T>(operation: () => Promise<T>, maxAttempts?: number, delayMs?: number) => 
  globalErrorHandler.retryOperation(operation, maxAttempts, delayMs);

export const safeAsync = <T>(operation: () => Promise<T>, fallback?: T, context?: ErrorContext) => 
  globalErrorHandler.safeAsync(operation, fallback, context);
