/**
 * Simple health check API for Vercel deployment
 * Enhanced with Sentry error tracking
 */

// Initialize Sentry for backend error tracking
const { initSentryBackend, withSentry, BackendSentryUtils } = require('./lib/sentry');
initSentryBackend();

async function healthHandler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Track health check
    BackendSentryUtils.trackAPIPerformance('/api/health', 50, true);
    
    return res.status(200).json({
      success: true,
      message: 'Afkar API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      sentry: 'enabled'
    });
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}

// Export with Sentry wrapper
export default withSentry(healthHandler);
