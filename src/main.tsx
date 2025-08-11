import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

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
          message.includes('attribution-reporting')) {
        return; // Suppress these warnings
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Permissions-Policy') ||
          message.includes('contentScript.js')) {
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
