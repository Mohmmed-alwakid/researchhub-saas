import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize complete debugging suite (Phase 1 + Phase 2)
import { initializeDebugSuite } from './utils/debug'
import sentryIntegration from './utils/debug/SentryIntegrationSimple'
import devDebugConsole from './utils/debug/DevDebugConsole'

// Initialize Sentry error tracking (Production + Development)
sentryIntegration.init()

// Initialize complete debug suite (Phase 1 + Phase 2 tools)
initializeDebugSuite()

// Log initialization with enhanced debugging
devDebugConsole.log('🚀 ResearchHub application initializing', {
  environment: import.meta.env.MODE,
  timestamp: Date.now(),
  debugSuite: 'Phase 1 + Phase 2 Active',
  tools: ['Sentry', 'DevDebugConsole', 'SmartErrorBoundary', 'ResearchFlowMonitor', 'BusinessLogicValidator', 'PerformanceIntelligence']
})

// In development, show debug keyboard shortcuts
if (import.meta.env.DEV) {
  setTimeout(() => {
    console.log('🎯 ResearchHub Debug Tools Ready!')
    console.log('Press Ctrl+Shift+D to open debug console')
    console.log('Global debug tools: window.ResearchHubDebugUtils')
  }, 1000)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
