// Complete local development environment with Frontend + Backend + Real Supabase
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const API_PORT = 3003;
const FRONTEND_PORT = 5175;

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));
app.use(express.json());

// Development Mode: Disable Supabase entirely for local development
console.log('🔧 DEVELOPMENT MODE: Disabling Supabase connections for local development');
console.log('🔧 Using fallback authentication and file storage only');

// Set environment to indicate pure local development
process.env.LOCAL_DEVELOPMENT_ONLY = 'true';
process.env.NODE_ENV = 'development';

// Import consolidated API handlers
import authHandler from '../../api/auth-consolidated.js';
import templatesHandler from '../../api/templates-consolidated.js';
import paymentsHandler from '../../api/payments-consolidated-full.js';
import userProfileHandler from '../../api/user-profile-consolidated.js';
import systemHandler from '../../api/system-consolidated.js';
import researchHandler from '../../api/research-consolidated.js';
import adminHandler from '../../api/admin-consolidated.js';
import studySessionsHandler from '../../api/study-sessions.js';

console.log('🔍 Testing Supabase connectivity...');

// === CONSOLIDATED API ROUTES ===

// Auth endpoints - using consolidated auth handler
app.all('/api/auth*', async (req, res) => {
  try {
    await authHandler(req, res);
  } catch (error) {
    console.log('⚠️  Auth error:', error.message);
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
});

// Research endpoints: studies, applications, sessions, blocks
app.all('/api/research-consolidated*', async (req, res) => {
  await researchHandler(req, res);
});

app.all('/api/studies*', async (req, res) => {
  await researchHandler(req, res);
});

app.all('/api/applications*', async (req, res) => {
  await researchHandler(req, res);
});

app.all('/api/study-sessions*', async (req, res) => {
  await researchHandler(req, res);
});

app.all('/api/blocks*', async (req, res) => {
  await researchHandler(req, res);
});

// Study Sessions endpoints (NEW - Participant completion workflow)
app.all('/api/study-sessions*', async (req, res) => {
  await studySessionsHandler(req, res);
});

// Payments & Wallets endpoints
app.all('/api/wallets*', async (req, res) => {
  await paymentsHandler(req, res);
});

app.all('/api/payments*', async (req, res) => {
  await paymentsHandler(req, res);
});

// Templates endpoints
app.all('/api/templates*', async (req, res) => {
  await templatesHandler(req, res);
});

// User profile endpoints
app.all('/api/profile*', async (req, res) => {
  await userProfileHandler(req, res);
});

app.all('/api/user-profile*', async (req, res) => {
  await userProfileHandler(req, res);
});

// Collaboration endpoints
app.all('/api/collaboration*', async (req, res) => {
  const collaborationHandler = await import('../../api/collaboration.js');
  await collaborationHandler.default(req, res);
});

app.all('/api/comments*', async (req, res) => {
  const commentsHandler = await import('../../api/comments.js');
  await commentsHandler.default(req, res);
});

app.all('/api/approvals*', async (req, res) => {
  const approvalsHandler = await import('../../api/approvals.js');
  await approvalsHandler.default(req, res);
});

app.all('/api/user-enhanced*', async (req, res) => {
  await userProfileHandler(req, res);
});

// System endpoints
app.all('/api/health*', async (req, res) => {
  await systemHandler(req, res);
});

app.all('/api/system*', async (req, res) => {
  await systemHandler(req, res);
});

app.all('/api/system-consolidated*', async (req, res) => {
  await systemHandler(req, res);
});

app.all('/api/dashboard*', async (req, res) => {
  await systemHandler(req, res);
});

app.all('/api/migration*', async (req, res) => {
  await systemHandler(req, res);
});

app.all('/api/db-check*', async (req, res) => {
  await systemHandler(req, res);
});

// Admin endpoints
app.all('/api/admin*', async (req, res) => {
  await adminHandler(req, res);
});

app.all('/api/subscriptions*', async (req, res) => {
  await adminHandler(req, res);
});

app.all('/api/points*', async (req, res) => {
  await adminHandler(req, res);
});

// Redirect study-builder endpoints to research API
app.all('/api/study-builder*', async (req, res) => {
  req.url = req.url.replace('/api/study-builder', '/api/research-consolidated?action=studies');
  await researchHandler(req, res);
});

// Catch-all for other API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    message: `${req.method} ${req.path} is not available`,
    availableEndpoints: [
      '/api/auth', '/api/studies', '/api/applications', '/api/blocks',
      '/api/wallets', '/api/payments', '/api/templates', '/api/profile',
      '/api/health', '/api/system', '/api/dashboard', '/api/admin'
    ]
  });
});

// Static file serving (for production build)
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(distPath, 'index.html'));
});

// Development utility functions
async function clearDemoDataOnStart() {
  try {
    console.log('🧹 Clearing demo data on development server start...');
    
    const response = await fetch(`http://localhost:${API_PORT}/api/research-consolidated?action=clear-demo-data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fallback-token-admin-admin-admin@example.com'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Demo data cleared:', result.message);
    } else {
      console.log('⚠️ Could not clear demo data:', response.statusText);
    }
  } catch (error) {
    console.log('⚠️ Demo data clearing error:', error.message);
  }
}

// Start backend server
app.listen(API_PORT, async () => {
  console.log('🚀 LOCAL FULLSTACK DEVELOPMENT SERVER');
  console.log(`📡 Backend API: http://localhost:${API_PORT}`);
  console.log(`🌐 Frontend: http://localhost:${FRONTEND_PORT}`);
  console.log(`🔗 Health Check: http://localhost:${API_PORT}/api/health`);
  console.log(`📊 Admin Analytics: http://localhost:${API_PORT}/api/admin?action=overview`);
  console.log(`💳 Payment Integration: http://localhost:${API_PORT}/api/payments?action=conversion-rates`);
  console.log(`🎯 Points System: http://localhost:${API_PORT}/api/points?action=get-points`);
  console.log('');
  console.log('✅ Server is running and ready for development!');
  console.log('🧪 Use test accounts from TESTING_RULES_MANDATORY.md');
  
  // Clear demo data after a short delay to ensure the server is ready
  setTimeout(clearDemoDataOnStart, 2000);
});

// Start frontend development server (directly call Vite to avoid conflicts)
const frontendProcess = spawn('npm', ['run', 'dev:client'], {
  cwd: path.join(__dirname, '../..'),
  stdio: 'inherit',
  shell: true
});

frontendProcess.on('error', (error) => {
  console.error('❌ Frontend process error:', error);
});

frontendProcess.on('close', (code) => {
  console.log(`🔄 Frontend process exited with code ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  frontendProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  frontendProcess.kill('SIGTERM');
  process.exit(0);
});
