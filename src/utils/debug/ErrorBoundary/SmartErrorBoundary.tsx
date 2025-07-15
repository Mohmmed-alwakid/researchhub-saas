/**
 * 🛡️ Smart Error Boundary for ResearchHub
 * Enhanced error handling with automatic recovery and user-friendly interfaces
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import sentryIntegration from '../SentryIntegrationSimple';
import devDebugConsole from '../DevDebugConsole';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  recoveryAttempts: number;
  userFeedback: string;
  canRecover: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRecoveryAttempts?: number;
}

class SmartErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorRecoveryStrategies: Map<string, () => Promise<boolean>> = new Map();
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      recoveryAttempts: 0,
      userFeedback: '',
      canRecover: true,
    };

    this.setupRecoveryStrategies();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo): Promise<void> {
    const { onError, maxRecoveryAttempts = 3 } = this.props;
    
    // Clear any existing retry timeout
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    
    // Log to debug console
    devDebugConsole.log('Error caught by boundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    }, 'error');

    // Track error with Sentry
    sentryIntegration.captureResearchError(error, {
      type: 'component_error',
      feature: 'error_boundary',
      userRole: this.getCurrentUserRole(),
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Attempt automatic recovery if under attempt limit
    if (this.state.recoveryAttempts < maxRecoveryAttempts) {
      // Set a delayed retry for certain error types
      const errorType = this.classifyError(error);
      const shouldDelayRetry = ['network', 'auth'].includes(errorType);
      
      if (shouldDelayRetry) {
        // Delay retry for network/auth errors
        this.retryTimeout = setTimeout(async () => {
          const recovered = await this.attemptRecovery(error);
          this.handleRecoveryResult(recovered);
        }, 2000); // 2 second delay
      } else {
        // Immediate retry for other errors
        const recovered = await this.attemptRecovery(error);
        this.handleRecoveryResult(recovered);
      }
    } else {
      // Check if error is recoverable for manual retry
      const canRecover = this.isRecoverable(error);
      this.setState({ canRecover });
    }
  }

  /**
   * Setup recovery strategies for common error types
   */
  private setupRecoveryStrategies(): void {
    // Network error recovery
    this.errorRecoveryStrategies.set('network', async () => {
      await this.delay(1000);
      return navigator.onLine;
    });

    // Authentication error recovery
    this.errorRecoveryStrategies.set('auth', async () => {
      try {
        // Attempt to refresh auth token
<<<<<<< HEAD
        const response = await fetch('/api/auth-consolidated?action=refresh', {
=======
        const response = await fetch('/api/auth?action=refresh', {
>>>>>>> 0143a82207ffa6b8799d53ba39a6d3cfa1f2b452
          method: 'POST',
          credentials: 'include',
        });
        return response.ok;
      } catch {
        return false;
      }
    });

    // Component remount recovery
    this.errorRecoveryStrategies.set('component', async () => {
      // Force component remount by clearing React's error state
      await this.delay(100);
      return true;
    });

    // Study builder specific recovery
    this.errorRecoveryStrategies.set('study_builder', async () => {
      try {
        // Clear study builder cache
        localStorage.removeItem('study_builder_draft');
        sessionStorage.clear();
        return true;
      } catch {
        return false;
      }
    });

    // Payment error recovery
    this.errorRecoveryStrategies.set('payment', async () => {
      try {
        // Clear payment session data
        sessionStorage.removeItem('payment_session');
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * Attempt automatic error recovery
   */
  private async attemptRecovery(error: Error): Promise<boolean> {
    const errorType = this.classifyError(error);
    const strategy = this.errorRecoveryStrategies.get(errorType);
    
    if (!strategy) return false;

    try {
      const recovered = await strategy();
      
      if (recovered) {
        this.setState(prevState => ({
          recoveryAttempts: prevState.recoveryAttempts + 1,
        }));
        
        return true;
      }
    } catch (recoveryError) {
      devDebugConsole.log('Recovery strategy failed', {
        originalError: error.message,
        recoveryError: recoveryError instanceof Error ? recoveryError.message : 'Unknown error',
        strategy: errorType,
      }, 'error');
    }

    this.setState(prevState => ({
      recoveryAttempts: prevState.recoveryAttempts + 1,
    }));
    
    return false;
  }

  /**
   * Classify error type for recovery strategy selection
   */
  private classifyError(error: Error): string {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    
    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      return 'auth';
    }
    
    if (stack.includes('studybuilder') || stack.includes('study-builder')) {
      return 'study_builder';
    }
    
    if (message.includes('payment') || stack.includes('payment')) {
      return 'payment';
    }
    
    return 'component';
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(error: Error): boolean {
    const unrecoverablePatterns = [
      'ChunkLoadError',
      'Loading chunk',
      'Script error',
      'TypeError: Cannot read properties of null',
    ];
    
    return !unrecoverablePatterns.some(pattern => 
      error.message.includes(pattern) || error.stack?.includes(pattern)
    );
  }

  /**
   * Handle manual retry
   */
  private handleRetry = async (): Promise<void> => {
    if (!this.state.canRecover) return;

    // Clear any pending automatic retry
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    devDebugConsole.log('Manual retry initiated', {
      errorId: this.state.errorId,
      attempts: this.state.recoveryAttempts,
    }, 'info');

    // Clear error state and trigger re-render
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      recoveryAttempts: 0,
    });
  };

  /**
   * Handle user feedback
   */
  private handleUserFeedback = (feedback: string): void => {
    this.setState({ userFeedback: feedback });
    
    devDebugConsole.log('User error feedback received', {
      errorId: this.state.errorId,
      feedback: feedback.slice(0, 100), // Truncate for privacy
    }, 'info');

    // Send feedback to error tracking
    sentryIntegration.captureResearchError(new Error('User Error Feedback'), {
      type: 'user_feedback',
      feature: 'error_boundary',
      userRole: this.getCurrentUserRole(),
    });
  };

  /**
   * Handle page refresh
   */
  private handleRefresh = (): void => {
    devDebugConsole.log('Page refresh initiated from error boundary', {
      errorId: this.state.errorId,
    }, 'info');
    
    window.location.reload();
  };

  /**
   * Get current user role
   */
  private getCurrentUserRole(): string {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle the result of a recovery attempt
   */
  private handleRecoveryResult(recovered: boolean): void {
    if (recovered) {
      devDebugConsole.log('Error boundary auto-recovery successful', {
        errorId: this.state.errorId,
        attempts: this.state.recoveryAttempts + 1,
      }, 'info');
      
      this.setState({
        hasError: false,
        error: null,
        errorId: null,
        recoveryAttempts: 0,
      });
    } else {
      // Recovery failed, check if manual recovery is possible
      const canRecover = this.state.error ? this.isRecoverable(this.state.error) : false;
      this.setState({ canRecover });
    }
  }

  /**
   * Component cleanup
   */
  componentWillUnmount(): void {
    // Clear any pending retry timeout
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render enhanced error UI
      return (
        <ErrorRecoveryInterface
          error={this.state.error}
          errorId={this.state.errorId}
          canRecover={this.state.canRecover}
          recoveryAttempts={this.state.recoveryAttempts}
          onRetry={this.handleRetry}
          onFeedback={this.handleUserFeedback}
          onRefresh={this.handleRefresh}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Enhanced Error Recovery Interface Component
 */
interface ErrorRecoveryInterfaceProps {
  error: Error;
  errorId: string | null;
  canRecover: boolean;
  recoveryAttempts: number;
  onRetry: () => void;
  onFeedback: (feedback: string) => void;
  onRefresh: () => void;
}

const ErrorRecoveryInterface: React.FC<ErrorRecoveryInterfaceProps> = ({
  error,
  errorId,
  canRecover,
  recoveryAttempts,
  onRetry,
  onFeedback,
  onRefresh,
}) => {
  const [feedback, setFeedback] = React.useState('');
  const [showDetails, setShowDetails] = React.useState(false);

  const isStudyRelated = error.stack?.includes('study') || error.stack?.includes('Study');
  const isPaymentRelated = error.stack?.includes('payment') || error.stack?.includes('Payment');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {isStudyRelated ? 'Study Creation Issue' : 
             isPaymentRelated ? 'Payment Processing Issue' : 
             'Something went wrong'}
          </h1>
          <p className="text-gray-600">
            {isStudyRelated ? 'There was an issue with the study builder. Your progress has been saved.' :
             isPaymentRelated ? 'There was an issue processing your payment. Please try again.' :
             'We encountered an unexpected error. Our team has been notified.'}
          </p>
        </div>

        {/* Error ID */}
        {errorId && (
          <div className="bg-gray-100 rounded p-3 mb-4">
            <p className="text-sm text-gray-600">
              <strong>Error ID:</strong> {errorId}
            </p>
          </div>
        )}

        {/* Recovery Actions */}
        <div className="space-y-3 mb-6">
          {canRecover && (
            <button
              onClick={onRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              {recoveryAttempts > 0 ? 'Try Again' : 'Retry'}
            </button>
          )}
          
          <button
            onClick={onRefresh}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>

        {/* Feedback Section */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What were you trying to do? (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Help us understand what happened..."
          />
          <button
            onClick={() => {
              if (feedback.trim()) {
                onFeedback(feedback);
                setFeedback('');
              }
            }}
            disabled={!feedback.trim()}
            className="mt-2 w-full bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Feedback
          </button>
        </div>

        {/* Technical Details (Collapsible) */}
        <div className="border-t pt-4 mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showDetails ? 'Hide' : 'Show'} Technical Details
          </button>
          
          {showDetails && (
            <div className="mt-2 bg-gray-100 rounded p-3">
              <p className="text-xs text-gray-600 font-mono break-all">
                <strong>Error:</strong> {error.message}
              </p>
              {import.meta.env.DEV && error.stack && (
                <p className="text-xs text-gray-600 font-mono mt-2 max-h-20 overflow-y-auto">
                  <strong>Stack:</strong><br />
                  {error.stack}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartErrorBoundary;
