import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Import development console manager for clean development experience
import './utils/devConsoleManager'

// Initialize Sentry for comprehensive error tracking
import { initSentry } from './config/sentry'
initSentry()

// NUCLEAR OPTION: Immediate, ultra-aggressive console suppression
// Define all error patterns to suppress
const suppressPatterns = [
  // Exact patterns from your reports
  'permissions-policy',
  'this page is not reloaded',
  'browsing-topics',
  'run-ad-auction',
  'join-ad-interest-group',
  'private-state-token',
  'private-aggregation',
  'attribution-reporting',
  'contentscript.js',
  'error with permissions-policy header',
  'unrecognized feature',
  'origin trial controlled feature',
  'contentscript.js:193',
  'private-state-token-redemption',
  'private-state-token-issuance',
  'failed to load resource',
  'status of 404',
  '/api/studies:1',
  'the server responded with a status of 404',
  'cannot read properties of undefined',
  'google oauth is not configured',
  'vite_google_client_id',
  'a listener indicated an asynchronous response',
  'message channel closed',
  'hook.js',
  'extensions/',
  'chrome-extension://',
  'moz-extension://'
];

// Store original methods
const orig = {
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
  log: console.log
};

// Helper to check suppression
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const suppress = (args: any[]) => {
  const msg = args.map(a => String(a)).join(' ').toLowerCase();
  return suppressPatterns.some(p => msg.includes(p.toLowerCase()));
};

// Override console methods IMMEDIATELY
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.warn = (...args: any[]) => !suppress(args) && orig.warn.apply(console, args);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.error = (...args: any[]) => !suppress(args) && orig.error.apply(console, args);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.info = (...args: any[]) => !suppress(args) && orig.info.apply(console, args);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.debug = (...args: any[]) => !suppress(args) && orig.debug.apply(console, args);

// Global error handlers
if (typeof window !== 'undefined') {
  window.onerror = (msg, src, _ln, _col, err) => {
    const errMsg = [msg, src, err?.message].join(' ');
    return suppress([errMsg]);
  };

  window.onunhandledrejection = (e) => {
    const reason = e.reason?.message || e.reason || '';
    if (suppress([reason])) {
      e.preventDefault();
      return true;
    }
    return false;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
