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

// Supabase configuration (using environment variables)
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Regular Supabase client (for general operations)
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin Supabase client (for admin operations that need service role)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

console.log('🔑 Supabase Configuration:');
console.log('   URL:', supabaseUrl);
console.log('   Service Role Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

// Import consolidated API handlers
import authHandler from '../../api/auth-consolidated.js';
import authLocalHandler from '../../api/auth-local.js';
import templatesHandler from '../../api/templates-consolidated.js';
import paymentsHandler from '../../api/payments-consolidated-full.js';
import userProfileHandler from '../../api/user-profile-consolidated.js';
import systemHandler from '../../api/system-consolidated.js';
import researchHandler from '../../api/research-consolidated.js';
import adminHandler from '../../api/admin-consolidated.js';

// Check if we should use local auth (will switch to local if Supabase fails)
let useLocalAuth = false;

console.log('🔍 Testing Supabase connectivity...');

// === CONSOLIDATED API ROUTES ===

// Auth endpoints - with fallback to local auth
app.all('/api/auth*', async (req, res) => {
  try {
    if (useLocalAuth) {
      await authLocalHandler(req, res);
    } else {
      await authHandler(req, res);
    }
  } catch (error) {
    console.log('⚠️  Switching to local auth due to error:', error.message);
    useLocalAuth = true;
    await authLocalHandler(req, res);
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

// Start backend server
app.listen(API_PORT, () => {
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
