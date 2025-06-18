// Local development server for testing with real Supabase database
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
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
    message: 'Local development server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0-local',
    status: 'operational'
  });
});

// Auth endpoints
app.all('/api/auth', async (req, res) => {
  const { action } = req.query;
  
  try {
    console.log(`=== LOCAL AUTH ACTION: ${action} ===`);

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

    return res.status(400).json({
      success: false,
      error: 'Invalid action'
    });

  } catch (error) {
    console.error(`=== AUTH ${action?.toUpperCase()} ERROR ===`);
    console.error('Error details:', error);
    
    res.status(500).json({
      success: false,
      error: `Auth ${action} failed`,
      message: error.message
    });
  }
});

// Admin setup endpoints
app.all('/api/admin-setup', async (req, res) => {
  const { action } = req.body;
  
  try {
    console.log(`=== LOCAL ADMIN SETUP: ${action} ===`);

    if (action === 'force_admin_role') {
      const adminEmail = 'abwanwr77+admin@gmail.com';
      
      console.log('Forcing admin role for:', adminEmail);
      
      // Get user from auth by email (this will show us the real data)
      const { data: authUsers } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', adminEmail)
        .single();
      
      console.log('Auth user data:', authUsers);
      
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
    console.error('=== ADMIN SETUP ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      success: false,
      error: 'Admin setup failed',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 LOCAL DEVELOPMENT SERVER STARTED');
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login test: POST http://localhost:${PORT}/api/auth?action=login`);
  console.log(`⚡ Admin setup: POST http://localhost:${PORT}/api/admin-setup`);
  console.log('');
  console.log('✅ Using REAL Supabase database for testing!');
  console.log('✅ No deployment needed - instant testing!');
});
