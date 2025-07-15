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

// Test accounts
const TEST_ACCOUNTS = {
  participant: {
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123',
    role: 'participant'
  },
  researcher: {
    email: 'abwanwr77+Researcher@gmail.com', 
    password: 'Testtest123',
    role: 'researcher'
  },
  admin: {
    email: 'abwanwr77+admin@gmail.com',
    password: 'Testtest123',
    role: 'admin'
  }
};

// ===== Import consolidated API handlers =====
import authHandler from '../../api/auth-consolidated.js';
import templatesHandler from '../../api/templates-consolidated.js';
import paymentsHandler from '../../api/payments-consolidated-full.js';
import userProfileHandler from '../../api/user-profile-consolidated.js';
import systemHandler from '../../api/system-consolidated.js';
import researchHandler from '../../api/research-consolidated.js';
import adminHandler from '../../api/admin-consolidated.js';

// === CONSOLIDATED API ROUTES ===

// Auth endpoints
app.all('/api/auth*', async (req, res) => {
  await authHandler(req, res);
});

// Research endpoints: studies, applications, sessions, blocks
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

app.all('/api/dashboard*', async (req, res) => {
  await systemHandler(req, res);
});

app.all('/api/migration*', async (req, res) => {
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

// Frontend development server
function startFrontend() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Vite frontend server...');
    
    const viteProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.resolve(__dirname, '../..'),
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    let serverStarted = false;

    viteProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`📱 FRONTEND: ${output.trim()}`);
      
      if (output.includes('Local:') && !serverStarted) {
        serverStarted = true;
        resolve(viteProcess);
      }
    });

    viteProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('Warning') && !error.includes('DeprecationWarning')) {
        console.error(`❌ FRONTEND ERROR: ${error.trim()}`);
      }
    });

    viteProcess.on('close', (code) => {
      if (code !== 0 && !serverStarted) {
        reject(new Error(`Frontend server failed to start with code ${code}`));
      }
    });

    // Timeout fallback
    setTimeout(() => {
      if (!serverStarted) {
        resolve(viteProcess);
      }
    }, 10000);
  });
}

// Start servers
async function startServers() {
  try {
    console.log('🌟 Starting ResearchHub Full Development Environment...\n');

    // Start backend
    const backendServer = app.listen(API_PORT, () => {
      console.log(`🔧 Backend API server running on http://localhost:${API_PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${API_PORT}/api/*`);
      console.log(`🔍 Test health: http://localhost:${API_PORT}/api/system-consolidated?action=health\n`);
    });

    // Start frontend
    await startFrontend();

    console.log('\n✅ FULL DEVELOPMENT ENVIRONMENT READY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎯 Frontend: http://localhost:${FRONTEND_PORT}`);
    console.log(`🔧 Backend:  http://localhost:${API_PORT}`);
    console.log('🔑 Test Accounts:');
    Object.entries(TEST_ACCOUNTS).forEach(([role, account]) => {
      console.log(`   ${role.toUpperCase()}: ${account.email} / ${account.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Both servers will restart automatically on file changes');
    console.log('🛑 Press Ctrl+C to stop both servers\n');

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development servers...');
      backendServer.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start development environment:', error);
    process.exit(1);
  }
}

// Start the development environment
startServers();
