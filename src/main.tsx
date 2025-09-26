import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Import development console manager for clean development experience
import './utils/devConsoleManager'

// Initialize Sentry for comprehensive error tracking
import { initSentry } from './config/sentry'
import './utils/sentryManagement' // Enable Sentry management functions in development
initSentry()

// Enhanced error filtering: Only suppress browser extension noise, allow real errors
const browserNoisePatterns = [
  // Browser extension interference (safe to suppress)
  'permissions-policy',
  'browsing-topics',
  'private-state-token',
  'private-aggregation',
  'attribution-reporting',
  'contentscript.js',
  'chrome-extension://',
  'moz-extension://',
  'extensions/',
  'hook.js'
];


// Store original methods for selective restoration
const originalConsole = {
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
  log: console.log
};

// Production-safe error filtering
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isBrowserNoise = (args: any[]): boolean => {
  const message = args.map(arg => String(arg)).join(' ').toLowerCase();
  return browserNoisePatterns.some(pattern => message.includes(pattern.toLowerCase()));
};

// Enhanced console methods - suppress only browser noise, preserve real errors
if (import.meta.env.PROD) {
  // In production: Filter browser noise but allow application errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
  };
} else {
  // In development: Show everything for debugging
}

// Global error handlers - only suppress browser extension noise
if (typeof window !== 'undefined') {
  window.onerror = (msg, src, _ln, _col, err) => {
    const errorMessage = [msg, src, err?.message].join(' ');
    // Only suppress if it's clearly browser extension noise
    return isBrowserNoise([errorMessage]);
  };

  window.onunhandledrejection = (event) => {
    const reason = event.reason?.message || event.reason || '';
    // Only suppress if it's browser extension noise
    if (isBrowserNoise([reason])) {
      event.preventDefault();
      return true;
    }
    return false;
  };
}

createRoot(document.getElementById('root')!).render(
  
// Minimal error suppression for browser-specific warnings
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Only suppress known browser permission warnings
  if (message.includes('Permission-Policy') || 
      message.includes('browsing-topics')) {
    return;
  }
  
  // Show all other errors for debugging
  originalError.apply(console, args);
};

<StrictMode>
    <App />
  </StrictMode>,
)
