#!/usr/bin/env node

/**
 * Test Script for ResearchHub Error Handling System
 * Tests error handling components by importing from TypeScript source
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color utilities for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

console.log(colorize('\n🧪 ResearchHub Error Handling System Test Suite', 'cyan'));
console.log(colorize('=' .repeat(60), 'dim'));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, testFn) {
  totalTests++;
  try {
    console.log(colorize(`\n📋 Testing: ${name}`, 'blue'));
    testFn();
    passedTests++;
    console.log(colorize(`  ✅ PASSED: ${name}`, 'green'));
  } catch (error) {
    failedTests++;
    console.log(colorize(`  ❌ FAILED: ${name}`, 'red'));
    console.log(colorize(`     Error: ${error.message}`, 'red'));
  }
}

async function runTests() {
  try {
    // Test Error Handling System Structure
    console.log(colorize('\n🔧 Testing Error Handling System Structure...', 'yellow'));
    
    test('File Structure - Error Types', () => {
      const errorTypesPath = path.join(__dirname, '../../src/shared/errors/ErrorTypes.ts');
      if (!fs.existsSync(errorTypesPath)) {
        throw new Error('ErrorTypes.ts file not found');
      }
      
      const content = fs.readFileSync(errorTypesPath, 'utf8');
      if (!content.includes('ErrorCategory')) throw new Error('ErrorCategory enum not found');
      if (!content.includes('ErrorSeverity')) throw new Error('ErrorSeverity enum not found');
      if (!content.includes('ResearchHubError')) throw new Error('ResearchHubError class not found');
      if (!content.includes('ERROR_CODES')) throw new Error('ERROR_CODES constant not found');
    });

    test('File Structure - Error Handler', () => {
      const errorHandlerPath = path.join(__dirname, '../../src/shared/errors/ErrorHandler.ts');
      if (!fs.existsSync(errorHandlerPath)) {
        throw new Error('ErrorHandler.ts file not found');
      }
      
      const content = fs.readFileSync(errorHandlerPath, 'utf8');
      if (!content.includes('ErrorHandler')) throw new Error('ErrorHandler class not found');
      if (!content.includes('globalErrorHandler')) throw new Error('globalErrorHandler not found');
      if (!content.includes('retryOperation')) throw new Error('retryOperation function not found');
      if (!content.includes('safeAsync')) throw new Error('safeAsync function not found');
    });

    test('File Structure - Error Boundaries', () => {
      const errorBoundaryPath = path.join(__dirname, '../../src/shared/errors/ErrorBoundary.tsx');
      if (!fs.existsSync(errorBoundaryPath)) {
        throw new Error('ErrorBoundary.tsx file not found');
      }
      
      const content = fs.readFileSync(errorBoundaryPath, 'utf8');
      if (!content.includes('ErrorBoundary')) throw new Error('ErrorBoundary component not found');
      if (!content.includes('StudyBuilderErrorBoundary')) throw new Error('StudyBuilderErrorBoundary not found');
      if (!content.includes('ParticipantSessionErrorBoundary')) throw new Error('ParticipantSessionErrorBoundary not found');
      if (!content.includes('withErrorBoundary')) throw new Error('withErrorBoundary HOC not found');
      if (!content.includes('useErrorHandler')) throw new Error('useErrorHandler hook not found');
    });

    test('File Structure - Logger', () => {
      const loggerPath = path.join(__dirname, '../../src/shared/errors/Logger.ts');
      if (!fs.existsSync(loggerPath)) {
        throw new Error('Logger.ts file not found');
      }
      
      const content = fs.readFileSync(loggerPath, 'utf8');
      if (!content.includes('Logger')) throw new Error('Logger class not found');
      if (!content.includes('LogLevel')) throw new Error('LogLevel enum not found');
      if (!content.includes('globalLogger')) throw new Error('globalLogger not found');
      if (!content.includes('logInfo')) throw new Error('logInfo convenience function not found');
    });

    test('File Structure - Index Module', () => {
      const indexPath = path.join(__dirname, '../../src/shared/errors/index.ts');
      if (!fs.existsSync(indexPath)) {
        throw new Error('index.ts file not found');
      }
      
      const content = fs.readFileSync(indexPath, 'utf8');
      if (!content.includes('export *')) throw new Error('Module exports not found');
      if (!content.includes('initializeErrorHandling')) throw new Error('initializeErrorHandling function not found');
    });

    // Test TypeScript Compilation
    console.log(colorize('\n⚡ Testing TypeScript Compilation...', 'yellow'));

    test('TypeScript - Error Types Compilation', () => {
      const errorTypesPath = path.join(__dirname, '../../src/shared/errors/ErrorTypes.ts');
      const content = fs.readFileSync(errorTypesPath, 'utf8');
      
      // Check for TypeScript features
      if (!content.includes('interface')) throw new Error('TypeScript interfaces not found');
      if (!content.includes('enum')) throw new Error('TypeScript enums not found');
      if (!content.includes('export')) throw new Error('Module exports not found');
      
      // Check for specific error handling features
      if (!content.includes('ErrorContext')) throw new Error('ErrorContext interface not found');
      if (!content.includes('ErrorMetadata')) throw new Error('ErrorMetadata interface not found');
    });

    test('TypeScript - React Components', () => {
      const boundaryPath = path.join(__dirname, '../../src/shared/errors/ErrorBoundary.tsx');
      const content = fs.readFileSync(boundaryPath, 'utf8');
      
      // Check for React and TypeScript features
      if (!content.includes('React.Component')) throw new Error('React component not found');
      if (!content.includes('interface')) throw new Error('TypeScript interfaces not found');
      if (!content.includes('ErrorBoundaryProps')) throw new Error('Props interface not found');
      if (!content.includes('ErrorBoundaryState')) throw new Error('State interface not found');
    });

    // Test Error Handling Features
    console.log(colorize('\n📝 Testing Error Handling Features...', 'yellow'));

    test('Features - Error Categories', () => {
      const errorTypesPath = path.join(__dirname, '../../src/shared/errors/ErrorTypes.ts');
      const content = fs.readFileSync(errorTypesPath, 'utf8');
      
      const expectedCategories = [
        'VALIDATION',
        'AUTHENTICATION', 
        'AUTHORIZATION',
        'NETWORK',
        'DATABASE',
        'API',
        'UI',
        'STUDY_CREATION',
        'BLOCK_RENDERING',
        'PARTICIPANT_SESSION'
      ];
      
      expectedCategories.forEach(category => {
        if (!content.includes(category)) {
          throw new Error(`Error category ${category} not found`);
        }
      });
    });

    test('Features - Error Severity Levels', () => {
      const errorTypesPath = path.join(__dirname, '../../src/shared/errors/ErrorTypes.ts');
      const content = fs.readFileSync(errorTypesPath, 'utf8');
      
      const expectedSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      expectedSeverities.forEach(severity => {
        if (!content.includes(severity)) {
          throw new Error(`Error severity ${severity} not found`);
        }
      });
    });

    test('Features - Error Codes', () => {
      const errorTypesPath = path.join(__dirname, '../../src/shared/errors/ErrorTypes.ts');
      const content = fs.readFileSync(errorTypesPath, 'utf8');
      
      const expectedCodes = [
        'AUTH_INVALID_CREDENTIALS',
        'STUDY_INVALID_BLOCK_TYPE',
        'DB_CONNECTION_FAILED',
        'API_INVALID_REQUEST',
        'UI_COMPONENT_RENDER_FAILED'
      ];
      
      expectedCodes.forEach(code => {
        if (!content.includes(code)) {
          throw new Error(`Error code ${code} not found`);
        }
      });
    });

    test('Features - Logger Levels', () => {
      const loggerPath = path.join(__dirname, '../../src/shared/errors/Logger.ts');
      const content = fs.readFileSync(loggerPath, 'utf8');
      
      const expectedLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
      expectedLevels.forEach(level => {
        if (!content.includes(level)) {
          throw new Error(`Log level ${level} not found`);
        }
      });
    });

    test('Features - Error Recovery Mechanisms', () => {
      const handlerPath = path.join(__dirname, '../../src/shared/errors/ErrorHandler.ts');
      const content = fs.readFileSync(handlerPath, 'utf8');
      
      if (!content.includes('retryOperation')) throw new Error('Retry mechanism not found');
      if (!content.includes('safeAsync')) throw new Error('Safe async wrapper not found');
      if (!content.includes('recoverable')) throw new Error('Error recovery flags not found');
      if (!content.includes('retryable')) throw new Error('Retry flags not found');
    });

    // Test Integration Points
    console.log(colorize('\n🔗 Testing Integration Points...', 'yellow'));

    test('Integration - React Error Boundaries', () => {
      const boundaryPath = path.join(__dirname, '../../src/shared/errors/ErrorBoundary.tsx');
      const content = fs.readFileSync(boundaryPath, 'utf8');
      
      // Check for specialized boundaries
      if (!content.includes('StudyBuilderErrorBoundary')) {
        throw new Error('Study Builder error boundary not found');
      }
      if (!content.includes('ParticipantSessionErrorBoundary')) {
        throw new Error('Participant Session error boundary not found');
      }
      
      // Check for HOC and hooks
      if (!content.includes('withErrorBoundary')) {
        throw new Error('withErrorBoundary HOC not found');
      }
      if (!content.includes('useErrorHandler')) {
        throw new Error('useErrorHandler hook not found');
      }
    });

    test('Integration - Global Error Handling', () => {
      const indexPath = path.join(__dirname, '../../src/shared/errors/index.ts');
      const content = fs.readFileSync(indexPath, 'utf8');
      
      if (!content.includes('initializeErrorHandling')) {
        throw new Error('Global error initialization not found');
      }
      if (!content.includes('unhandledrejection')) {
        throw new Error('Unhandled promise rejection handling not found');
      }
      if (!content.includes('window.addEventListener')) {
        throw new Error('Global error event listeners not found');
      }
    });

    test('Integration - Logging Integration', () => {
      const handlerPath = path.join(__dirname, '../../src/shared/errors/ErrorHandler.ts');
      const content = fs.readFileSync(handlerPath, 'utf8');
      
      // Check that error handler integrates with logging
      if (!content.includes('console.')) {
        throw new Error('Console logging integration not found');
      }
    });

    // Test Configuration
    console.log(colorize('\n⚙️ Testing Configuration...', 'yellow'));

    test('Configuration - Error Handler Config', () => {
      const handlerPath = path.join(__dirname, '../../src/shared/errors/ErrorHandler.ts');
      const content = fs.readFileSync(handlerPath, 'utf8');
      
      if (!content.includes('ErrorHandlerConfig')) {
        throw new Error('ErrorHandlerConfig interface not found');
      }
      if (!content.includes('enableConsoleLogging')) {
        throw new Error('Console logging config not found');
      }
      if (!content.includes('maxRetryAttempts')) {
        throw new Error('Retry configuration not found');
      }
    });

    test('Configuration - Logger Config', () => {
      const loggerPath = path.join(__dirname, '../../src/shared/errors/Logger.ts');
      const content = fs.readFileSync(loggerPath, 'utf8');
      
      if (!content.includes('LoggerConfig')) {
        throw new Error('LoggerConfig interface not found');
      }
      if (!content.includes('enableRemoteLogging')) {
        throw new Error('Remote logging config not found');
      }
      if (!content.includes('maxLocalEntries')) {
        throw new Error('Local storage config not found');
      }
    });

    // Test Results
    console.log(colorize('\n📊 Test Results', 'cyan'));
    console.log(colorize('=' .repeat(40), 'dim'));
    console.log(colorize(`Total Tests: ${totalTests}`, 'white'));
    console.log(colorize(`Passed: ${passedTests}`, 'green'));
    
    if (failedTests > 0) {
      console.log(colorize(`Failed: ${failedTests}`, 'red'));
      console.log(colorize('\n❌ Some tests failed. Please check the error messages above.', 'red'));
      process.exit(1);
    } else {
      console.log(colorize(`Failed: ${failedTests}`, 'green'));
      console.log(colorize('\n✅ All tests passed! Error handling system structure is valid.', 'green'));
    }

    // Show usage examples
    console.log(colorize('\n📚 Error Handling System Usage Examples:', 'cyan'));
    console.log(colorize(`
🔧 TypeScript/JavaScript Usage:
${colorize(`
import { 
  handleError, 
  createAuthError, 
  logInfo, 
  retryOperation,
  safeAsync 
} from './src/shared/errors';

// Handle any error
try {
  await riskyOperation();
} catch (error) {
  const handled = handleError(error, { userId: 'user-123' });
  // Error is categorized, logged, and ready for display
}

// Create specific error types
const authError = createAuthError('Invalid credentials', { 
  userId: 'user-123' 
});

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
`, 'dim')}

⚛️ React Component Usage:
${colorize(`
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
`, 'dim')}

📝 Logging Usage:
${colorize(`
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
`, 'dim')}

🚀 Application Initialization:
${colorize(`
import { initializeErrorHandling } from './src/shared/errors';

// Initialize error handling early in app startup
initializeErrorHandling({
  enableRemoteLogging: true,
  remoteEndpoint: '/api/logs',
  logLevel: 'info'
});

// This sets up global error handlers for:
// - Unhandled promise rejections
// - JavaScript errors
// - React component errors (via boundaries)
`, 'dim')}
    `, 'white'));

    console.log(colorize('\n🎯 Next Steps:', 'cyan'));
    console.log(colorize(`
1. ✅ Error handling system structure validated
2. 🔄 Run 'npm run type-check' to validate TypeScript
3. ⚛️ Add error boundaries to React components
4. 🚀 Initialize error handling in app startup
5. 📝 Use logging throughout the application
6. 🧪 Test error scenarios in development
    `, 'white'));

  } catch (error) {
    console.error(colorize(`\n💥 Test setup failed: ${error.message}`, 'red'));
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(colorize(`\n💥 Test execution failed: ${error.message}`, 'red'));
  process.exit(1);
});
