# Centralized Error Handling System

## Overview

ResearchHub's centralized error handling system provides comprehensive error management, logging, and recovery mechanisms following Vibe-Coder-MCP architectural patterns.

## Features

### 🔧 Error Types and Categorization
- **Structured Error Types**: Comprehensive error categorization with severity levels
- **Error Context**: Rich contextual information for debugging and analysis
- **Error Codes**: Predefined error codes for consistent error identification
- **Error Metadata**: Structured metadata including recoverability and retry flags

### ⚡ Error Handler
- **Global Error Handler**: Centralized error processing and logging
- **Specialized Error Creation**: Factory methods for common error scenarios
- **Retry Mechanisms**: Exponential backoff retry logic for recoverable errors
- **Safe Async Operations**: Wrapper functions with error handling and fallbacks
- **Error Statistics**: Monitoring and analysis of error patterns

### ⚛️ React Error Boundaries
- **Generic Error Boundary**: Universal error catching for React components
- **Specialized Boundaries**: Context-specific error boundaries (Study Builder, Participant Session)
- **HOC Support**: Higher-order component for automatic error boundary wrapping
- **Hook Integration**: React hook for error handling in functional components

### 📝 Logging System
- **Structured Logging**: Multiple log levels with categorization
- **Specialized Loggers**: Domain-specific logging (Study, User Actions, API, Performance)
- **Local Storage**: Client-side log persistence with size management
- **Remote Logging**: Configurable remote log transmission
- **Log Analysis**: Filtering, statistics, and export capabilities

## Usage

### Basic Error Handling

```typescript
import { handleError, createAuthError, retryOperation, safeAsync } from './src/shared/errors';

// Handle any error
try {
  await riskyOperation();
} catch (error) {
  const handled = handleError(error, { userId: 'user-123' });
  // Error is categorized, logged, and ready for display
}

// Create specific error types
const authError = createAuthError('Invalid credentials', { userId: 'user-123' });

// Retry operations with exponential backoff
const result = await retryOperation(
  () => api.call('/endpoint'),
  3, // max attempts
  1000 // base delay ms
);

// Safe async operations with fallbacks
const { success, data, error, fallback } = await safeAsync(
  () => fetchUserData(),
  'defaultUserData' // fallback value
);
```

### React Components

```tsx
import { 
  ErrorBoundary, 
  StudyBuilderErrorBoundary,
  withErrorBoundary, 
  useErrorHandler 
} from './src/shared/errors';

// Wrap components with error boundaries
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// Specialized boundaries for different contexts
<StudyBuilderErrorBoundary>
  <StudyBuilder />
</StudyBuilderErrorBoundary>

// Use HOC for automatic error boundary wrapping
const SafeComponent = withErrorBoundary(MyComponent);

// Use hook in functional components
function MyComponent() {
  const { handleError, createError } = useErrorHandler();
  
  const handleClick = async () => {
    try {
      await someOperation();
    } catch (error) {
      handleError(error, { action: 'button-click' });
    }
  };
}
```

### Logging

```typescript
import { 
  logInfo, 
  logError, 
  logStudy, 
  logUserAction, 
  logApi 
} from './src/shared/errors';

// Log different types of events
logInfo('User logged in', { userId: 'user-123' });
logError('Database connection failed', { endpoint: '/api/users' });
logStudy('Study created', 'study-456', { blocks: 5 });
logUserAction('Button clicked', 'user-123', { button: 'submit' });
logApi('GET', '/api/studies', 200, 150); // method, url, status, duration
```

### Application Initialization

```typescript
import { initializeErrorHandling } from './src/shared/errors';

// Initialize error handling early in app startup
initializeErrorHandling({
  enableRemoteLogging: true,
  remoteEndpoint: '/api/logs',
  logLevel: 'info'
});
```

## Error Categories

- **VALIDATION**: Input validation and form errors
- **AUTHENTICATION**: Login, token, and credential errors
- **AUTHORIZATION**: Permission and access control errors
- **NETWORK**: Connection and network-related errors
- **DATABASE**: Database connection and query errors
- **API**: API endpoint and response errors
- **UI**: User interface and component errors
- **STUDY_CREATION**: Study building and configuration errors
- **BLOCK_RENDERING**: Study block display and interaction errors
- **PARTICIPANT_SESSION**: Participant experience errors
- **SUPABASE**: Supabase-specific integration errors
- **PAYMENT**: Payment processing errors
- **FILE_UPLOAD**: File handling and upload errors
- **CONFIGURATION**: System configuration errors

## Error Severity Levels

- **LOW**: Minor issues, doesn't affect core functionality
- **MEDIUM**: Important issues, some functionality affected
- **HIGH**: Critical issues, major functionality broken
- **CRITICAL**: System-breaking issues, requires immediate attention

## Log Levels

- **DEBUG**: Detailed debugging information
- **INFO**: General information messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for caught exceptions
- **CRITICAL**: Critical system issues

## Architecture

### Error Flow

1. **Error Occurs**: Error thrown in application code
2. **Error Handler**: Global or specific error handler catches error
3. **Categorization**: Error is analyzed and categorized
4. **Logging**: Error is logged with context and metadata
5. **Recovery**: Recovery mechanisms attempted if applicable
6. **User Feedback**: User-friendly error message displayed

### Component Structure

```
src/shared/errors/
├── ErrorTypes.ts          # Error interfaces, enums, and classes
├── ErrorHandler.ts        # Error handling logic and utilities
├── ErrorBoundary.tsx      # React error boundaries
├── Logger.ts             # Logging system implementation
└── index.ts              # Module exports and initialization
```

## Testing

Run the comprehensive test suite:

```bash
npm run errors:test      # Run error handling system tests
npm run errors:validate  # Validate system and run tests
npm run type-check       # Validate TypeScript compilation
```

## Best Practices

### Error Handling
- Always use `handleError()` for unhandled errors
- Create specific error types using factory methods
- Include relevant context information with errors
- Use retry mechanisms for recoverable operations
- Implement fallbacks for critical operations

### React Components
- Wrap major component trees with error boundaries
- Use specialized boundaries for different contexts
- Implement error fallback UIs for better user experience
- Use the error handler hook in functional components

### Logging
- Log user actions for analytics and debugging
- Use appropriate log levels for different message types
- Include relevant context with log messages
- Monitor error patterns and frequencies

### Configuration
- Configure error handling early in application startup
- Set appropriate log levels for different environments
- Enable remote logging for production environments
- Configure retry parameters based on operation types

## Integration Points

- **Global Error Handling**: Window error events and promise rejections
- **React Error Boundaries**: Component error catching and recovery
- **API Integration**: Automatic error handling for API calls
- **User Authentication**: Auth-specific error handling
- **Study Management**: Study creation and block-specific errors
- **Participant Experience**: Session and interaction error handling

## Future Enhancements

- **Error Analytics Dashboard**: Visual error monitoring and trends
- **Automated Error Reporting**: Integration with external monitoring services
- **Error Recovery Automation**: Smart recovery mechanisms based on error patterns
- **Performance Monitoring**: Integration with performance metrics
- **User Feedback Integration**: User-reported error correlation
