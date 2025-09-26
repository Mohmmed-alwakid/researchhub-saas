import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';


/**
 * Enhanced Error Boundary with Sentry Integration
 * Provides comprehensive error handling for ResearchHub components
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class SentryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName, onError } = this.props;

    // Enhanced error context for ResearchHub
    const errorId = Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', true);
      scope.setTag('component', componentName || 'unknown');
      scope.setContext('errorBoundary', {
        componentName,
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      });
      scope.setContext('errorDetails', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      return Sentry.captureException(error);
    });

    this.setState({ errorId });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Component:', componentName);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Sentry Event ID:', errorId);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback, componentName } = this.props;
      const { error, errorId } = this.state;

      // Custom fallback UI if provided
      if (fallback) {
        return fallback;
      }

      // Default ResearchHub error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Oops! Something went wrong
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                {componentName ? `Error in ${componentName} component` : 'An unexpected error occurred'}
              </p>
              
              {error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700">
                    <p><strong>Error:</strong> {error.message}</p>
                    {errorId && <p><strong>Error ID:</strong> {errorId}</p>}
                  </div>
                </details>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={this.handleRetry}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reload Page
              </button>
              
              <a
                href="mailto:support@researchhub.com?subject=Error Report&body=Error ID: ${errorId}"
                className="text-center text-sm text-indigo-600 hover:text-indigo-500"
              >
                Report this issue
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with Sentry Error Boundary
 */
export function withSentryErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    componentName?: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  }
) {
  const WithErrorBoundary = (props: P) => (
    <SentryErrorBoundary
      fallback={options?.fallback}
      componentName={options?.componentName || WrappedComponent.displayName || WrappedComponent.name}
      onError={options?.onError}
    >
      <WrappedComponent {...props} />
    </SentryErrorBoundary>
  );

  WithErrorBoundary.displayName = `withSentryErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundary;
}

/**
 * Specialized Error Boundaries for ResearchHub features
 */
export const StudyBuilderErrorBoundary = ({ children }: { children: ReactNode }) => (
  <SentryErrorBoundary
    componentName="StudyBuilder"
    fallback={
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Builder Error</h3>
        <p className="text-gray-600 mb-4">There was an issue with the study builder.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Restart Study Builder
        </button>
      </div>
    }
  >
    {children}
  </SentryErrorBoundary>
);

export const ParticipantViewErrorBoundary = ({ children }: { children: ReactNode }) => (
  <SentryErrorBoundary
    componentName="ParticipantView"
    fallback={
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Loading Error</h3>
        <p className="text-gray-600 mb-4">There was an issue loading this study.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Return to Dashboard
        </button>
      </div>
    }
  >
    {children}
  </SentryErrorBoundary>
);

export const DashboardErrorBoundary = ({ children }: { children: ReactNode }) => (
  <SentryErrorBoundary
    componentName="Dashboard"
    fallback={
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
        <p className="text-gray-600 mb-4">There was an issue loading your dashboard.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Refresh Dashboard
        </button>
      </div>
    }
  >
    {children}
  </SentryErrorBoundary>
);

export default SentryErrorBoundary;
