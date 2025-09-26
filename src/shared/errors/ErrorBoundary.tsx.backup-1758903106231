/**
 * React Error Boundary Components for ResearchHub
 * Provides graceful error handling in React components
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { ResearchHubError, ErrorCategory, ErrorSeverity, ERROR_CODES } from './ErrorTypes.js';
import { globalErrorHandler } from './ErrorHandler.js';
import { Card } from '../../client/components/ui/Card';
import { Button } from '../../client/components/ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: ResearchHubError;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: ResearchHubError, errorId: string, retry: () => void) => ReactNode;
  onError?: (error: ResearchHubError, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  category?: ErrorCategory;
}

/**
 * Generic Error Boundary for catching React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const researchHubError = new ResearchHubError(
      error.message,
      {
        category: this.props.category || ErrorCategory.UI,
        severity: ErrorSeverity.HIGH,
        code: ERROR_CODES.UI_COMPONENT_RENDER_FAILED,
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date(),
          additionalData: {
            componentStack: errorInfo.componentStack,
            errorBoundary: this.constructor.name,
            retryCount: this.retryCount
          }
        },
        recoverable: true,
        retryable: this.retryCount < this.maxRetries,
        userMessage: 'Something went wrong with this component. You can try refreshing the page.',
        technicalMessage: error.message
      },
      error
    );

    const handledError = globalErrorHandler.handleError(researchHubError);

    this.setState({
      error: handledError,
      errorInfo,
      errorId: handledError.errorId
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(handledError, errorInfo);
    }
  }

  private handleRetry = () => {
    if (this.retryCount >= this.maxRetries) return;
    
    this.retryCount++;
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorId) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorId, this.handleRetry);
      }

      // Default error UI
      return (
        <Card variant="elevated" padding="md" className="bg-red-50 border-red-200 m-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{this.state.error.metadata.userMessage}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                {this.props.enableRetry && this.retryCount < this.maxRetries && (
                  <button
                    type="button"
                    onClick={this.handleRetry}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Try Again ({this.maxRetries - this.retryCount} attempts left)
                  </button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-red-800 border-red-300 hover:bg-red-50"
                >
                  Refresh Page
                </Button>
              </div>
              <details className="mt-4">
                <summary className="text-sm text-red-600 cursor-pointer hover:text-red-500">
                  Technical Details (Error ID: {this.state.errorId})
                </summary>
                <div className="mt-2 text-xs text-red-600 font-mono bg-red-100 p-2 rounded">
                  <div>Category: {this.state.error.metadata.category}</div>
                  <div>Code: {this.state.error.metadata.code}</div>
                  <div>Message: {this.state.error.metadata.technicalMessage}</div>
                </div>
              </details>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized Error Boundary for Study Builder components
 */
export class StudyBuilderErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const researchHubError = globalErrorHandler.createStudyCreationError(
      `Study Builder component error: ${error.message}`,
      {
        url: window.location.href,
        timestamp: new Date(),
        additionalData: {
          componentStack: errorInfo.componentStack,
          errorBoundary: 'StudyBuilderErrorBoundary'
        }
      }
    );

    this.setState({
      error: researchHubError,
      errorInfo,
      errorId: researchHubError.errorId
    });

    if (this.props.onError) {
      this.props.onError(researchHubError, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="study-builder-error bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Study Builder Issue
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>There was an issue with the study builder. Your progress has been saved.</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Reload Study Builder
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Boundary for Participant Session components
 */
export class ParticipantSessionErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const researchHubError = new ResearchHubError(
      error.message,
      {
        category: ErrorCategory.PARTICIPANT_SESSION,
        severity: ErrorSeverity.HIGH,
        code: ERROR_CODES.UI_COMPONENT_RENDER_FAILED,
        context: {
          url: window.location.href,
          timestamp: new Date(),
          additionalData: {
            componentStack: errorInfo.componentStack,
            errorBoundary: 'ParticipantSessionErrorBoundary'
          }
        },
        recoverable: true,
        retryable: true,
        userMessage: 'We encountered an issue during your session. Please try continuing or refresh the page.',
        technicalMessage: error.message
      },
      error
    );

    globalErrorHandler.handleError(researchHubError);

    this.setState({
      error: researchHubError,
      errorInfo,
      errorId: researchHubError.errorId
    });

    if (this.props.onError) {
      this.props.onError(researchHubError, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="participant-session-error bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Session Issue
          </h3>
          <p className="text-blue-700 mb-4">
            We encountered a technical issue with your session. Don't worry - your progress is safe.
          </p>
          <div className="space-x-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Continue Session
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-white hover:bg-gray-50 text-blue-600 px-4 py-2 rounded font-medium border border-blue-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...boundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Hook for error handling in functional components
 */
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: Record<string, unknown>) => {
    return globalErrorHandler.handleError(error, {
      url: window.location.href,
      timestamp: new Date(),
      additionalData: context
    });
  }, []);

  const createError = React.useCallback((
    message: string,
    category: ErrorCategory = ErrorCategory.UI,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ) => {
    return new ResearchHubError(message, {
      category,
      severity,
      code: ERROR_CODES.UI_COMPONENT_RENDER_FAILED,
      context: {
        url: window.location.href,
        timestamp: new Date()
      },
      recoverable: true,
      retryable: false,
      userMessage: message
    });
  }, []);

  return { handleError, createError };
}
