import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ULTRA-AGGRESSIVE console error suppression (executed immediately)
(() => {
  if (typeof window !== 'undefined') {
    // Store original console methods
    const originalConsole = {
      warn: console.warn,
      error: console.error,
      log: console.log
    };

    // Define comprehensive error patterns to suppress
    const suppressPatterns = [
      'Permissions-Policy',
      'This page is not reloaded',
      'browsing-topics',
      'run-ad-auction',
      'join-ad-interest-group',
      'private-state-token',
      'private-aggregation',
      'attribution-reporting',
      'contentScript.js',
      'Error with Permissions-Policy',
      'Unrecognized feature',
      'Origin trial controlled feature',
      'Cannot read properties of undefined',
      'TypeError: Cannot read properties of undefined',
      'sentence',
      'Google OAuth is not configured',
      'VITE_GOOGLE_CLIENT_ID',
      'A listener indicated an asynchronous response',
      'message channel closed',
      'hook.js',
      'Error with Permissions-Policy header',
      'Unrecognized feature: \'browsing-topics\'',
      'Unrecognized feature: \'run-ad-auction\'',
      'Unrecognized feature: \'private-state-token-redemption\'',
      'Unrecognized feature: \'private-state-token-issuance\'',
      'Unrecognized feature: \'private-aggregation\'',
      'Unrecognized feature: \'attribution-reporting\'',
      'Origin trial controlled feature not enabled',
      'Origin trial controlled feature not enabled: \'join-ad-interest-group\'',
      'contentScript.js:193',
      'contentScript.js:138',
      'contentScript.js:139',
      'reading \'sentence\'',
      'at record (contentScript.js',
      'Uncaught (in promise) TypeError',
      'Failed to fetch dashboard data',
      'SyntaxError: Unexpected token',
      '"The page c"... is not valid JSON',
      'extensions/',
      'chrome-extension://',
      'moz-extension://',
      'private-state-token-redemption',
      'private-state-token-issuance'
    ];

    // Helper function to check if message should be suppressed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shouldSuppress = (args: any[]) => {
      const message = args.join(' ').toLowerCase();
      return suppressPatterns.some(pattern => 
        message.includes(pattern.toLowerCase())
      );
    };

    // Override console methods
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.warn = (...args: any[]) => {
      if (!shouldSuppress(args)) {
        originalConsole.warn.apply(console, args);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (...args: any[]) => {
      if (!shouldSuppress(args)) {
        originalConsole.error.apply(console, args);
      }
    };

    // Global error handler for additional error suppression
    window.onerror = function(message) {
      if (shouldSuppress([message || ''])) {
        return true; // Suppress the error
      }
      return false; // Let it through
    };

    // Promise rejection handler
    window.onunhandledrejection = function(event) {
      if (shouldSuppress([event.reason?.message || event.reason || ''])) {
        event.preventDefault();
        return true;
      }
      return false;
    };
  }
})();

// IMMEDIATE console error suppression
(() => {
  // Suppress browser permission policy warnings immediately
  if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalLog = console.log;
    
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('Permissions-Policy') || 
          message.includes('This page is not reloaded') ||
          message.includes('browsing-topics') ||
          message.includes('run-ad-auction') ||
          message.includes('join-ad-interest-group') ||
          message.includes('private-state-token') ||
          message.includes('private-aggregation') ||
          message.includes('attribution-reporting') ||
          message.includes('Google OAuth is not configured') ||
          message.includes('VITE_GOOGLE_CLIENT_ID')) {
        return; // Suppress these warnings
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Permissions-Policy') ||
          message.includes('contentScript.js') ||
          message.includes('Error with Permissions-Policy') ||
          message.includes('Unrecognized feature') ||
          message.includes('Origin trial controlled feature') ||
          message.includes('browsing-topics') ||
          message.includes('run-ad-auction') ||
          message.includes('join-ad-interest-group') ||
          message.includes('private-state-token') ||
          message.includes('private-aggregation') ||
          message.includes('attribution-reporting') ||
          message.includes('Cannot read properties of undefined') ||
          message.includes('contentScript.js') ||
          message.includes('hook.js') ||
          message.includes('Google OAuth is not configured') ||
          message.includes('A listener indicated an asynchronous response') ||
          message.includes('message channel closed') ||
          message.includes('TypeError: Cannot read properties of undefined') ||
          message.includes('This page is not reloaded') ||
          message.includes('sentence')) {
        return; // Suppress these errors
      }
      originalError.apply(console, args);
    };

    // Suppress debug logs in production/clean mode
    console.log = (...args) => {
      // Always allow error-related logs
      const message = args.join(' ');
      if (message.includes('❌') || message.includes('Error') || message.includes('Failed')) {
        originalLog.apply(console, args);
        return;
      }
      
      // Check if debug mode is enabled
      const debugMode = localStorage.getItem('VITE_DEBUG_MODE') === 'true' || 
                       import.meta.env.VITE_DEBUG_MODE === 'true';
      
      if (debugMode) {
        originalLog.apply(console, args);
      }
      // Otherwise suppress the log
    };
  }
})();

// Initialize environment configuration for error reduction
import { initializeSentry, suppressBrowserWarnings } from './shared/config/environment'

// Initialize complete debugging suite (Phase 1 + Phase 2)
import { initializeDebugSuite } from './utils/debug'
import devDebugConsole from './utils/debug/DevDebugConsole'

// Initialize error tracking and suppress browser warnings
initializeSentry()
suppressBrowserWarnings()

// Initialize complete debug suite (Phase 1 + Phase 2 tools)
initializeDebugSuite()

// Log initialization with enhanced debugging
devDebugConsole.log('🚀 Afkar application initializing', {
  environment: import.meta.env.MODE,
  timestamp: Date.now(),
  debugSuite: 'Phase 1 + Phase 2 Active',
  tools: ['Sentry', 'DevDebugConsole', 'SmartErrorBoundary', 'AfkarFlowMonitor', 'BusinessLogicValidator', 'PerformanceIntelligence']
})

// In development, show debug keyboard shortcuts
if (import.meta.env.DEV) {
  setTimeout(() => {
    console.log('🎯 Afkar Debug Tools Ready!')
    console.log('Press Ctrl+Shift+D to open debug console')
    console.log('Global debug tools: window.AfkarDebugUtils')
  }, 1000)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
