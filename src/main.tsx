import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

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
