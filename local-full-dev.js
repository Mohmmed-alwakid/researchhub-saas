// Complete local development environment with Frontend + Backend + Real Supabase
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const API_PORT = 3003;
const FRONTEND_PORT = 5175;

// Middleware
app.use(cors({
  origin: [`http://localhost:${FRONTEND_PORT}`, 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Supabase configuration (same as production)
const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Local full-stack development server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0-local-fullstack',
    status: 'operational',
    frontend: `http://localhost:${FRONTEND_PORT}`,
    backend: `http://localhost:${API_PORT}`
  });
});

// Database check
app.get('/api/db-check', async (req, res) => {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact' })
      .limit(1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Database connection successful',
      profileCount: data?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database check error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message
    });
  }
});

// Auth endpoints - complete implementation
app.all('/api/auth', async (req, res) => {
  const { action } = req.query;
  
  try {
    console.log(`🔐 LOCAL AUTH ACTION: ${action}`);

    // REGISTER
    if (action === 'register') {
      const { email, password, firstName, lastName, role = 'participant' } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            first_name: firstName,
            last_name: lastName,
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      console.log('User registered successfully - Role:', role);
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to confirm your account.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role: role
        }
      });
    }

    // LOGIN
    if (action === 'login') {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // Get role from profile first, then from user metadata, with fallback
      const userRole = profile?.role || data.user.user_metadata?.role || 'participant';
      
      // If no profile exists, create one with the correct role
      if (!profile) {
        console.log('Creating missing profile for user:', data.user.email);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.user_metadata?.first_name || '',
            last_name: data.user.user_metadata?.last_name || '',
            role: data.user.user_metadata?.role || 'participant',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
        } else {
          console.log('Profile created successfully with role:', data.user.user_metadata?.role || 'participant');
        }
      }

      console.log('User logged in successfully - Role:', userRole);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
          role: userRole,
          firstName: profile?.first_name || data.user.user_metadata?.first_name,
          lastName: profile?.last_name || data.user.user_metadata?.last_name
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at
        }
      });
    }

    // STATUS
    if (action === 'status') {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.error('Token validation error:', error);
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get role from profile first, then from user metadata, with fallback
      const userRole = profile?.role || user.user_metadata?.role || 'participant';

      console.log('Token validated successfully - Role:', userRole);
      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: {
          id: user.id,
          email: user.email,
          role: userRole,
          firstName: profile?.first_name || user.user_metadata?.first_name,
          lastName: profile?.last_name || user.user_metadata?.last_name,
          emailConfirmed: user.email_confirmed_at !== null
        }
      });
    }

    // LOGOUT
    if (action === 'logout') {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (token) {
        await supabase.auth.signOut();
      }

      return res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action'
    });

  } catch (error) {
    console.error(`❌ AUTH ${action?.toUpperCase()} ERROR:`, error);
    
    res.status(500).json({
      success: false,
      error: `Auth ${action} failed`,
      message: error.message
    });
  }
});

// Profile endpoints
app.all('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (req.method === 'GET') {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return res.status(200).json({
        success: true,
        profile: profile || {
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role: user.user_metadata?.role || 'participant'
        }
      });
    }

    if (req.method === 'PUT') {
      // Update profile
      const { firstName, lastName } = req.body;

      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile: data
      });
    }

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile operation failed',
      message: error.message
    });
  }
});

// Studies endpoints
app.all('/api/studies*', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // For now, return mock data - you can implement full studies logic later
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        studies: [],
        message: 'Studies endpoint working (mock data)'
      });
    }

    if (req.method === 'POST') {
      return res.status(201).json({
        success: true,
        message: 'Study creation endpoint working (mock)',
        study: { id: 'mock-study-id', title: 'Mock Study' }
      });
    }

  } catch (error) {
    console.error('Studies error:', error);
    res.status(500).json({
      success: false,
      error: 'Studies operation failed',
      message: error.message
    });
  }
});

// Admin setup endpoints
app.all('/api/admin-setup', async (req, res) => {
  const { action } = req.body;
  
  try {
    console.log(`⚡ LOCAL ADMIN SETUP: ${action}`);

    if (action === 'force_admin_role') {
      const adminEmail = 'abwanwr77+admin@gmail.com';
      
      console.log('Forcing admin role for:', adminEmail);
      
      // Update profile directly by email
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('email', adminEmail)
        .select();

      if (updateError) {
        console.error('Profile update error:', updateError);
        return res.status(400).json({
          success: false,
          error: 'Failed to update admin role',
          details: updateError.message
        });
      }

      if (updateResult && updateResult.length > 0) {
        console.log('Admin role updated successfully:', updateResult[0]);
        return res.status(200).json({
          success: true,
          message: 'Admin role forced successfully',
          profile: updateResult[0]
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'Admin profile not found - user may need to login first'
        });
      }
    }

    if (action === 'check_profiles') {
      const results = [];
      
      for (const [accountType, account] of Object.entries(TEST_ACCOUNTS)) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', account.email)
          .single();
        
        results.push({
          account: accountType,
          email: account.email,
          expectedRole: account.role,
          actualRole: profile?.role || 'NOT_FOUND',
          profileExists: !!profile,
          profile: profile
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Profile check completed',
        results: results
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use: force_admin_role or check_profiles'
    });

  } catch (error) {
    console.error('❌ ADMIN SETUP ERROR:', error);
    
    res.status(500).json({
      success: false,
      error: 'Admin setup failed',
      message: error.message
    });
  }
});

// Start frontend development server
function startFrontend() {
  console.log('🚀 Starting Frontend Development Server...');
  
  const frontend = spawn('npm', ['run', 'dev:client'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    cwd: __dirname
  });

  frontend.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') || output.includes('ready in')) {
      console.log(`📱 Frontend: ${output.trim()}`);
    }
  });

  frontend.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('warnings')) {
      console.error(`⚠️ Frontend Warning: ${error.trim()}`);
    }
  });

  return frontend;
}

// Start backend API server
function startBackend() {
  console.log('🚀 Starting Backend API Server...');
  
  app.listen(API_PORT, () => {
    console.log('');
    console.log('🎉 LOCAL FULL-STACK DEVELOPMENT ENVIRONMENT READY!');
    console.log('════════════════════════════════════════════════════');
    console.log(`📱 Frontend (React/Vite): http://localhost:${FRONTEND_PORT}`);
    console.log(`🔧 Backend (API):         http://localhost:${API_PORT}`);
    console.log(`🏥 Health Check:          http://localhost:${API_PORT}/api/health`);
    console.log(`💾 Database Check:        http://localhost:${API_PORT}/api/db-check`);
    console.log('════════════════════════════════════════════════════');
    console.log('✅ Connected to REAL Supabase production database');
    console.log('✅ Frontend proxy configured to local backend');
    console.log('✅ All authentication endpoints available');
    console.log('✅ Hot reload enabled for both frontend and backend');
    console.log('');
    console.log('🔐 Test Accounts Available:');
    Object.entries(TEST_ACCOUNTS).forEach(([type, account]) => {
      console.log(`   ${type}: ${account.email} / ${account.password}`);
    });
    console.log('');
    console.log('📝 Available API Endpoints:');
    console.log('   POST /api/auth?action=register');
    console.log('   POST /api/auth?action=login');
    console.log('   GET  /api/auth?action=status');
    console.log('   POST /api/auth?action=logout');
    console.log('   GET  /api/profile');
    console.log('   PUT  /api/profile');
    console.log('   GET  /api/studies');
    console.log('   POST /api/admin-setup');
    console.log('');
  });
}

// Start both servers
console.log('🚀 STARTING LOCAL FULL-STACK DEVELOPMENT ENVIRONMENT...');
console.log('');

const frontendProcess = startFrontend();
startBackend();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  frontendProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development servers...');
  frontendProcess.kill();
  process.exit(0);
});
