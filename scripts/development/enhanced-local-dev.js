/**
 * Enhanced Local Development Server
 * Provides full offline development with mock data fallbacks
 */

import express from 'express';
import cors from 'cors';
import { mockDataService, simulateApiDelay } from './mock-data-service.js';

// Import the existing development server
import './local-full-dev.js';

const app = express();
const PORT = 3004; // Use different port to avoid conflicts

app.use(cors());
app.use(express.json());

// Middleware to check if user is authenticated (mock validation)
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // For mock tokens, extract user info
  if (token.includes('mock-signature')) {
    try {
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role
      };
      next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ success: false, error: 'Invalid token format' });
  }
}

// Enhanced API endpoints with mock data

// Dashboard data endpoint
app.get('/api/dashboard', authenticateUser, async (req, res) => {
  await simulateApiDelay(200);
  
  try {
    const dashboardData = mockDataService.getDashboardData(req.user.role);
    res.json({
      success: true,
      data: dashboardData,
      mock: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      mock: true
    });
  }
});

// Studies endpoint
app.get('/api/research', authenticateUser, async (req, res) => {
  await simulateApiDelay(300);
  
  try {
    const studies = mockDataService.getStudies(req.user.role, req.user.id);
    res.json({
      success: true,
      data: { studies },
      mock: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studies',
      mock: true
    });
  }
});

// Wallet/payments endpoint
app.get('/api/payments', authenticateUser, async (req, res) => {
  await simulateApiDelay(250);
  
  try {
    const walletData = mockDataService.getWalletData(req.user.id);
    res.json({
      success: true,
      data: walletData,
      mock: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet data',
      mock: true
    });
  }
});

// Health check for mock server
app.get('/api/mock-health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'Mock data server is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/dashboard - Dashboard data',
      'GET /api/research - Studies data', 
      'GET /api/payments - Wallet/payment data'
    ]
  });
});

// Start the enhanced mock server
app.listen(PORT, () => {
  console.log(`\n🚀 ENHANCED MOCK DATA SERVER`);
  console.log(`📡 Mock API Server: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/mock-health`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log(`🔬 Research API: http://localhost:${PORT}/api/research`);
  console.log(`💳 Payments API: http://localhost:${PORT}/api/payments`);
  console.log(`\n✅ Mock server ready for testing!`);
  console.log(`🧪 Use test accounts with mock tokens for authentication\n`);
});

export { app };
