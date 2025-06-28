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
      }      console.log('User logged in successfully - Role:', userRole);
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
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
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

// Studies endpoints - import the actual handler
import studiesHandler from './api/studies.js';

app.all('/api/studies*', async (req, res) => {
  // Use the actual studies.js handler which has proper data transformation
  await studiesHandler(req, res);
});

// Redirect study-builder endpoints to studies API with action=build
app.all('/api/study-builder*', async (req, res) => {
  // Redirect study-builder requests to studies API with action=build
  req.url = req.url.replace('/api/study-builder', '/api/studies?action=build');
  await studiesHandler(req, res);
});

// Recordings endpoints  
app.all('/api/recordings*', async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { action } = req.query;

      if (action === 'upload') {
        return await handleRecordingUpload(req, res, supabase);
      } else if (action === 'create') {
        return await createRecordingSession(req, res, supabase);
      } else if (action === 'complete') {
        return await completeRecording(req, res, supabase);
      }
    }

    if (req.method === 'GET') {
      const { sessionId, studyId } = req.query;
      
      if (sessionId) {
        return await getRecordingBySession(req, res, supabase, sessionId);
      } else if (studyId) {
        return await getRecordingsByStudy(req, res, supabase, studyId);
      } else {
        return await getAllRecordings(req, res, supabase);
      }
    }

    if (req.method === 'PUT') {
      return await updateRecording(req, res, supabase);
    }

    if (req.method === 'DELETE') {
      return await deleteRecording(req, res, supabase);
    }

    res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Recordings error:', error);
    res.status(500).json({
      success: false,
      error: 'Recordings operation failed',
      message: error.message
    });
  }
});

// User Interactions endpoints  
app.all('/api/interactions*', async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { action } = req.query;

      if (action === 'upload' || !action) {
        return await handleInteractionsUpload(req, res, supabase);
      } else if (action === 'process') {
        return await processInteractionsForAnalytics(req, res, supabase);
      }
    }

    if (req.method === 'GET') {
      const { sessionId, studyId, type } = req.query;
      
      if (sessionId) {
        return await getInteractionsBySession(req, res, supabase, sessionId);
      } else if (studyId) {
        return await getInteractionsByStudy(req, res, supabase, studyId);
      } else {
        return await getAllInteractions(req, res, supabase);
      }
    }

    if (req.method === 'DELETE') {
      return await deleteInteractions(req, res, supabase);
    }

    res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Interactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Interactions operation failed',
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
      message: error.message    });
  }
});

// Admin API endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }    // Get query parameters for pagination and filtering
    console.log('Admin users query params:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'desc';
    const role = req.query.role;
    const status = req.query.status;
    const search = req.query.search;
    
    console.log('Using sortBy:', sortBy, 'sortOrder:', sortOrder);

    // Map camelCase to snake_case for database columns
    const sortByMapping = {
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'lastLogin': 'last_login',
      'firstName': 'first_name',
      'lastName': 'last_name'
    };
    
    const dbSortBy = sortByMapping[sortBy] || sortBy;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;    // Build the query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        updated_at,
        last_login
      `)
      .range(offset, offset + limit - 1);

    // Apply filters
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }    if (status && status !== 'all') {
      if (status === 'active') {
        // Consider users active if they've logged in within last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('last_login', thirtyDaysAgo.toISOString());
      } else if (status === 'inactive') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.or(`last_login.lt.${thirtyDaysAgo.toISOString()},last_login.is.null`);
      }
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(dbSortBy, { ascending });

    // Execute the query
    const { data: users, error: usersError } = await query;

    if (usersError) {
      throw usersError;
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    // Apply same filters to count query
    if (role && role !== 'all') {
      countQuery = countQuery.eq('role', role);
    }    if (status && status !== 'all') {
      if (status === 'active') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        countQuery = countQuery.gte('last_login', thirtyDaysAgo.toISOString());
      } else if (status === 'inactive') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        countQuery = countQuery.or(`last_login.lt.${thirtyDaysAgo.toISOString()},last_login.is.null`);
      }
    }

    if (search) {
      countQuery = countQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { count: totalCount } = await countQuery;

    // Get additional stats for each user (studies created/participated)
    const userIds = users.map(user => user.id);
    
    // Get studies created by each user
    const { data: studiesCreated } = await supabase
      .from('studies')
      .select('creator_id')
      .in('creator_id', userIds);

    // Count studies per user
    const studiesCountMap = {};
    if (studiesCreated) {
      studiesCreated.forEach(study => {
        studiesCountMap[study.creator_id] = (studiesCountMap[study.creator_id] || 0) + 1;
      });
    }

    // Try to get study participations (if study_sessions table exists)
    let participationsCountMap = {};
    try {
      const { data: participations } = await supabase
        .from('study_sessions')
        .select('participant_id')
        .in('participant_id', userIds);

      if (participations) {
        participations.forEach(session => {
          participationsCountMap[session.participant_id] = (participationsCountMap[session.participant_id] || 0) + 1;
        });
      }
    } catch (error) {
      // study_sessions table might not exist yet, that's ok
      console.log('Study sessions table not found, skipping participation counts');
    }    // Format the response to match the expected interface
    const formattedUsers = users.map(user => ({
      _id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No Name',
      email: user.email,
      role: user.role || 'participant',
      isActive: user.last_login ? new Date(user.last_login) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false,
      createdAt: user.created_at,
      lastLoginAt: user.last_login,
      subscription: 'free', // Default since subscription_tier column doesn't exist yet
      studiesCreated: studiesCountMap[user.id] || 0,
      studiesParticipated: participationsCountMap[user.id] || 0
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return res.status(200).json({
      success: true,
      data: {
        data: formattedUsers,
        pagination: {
          current: page,
          total: totalPages,
          hasNext,
          hasPrev,
          totalCount
        }
      }
    });

  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

app.get('/api/admin/overview', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    // Get platform statistics
    const { data: users, count: totalUsers } = await supabase
      .from('profiles')
      .select('id, role, created_at', { count: 'exact' });

    const { data: studies, count: totalStudies } = await supabase
      .from('studies')
      .select('id, status, created_at', { count: 'exact' });

    // Calculate active studies (assuming 'active' status)
    const activeStudies = studies?.filter(study => study.status === 'active').length || 0;

    // Calculate total sessions (mock for now since sessions table might not exist)
    let totalSessions = 0;
    try {
      const { count: sessionCount } = await supabase
        .from('study_sessions')
        .select('id', { count: 'exact' });
      totalSessions = sessionCount || 0;
    } catch (error) {
      console.log('Sessions table not found, using 0');
    }

    // Calculate growth metrics (simplified - last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentUsers = users?.filter(user => new Date(user.created_at) > thirtyDaysAgo).length || 0;
    const previousUsers = users?.filter(user => {
      const createdDate = new Date(user.created_at);
      return createdDate > sixtyDaysAgo && createdDate <= thirtyDaysAgo;
    }).length || 0;

    const recentStudies = studies?.filter(study => new Date(study.created_at) > thirtyDaysAgo).length || 0;
    const previousStudies = studies?.filter(study => {
      const createdDate = new Date(study.created_at);
      return createdDate > sixtyDaysAgo && createdDate <= thirtyDaysAgo;
    }).length || 0;

    const userGrowth = previousUsers > 0 ? ((recentUsers - previousUsers) / previousUsers * 100) : 0;
    const studyGrowth = previousStudies > 0 ? ((recentStudies - previousStudies) / previousStudies * 100) : 0;

    // Count users by role
    const usersByRole = {};
    users?.forEach(user => {
      const role = user.role || 'participant';
      usersByRole[role] = (usersByRole[role] || 0) + 1;
    });

    const overview = {
      totalUsers: totalUsers || 0,
      totalStudies: totalStudies || 0,
      totalSessions,
      activeStudies,
      userGrowth: Math.round(userGrowth * 10) / 10,
      studyGrowth: Math.round(studyGrowth * 10) / 10,
      usersByRole
    };

    return res.status(200).json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch overview data'
    });
  }
});

app.get('/api/admin/activity', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const limit = parseInt(req.query.limit) || 20;
    const activities = [];

    // Get recent user signups
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (recentUsers) {
      recentUsers.forEach(user => {
        activities.push({
          id: `user_${user.id}`,
          type: 'user_signup',
          description: `New user registered: ${user.first_name} ${user.last_name} (${user.email})`,
          timestamp: user.created_at,
          user: user.email,
          metadata: {
            userId: user.id,
            name: `${user.first_name} ${user.last_name}`
          }
        });
      });
    }

    // Get recent studies
    const { data: recentStudies } = await supabase
      .from('studies')
      .select(`
        id,
        title,
        created_at,
        creator_id,
        profiles!studies_creator_id_fkey(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (recentStudies) {
      recentStudies.forEach(study => {
        const creator = study.profiles;
        activities.push({
          id: `study_${study.id}`,
          type: 'study_created',
          description: `New study created: "${study.title}" by ${creator?.first_name || ''} ${creator?.last_name || ''}`,
          timestamp: study.created_at,
          user: creator?.email || 'Unknown',
          metadata: {
            studyId: study.id,
            studyTitle: study.title,
            creatorId: study.creator_id
          }
        });
      });
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({
      success: true,
      data: activities.slice(0, limit)
    });
  } catch (error) {
    console.error('Admin activity error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch activity data'
    });
  }
});

// Admin User Actions (Create, Update, Delete)
app.all('/api/admin/user-actions', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    if (req.method === 'POST') {
      // Create new user
      const { email, password, name, role = 'participant', isActive = true } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email, password, and name are required' 
        });
      }

      console.log('Creating new user:', { email, name, role, isActive });

      // Create user in Supabase Auth
      const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
        }
      });

      if (authCreateError) {
        console.error('Auth user creation error:', authCreateError);
        return res.status(400).json({ 
          success: false, 
          error: authCreateError.message 
        });
      }

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
          role,
          status: isActive ? 'active' : 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        return res.status(400).json({ 
          success: false, 
          error: profileError.message 
        });
      }

      console.log('User created successfully:', profileData);

      return res.status(201).json({
        success: true,
        data: {
          _id: profileData.id,
          name: `${profileData.first_name} ${profileData.last_name}`.trim(),
          email: profileData.email,
          role: profileData.role,
          isActive: profileData.status === 'active',
          createdAt: profileData.created_at,
          lastLoginAt: null,
          subscription: 'free',
          studiesCreated: 0,
          studiesParticipated: 0
        }
      });
    }

    if (req.method === 'PUT') {
      // Update existing user
      const { userId } = req.query;
      const { name, role, isActive } = req.body;

      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID is required' 
        });
      }

      console.log('Updating user:', userId, { name, role, isActive });

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (name) {
        updateData.first_name = name.split(' ')[0] || name;
        updateData.last_name = name.split(' ').slice(1).join(' ') || '';
      }

      if (role) {
        updateData.role = role;
      }

      if (typeof isActive === 'boolean') {
        updateData.status = isActive ? 'active' : 'inactive';
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        return res.status(400).json({ 
          success: false, 
          error: updateError.message 
        });
      }

      console.log('User updated successfully:', updatedProfile);

      return res.status(200).json({
        success: true,
        data: {
          _id: updatedProfile.id,
          name: `${updatedProfile.first_name} ${updatedProfile.last_name}`.trim(),
          email: updatedProfile.email,
          role: updatedProfile.role,
          isActive: updatedProfile.status === 'active',
          createdAt: updatedProfile.created_at,
          lastLoginAt: updatedProfile.last_login,
          subscription: 'free',
          studiesCreated: 0,
          studiesParticipated: 0
        }
      });
    }

    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });

  } catch (error) {
    console.error('User action error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Admin Analytics Endpoint
app.get('/api/admin/analytics', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    console.log('🔍 Admin Analytics request from:', user.email);

    // Mock analytics data for now
    const analytics = {
      userTrends: Array.from({length: 30}, (_, i) => ({
        _id: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) + 1
      })),
      studyTrends: Array.from({length: 30}, (_, i) => ({
        _id: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5) + 1
      })),
      sessionTrends: Array.from({length: 30}, (_, i) => ({
        _id: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20) + 5
      })),
      timeframe: req.query.timeframe || '30d'
    };

    return res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
});

// Admin Analytics Overview - Real Data Endpoint  
app.get('/api/admin/analytics-overview', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    // Get real user count
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get real study count
    const { count: studyCount } = await supabase
      .from('studies')
      .select('*', { count: 'exact', head: true });

    // Get active studies
    const { count: activeStudies } = await supabase
      .from('studies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get new users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: newUsersThisWeek } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString());

    // Get recent activity (recent user registrations and study creations)
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentStudies } = await supabase
      .from('studies')
      .select('title, creator_id, created_at, profiles!inner(first_name, last_name, email)')
      .order('created_at', { ascending: false })
      .limit(5);

    // Format recent activity
    const recentActivity = [
      ...(recentUsers || []).map(user => ({
        id: `user_${user.email}`,
        type: 'user_registered',
        description: 'New user registered',
        timestamp: user.created_at,
        user: user.email
      })),
      ...(recentStudies || []).map(study => ({
        id: `study_${study.title}`,
        type: 'study_created',
        description: `Study "${study.title}" created`,
        timestamp: study.created_at,
        user: study.profiles.email
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    // Analytics data with real values
    const analytics = {
      totalUsers: userCount || 0,
      activeStudies: activeStudies || 0,
      monthlyRevenue: 12450, // TODO: Calculate from real payment data
      totalParticipants: Math.floor((userCount || 0) * 0.7), // Estimate 70% are participants
      newUsersThisWeek: newUsersThisWeek || 0,
      completedStudies: studyCount || 0,
      systemHealth: 'healthy',
      recentActivity
    };

    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Studies Endpoint
app.all('/api/admin/studies', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    console.log('📚 Admin Studies request from:', user.email);

    if (req.method === 'GET') {
      // Get all studies with researcher info
      const { data: studies, error: studiesError } = await supabase
        .from('studies')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          researcher_id,
          profiles!studies_researcher_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (studiesError) {
        console.error('Error fetching studies:', studiesError);
        return res.status(500).json({ success: false, error: 'Failed to fetch studies' });
      }

      const formattedStudies = studies.map(study => ({
        _id: study.id,
        title: study.title,
        description: study.description,
        status: study.status,
        researcher: {
          _id: study.profiles?.id || study.researcher_id,
          name: `${study.profiles?.first_name || ''} ${study.profiles?.last_name || ''}`.trim() || 'Unknown',
          email: study.profiles?.email || 'Unknown'
        },
        createdAt: study.created_at,
        participantCount: Math.floor(Math.random() * 50) // Mock data
      }));

      const response = {
        data: formattedStudies,
        pagination: {
          current: 1,
          total: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      return res.status(200).json({
        success: true,
        data: response
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Studies endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process request'
    });
  }
});

// Admin Bulk Users Endpoint
app.put('/api/admin/users/bulk', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    console.log('👥 Admin Bulk Users operation from:', user.email);

    const { userIds, action, value } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, error: 'User IDs array is required' });
    }

    if (!action) {
      return res.status(400).json({ success: false, error: 'Action is required' });
    }

    // Simulate bulk operation
    const result = {
      modifiedCount: userIds.length,
      matchedCount: userIds.length
    };

    console.log(`Bulk ${action} operation on ${userIds.length} users:`, result);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Bulk users endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to perform bulk operation'
    });
  }
});

// Admin Financial Endpoint
app.get('/api/admin/financial', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }    console.log('💰 Admin Financial report request from:', user.email);

    // Get real financial data from Supabase
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date(now);
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get subscription counts and revenue data
    const { data: subscriptions, error: subError } = await supabase
      .from('users')
      .select('id, subscription_plan, subscription_status, created_at')
      .not('subscription_plan', 'is', null)
      .gte('created_at', startDate.toISOString());

    if (subError) {
      console.error('Subscription query error:', subError);
    }

    // Get user data for growth calculations
    const { data: allUsers, error: userError } = await supabase
      .from('users')
      .select('id, subscription_plan, subscription_status, created_at')
      .gte('created_at', startDate.toISOString());

    if (userError) {
      console.error('User query error:', userError);
    }

    // Calculate financial metrics
    const activeSubscriptions = (subscriptions || []).filter(s => s.subscription_status === 'active').length;
    const cancelledSubscriptions = (subscriptions || []).filter(s => s.subscription_status === 'cancelled').length;
    const totalCustomers = (allUsers || []).length;
    
    // Revenue calculation based on subscription tiers
    const revenuePerPlan = {
      'basic': 29,
      'pro': 79,
      'enterprise': 199
    };
    
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    const planRevenue = { basic: 0, pro: 0, enterprise: 0 };
    
    (subscriptions || []).forEach(sub => {
      const planRevenue_amount = revenuePerPlan[sub.subscription_plan] || 29;
      totalRevenue += planRevenue_amount;
      
      // Track revenue by plan
      const plan = sub.subscription_plan?.toLowerCase();
      if (planRevenue[plan] !== undefined) {
        planRevenue[plan] += planRevenue_amount;
      }
      
      // Calculate if subscription was created this month
      const subDate = new Date(sub.created_at);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      if (subDate >= thisMonth) {
        monthlyRevenue += planRevenue_amount;
      }
    });

    // Create revenue trends for the past 30 days
    const revenueTrends = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
      
      const daySubscriptions = (subscriptions || []).filter(s => {
        const subDate = new Date(s.created_at);
        return subDate >= dayStart && subDate < dayEnd;
      });
      
      const dayRevenue = daySubscriptions.reduce((sum, sub) => {
        return sum + (revenuePerPlan[sub.subscription_plan] || 29);
      }, 0);
      
      revenueTrends.push({
        date: day.toISOString().split('T')[0],
        revenue: dayRevenue
      });
    }

    const financialReport = {
      summary: {
        totalRevenue: totalRevenue,
        activeSubscriptions: activeSubscriptions,
        cancelledSubscriptions: cancelledSubscriptions,
        churnRate: totalCustomers > 0 ? Math.round((cancelledSubscriptions / totalCustomers) * 100) / 100 : 0,
        mrr: monthlyRevenue,
        totalCustomers: totalCustomers
      },
      trends: {
        revenue: revenueTrends,
        timeframe: timeframe
      },
      breakdown: {
        byPlan: {
          'Basic': planRevenue.basic,
          'Pro': planRevenue.pro,
          'Enterprise': planRevenue.enterprise
        },
        topCustomers: [] // Could be enhanced with real customer data
      },
      recentSubscriptions: (subscriptions || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(sub => ({
          id: sub.id,
          customerName: 'Customer', // Could get from profiles
          customerEmail: sub.email || 'N/A',
          planType: sub.subscription_plan,
          amount: revenuePerPlan[sub.subscription_plan] || 29,
          status: sub.subscription_status,
          createdAt: sub.created_at
        }))
    };

    return res.status(200).json({
      success: true,
      data: financialReport
    });

  } catch (error) {
    console.error('Financial endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch financial data'
    });
  }
});

// Admin Financial Detailed Endpoint
app.get('/api/admin/financial-detailed', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    console.log('💰📊 Admin Detailed Financial report request from:', user.email);

    const { timeframe = '30d' } = req.query;
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date(now);
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get all users with subscription data
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, subscription_plan, subscription_status, created_at')
      .gte('created_at', startDate.toISOString());

    if (userError) {
      console.error('User query error:', userError);
    }

    // Get studies data for additional revenue insights
    const { data: studies, error: studyError } = await supabase
      .from('studies')
      .select('id, title, created_at, status')
      .gte('created_at', startDate.toISOString());

    if (studyError) {
      console.error('Study query error:', studyError);
    }

    // Revenue breakdown by plan
    const revenueByPlan = {
      basic: { price: 29, count: 0, revenue: 0 },
      pro: { price: 79, count: 0, revenue: 0 },
      enterprise: { price: 199, count: 0, revenue: 0 }
    };

    // Calculate revenue by subscription plan
    (users || []).forEach(user => {
      if (user.subscription_plan && user.subscription_status === 'active') {
        const plan = user.subscription_plan.toLowerCase();
        if (revenueByPlan[plan]) {
          revenueByPlan[plan].count++;
          revenueByPlan[plan].revenue += revenueByPlan[plan].price;
        }
      }
    });

    // Calculate daily revenue trend
    const dailyRevenue = [];
    const daysInPeriod = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
    
    for (let i = daysInPeriod - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
      
      const dayUsers = (users || []).filter(u => {
        const userDate = new Date(u.created_at);
        return userDate >= dayStart && userDate < dayEnd && u.subscription_status === 'active';
      });
      
      const dayRevenue = dayUsers.reduce((sum, user) => {
        const plan = user.subscription_plan?.toLowerCase();
        return sum + (revenueByPlan[plan]?.price || 0);
      }, 0);
      
      dailyRevenue.push({
        date: day.toISOString().split('T')[0],
        revenue: dayRevenue,
        subscribers: dayUsers.length
      });
    }

    // Customer acquisition cost and lifetime value (simplified calculations)
    const totalActiveUsers = (users || []).filter(u => u.subscription_status === 'active').length;
    const averageRevenue = Object.values(revenueByPlan).reduce((sum, plan) => sum + plan.revenue, 0) / Math.max(totalActiveUsers, 1);
    
    const detailedFinancial = {
      overview: {
        totalRevenue: Object.values(revenueByPlan).reduce((sum, plan) => sum + plan.revenue, 0),
        totalSubscribers: totalActiveUsers,
        averageRevenuePerUser: Math.round(averageRevenue * 100) / 100,
        customerLifetimeValue: Math.round(averageRevenue * 12), // Simplified: assume 12 month retention
      },
      revenueByPlan,
      dailyTrends: dailyRevenue,
      metrics: {
        churnRate: Math.round(((users || []).filter(u => u.subscription_status === 'cancelled').length / Math.max(totalActiveUsers, 1)) * 100 * 100) / 100,
        conversionRate: Math.round((totalActiveUsers / Math.max((users || []).length, 1)) * 100 * 100) / 100,
        monthlyGrowthRate: dailyRevenue.length > 30 ? 
          Math.round(((dailyRevenue.slice(-7).reduce((s, d) => s + d.subscribers, 0) - dailyRevenue.slice(-14, -7).reduce((s, d) => s + d.subscribers, 0)) / Math.max(dailyRevenue.slice(-14, -7).reduce((s, d) => s + d.subscribers, 0), 1)) * 100 * 100) / 100 : 0
      },
      studyMetrics: {
        totalStudies: (studies || []).length,
        activeStudies: (studies || []).filter(s => s.status === 'active').length,
        studyCreationTrend: (studies || []).length / daysInPeriod
      }
    };

    return res.status(200).json({ success: true, data: detailedFinancial });
  } catch (error) {
    console.error('Detailed financial data error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch detailed financial data'
    });
  }
});

// Admin User Behavior Analytics Endpoint
app.get('/api/admin/user-behavior', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    console.log('📊 Admin User Behavior Analytics request from:', user.email);

    // Mock user behavior data
    const behaviorAnalytics = {
      userEngagement: Array.from({length: 30}, (_, i) => ({
        date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        activeUsers: Math.floor(Math.random() * 50) + 10,
        sessionsPerUser: Math.round((Math.random() * 3 + 1) * 100) / 100
      })),
      featureUsage: {
        'Study Creation': 156,
        'Session Recording': 342,
        'User Management': 89,
        'Analytics Dashboard': 234,
        'Data Export': 67
      },
      deviceTypes: {
        'Desktop': 245,
        'Mobile': 89,
        'Tablet': 23
      },
      timeframe: req.query.timeframe || '30d'
    };

    return res.status(200).json({
      success: true,
      data: behaviorAnalytics
    });

  } catch (error) {
    console.error('User behavior analytics endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user behavior analytics'
    });
  }
});

// Dashboard Analytics Endpoint - For all authenticated users
app.get('/api/dashboard/analytics', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    console.log('📊 Dashboard Analytics request from:', user.email, 'Role:', profile.role);

    // Get real data based on user role
    let dashboardData = {};

    if (profile.role === 'researcher' || profile.role === 'admin') {
      // For researchers and admins - show studies data
      const { data: allStudies, count: totalStudies } = await supabase
        .from('studies')
        .select('id, title, status, created_at, target_participants', { count: 'exact' })
        .eq('researcher_id', user.id); // Only their studies for researchers

      // For admins, get all studies
      if (profile.role === 'admin') {
        const { data: adminStudies, count: adminStudyCount } = await supabase
          .from('studies')
          .select('id, title, status, created_at, target_participants', { count: 'exact' });
        
        dashboardData.totalStudies = adminStudyCount || 0;
        dashboardData.allStudies = adminStudies || [];
      } else {
        dashboardData.totalStudies = totalStudies || 0;
        dashboardData.allStudies = allStudies || [];
      }

      // Calculate active participants (sum of target_participants for active studies)
      const activeStudies = (dashboardData.allStudies || []).filter(study => study.status === 'active');
      const activeParticipants = activeStudies.reduce((sum, study) => sum + (study.target_participants || 0), 0);

      // Calculate completion rate (mock for now - would need sessions/responses table)
      const completionRate = activeStudies.length > 0 ? Math.round(Math.random() * 20 + 75) : 0;

      // Calculate average session time (mock for now)
      const avgSessionTime = activeStudies.length > 0 ? Math.round(Math.random() * 10 + 20) : 0;

      dashboardData = {
        ...dashboardData,
        activeParticipants,
        completionRate,
        avgSessionTime,
        activeStudies: activeStudies.length,
        recentStudies: (dashboardData.allStudies || [])
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3)
          .map(study => ({
            id: study.id,
            title: study.title,
            status: study.status,
            participants: study.target_participants || 0,
            completionRate: Math.round(Math.random() * 30 + 70), // Mock completion rate
            lastUpdate: study.created_at
          }))
      };

    } else if (profile.role === 'participant') {
      // For participants - show participation data
      dashboardData = {
        totalStudies: 0, // Studies they've participated in
        activeParticipants: 1, // They are a participant
        completionRate: 0, // Their completion rate
        avgSessionTime: 0, // Their average session time
        activeStudies: 0,
        recentStudies: []
      };
    }

    return res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard analytics'
    });
  }
});

// Admin System Performance Endpoint
app.get('/api/admin/system-performance', async (req, res) => {
  try {
    // Get Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Verify user and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    console.log('⚡📊 Admin System Performance request from:', user.email);

    const { timeframe = '24h' } = req.query;
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date(now);
    
    switch (timeframe) {
      case '1h':
        startDate.setHours(now.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 1);
    }

    // Get database activity metrics (same logic as API)
    const { data: recentUsers, error: userError } = await supabase
      .from('users')
      .select('id, created_at, last_sign_in_at')
      .gte('created_at', startDate.toISOString())
      .limit(1000);

    if (userError) {
      console.error('User activity query error:', userError);
    }

    // Get study activity
    const { data: recentStudies, error: studyError } = await supabase
      .from('studies')
      .select('id, created_at, status')
      .gte('created_at', startDate.toISOString())
      .limit(1000);

    if (studyError) {
      console.error('Study activity query error:', studyError);
    }

    // Calculate system metrics based on database activity
    const systemMetrics = [
     
      {
        id: 'cpu',
        name: 'CPU Usage',
        value: performanceData.length > 0 ? performanceData[performanceData.length - 1].cpu : 45,
        unit: '%',
        change: performanceData.length > 1 ? 
          performanceData[performanceData.length - 1].cpu - performanceData[performanceData.length - 2].cpu : 0,
        status: performanceData.length > 0 && performanceData[performanceData.length - 1].cpu > 80 ? 'warning' : 'healthy'
      },
      {
        id: 'memory',
        name: 'Memory Usage',
        value: performanceData.length > 0 ? performanceData[performanceData.length - 1].memory : 62,
        unit: '%',
        change: performanceData.length > 1 ? 
          performanceData[performanceData.length - 1].memory - performanceData[performanceData.length - 2].memory : 0,
        status: performanceData.length > 0 && performanceData[performanceData.length - 1].memory > 85 ? 'warning' : 'healthy'
      },
      {
        id: 'response_time',
        name: 'Response Time',
        value: performanceData.length > 0 ? performanceData[performanceData.length - 1].responseTime : 145,
        unit: 'ms',
        change: performanceData.length > 1 ? 
          performanceData[performanceData.length - 2].responseTime - performanceData[performanceData.length - 1].responseTime : 0,
        status: performanceData.length > 0 && performanceData[performanceData.length - 1].responseTime > 300 ? 'warning' : 'healthy'
      },
      {
        id: 'active_users',
        name: 'Active Users',
        value: activeUsers,
        unit: '',
        change: totalUsers > activeUsers ? totalUsers - activeUsers : 0,
        status: 'healthy'
      }
    ];

    const usageStatistics = [
      {
        id: 'total_users',
        name: 'Total Users',
        value: totalUsers,
        unit: 'users',
        change: Math.round(Math.random() * 10) + 1,
        percentage: 100
      },
      {
        id: 'active_studies',
        name: 'Active Studies',
        value: activeStudies,
        unit: 'studies',
        change: totalStudies - activeStudies,
        percentage: totalStudies > 0 ? Math.round((activeStudies / totalStudies) * 100) : 0
      },
      {
        id: 'api_requests',
        name: 'API Requests',
        value: Math.round(activeUsers * 50 + Math.random() * 500), // Estimate based on activity
        unit: 'requests',
        change: Math.round(Math.random() * 100),
        percentage: 100
      },
      {
        id: 'database_queries',
        name: 'Database Queries',
        value: Math.round(activeUsers * 25 + Math.random() * 200),
        unit: 'queries',
        change: Math.round(Math.random() * 50),
        percentage: 100
      }
    ];

    const systemPerformanceData = {
      metrics: systemMetrics,
      performanceData: performanceData,
      usageStatistics: usageStatistics,
      timeframe: timeframe,
      lastUpdated: now.toISOString()
    };

    return res.status(200).json({ success: true, data: systemPerformanceData });
  } catch (error) {
    console.error('System performance data error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch system performance data'
    });
  }
});

// Participant Applications endpoints
app.all('/api/participant-applications*', async (req, res) => {
  try {
    // Import the participant applications handler
    const participantApplicationsModule = await import('./api/participant-applications.js');
    const handler = participantApplicationsModule.default;
    
    // Call the handler with req and res
    await handler(req, res);
  } catch (error) {
    console.error('❌ Participant Applications API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Participant applications operation failed',
      message: error.message
    });
  }
});

// Researcher Applications endpoints
app.all('/api/researcher-applications*', async (req, res) => {
  try {
    // Import the researcher applications handler
    const researcherApplicationsModule = await import('./api/researcher-applications.js');
    const handler = researcherApplicationsModule.default;
    
    // Call the handler with req and res
    await handler(req, res);
  } catch (error) {
    console.error('❌ Researcher Applications API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Researcher applications operation failed',
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

// Recordings API Helper Functions
async function handleRecordingUpload(req, res, supabase) {
  try {
    const { sessionId, recordingData, mimeType, duration } = req.body;

    if (!sessionId || !recordingData) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and recording data are required'
      });
    }

    console.log(`📤 Processing recording upload for session: ${sessionId}`);
    
    const recordingId = `rec_${sessionId}_${Date.now()}`;
    let cloudUploadResult = null;
    
    // Try to upload to cloud storage (falls back to local/base64 if not configured)
    try {
      // Import cloud storage service
      const { uploadRecording, generateFileName } = await import('./src/server/services/cloudStorage.js');
      
      // Generate unique filename
      const fileName = generateFileName(sessionId, 'webm');
      
      // Upload to cloud storage
      cloudUploadResult = await uploadRecording(recordingData, fileName, mimeType, {
        sessionId,
        recordingId,
        uploadedBy: 'local-api',
        originalMimeType: mimeType
      });
      
      console.log('✅ Cloud storage upload successful');
      
    } catch (cloudError) {
      console.warn('⚠️ Cloud storage failed, falling back to base64 storage:', cloudError.message);
      // Continue with base64 storage as fallback
    }
    
    // Prepare recording data for database
    const recordingDataForDB = {
      id: recordingId,
      session_id: sessionId,
      mime_type: mimeType || 'video/webm',
      duration: duration || 0,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add cloud storage info if successful
    if (cloudUploadResult && cloudUploadResult.success) {
      recordingDataForDB.cloud_provider = cloudUploadResult.provider;
      recordingDataForDB.cloud_path = cloudUploadResult.cloudPath;
      recordingDataForDB.cloud_url = cloudUploadResult.cloudUrl;
      recordingDataForDB.file_size = cloudUploadResult.fileSize;
      recordingDataForDB.recording_options = JSON.stringify(cloudUploadResult.metadata);
      // Don't store raw data if cloud upload successful
    } else {
      // Fallback: store as base64 in database
      recordingDataForDB.recording_data = recordingData;
      recordingDataForDB.file_size = recordingData.length;
      recordingDataForDB.cloud_provider = 'local';
    }
    
    const { data: recording, error } = await supabase
      .from('recordings')
      .insert(recordingDataForDB)
      .select()
      .single();

    if (error) {
      console.error('Error saving recording:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save recording',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        recordingId: recording.id,
        sessionId: recording.session_id,
        status: recording.status,
        message: 'Recording uploaded successfully'
      }
    });

  } catch (error) {
    console.error('Recording upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload recording',
      details: error.message
    });
  }
}

async function createRecordingSession(req, res, supabase) {
  try {
    const { studyId, participantId } = req.body;

    if (!studyId) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data: session, error } = await supabase
      .from('recording_sessions')
      .insert({
        id: sessionId,
        study_id: studyId,
        participant_id: participantId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating recording session:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create recording session',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        studyId: session.study_id,
        status: session.status,
        message: 'Recording session created successfully'
      }
    });

  } catch (error) {
    console.error('Recording session creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create recording session',
      details: error.message
    });
  }
}

async function completeRecording(req, res, supabase) {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const { data: session, error } = await supabase
      .from('recording_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error completing recording session:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to complete recording session',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        completedAt: session.completed_at,
        message: 'Recording session completed successfully'
      }
    });

  } catch (error) {
    console.error('Recording completion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to complete recording session',
      details: error.message
    });
  }
}

async function getRecordingBySession(req, res, supabase, sessionId) {
  try {
    const { data: recording, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: recording
    });

  } catch (error) {
    console.error('Get recording error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve recording',
      details: error.message
    });
  }
}

async function getRecordingsByStudy(req, res, supabase, studyId) {
  try {
    const { data: recordings, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('study_id', studyId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve recordings',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: recordings || []
    });

  } catch (error) {
    console.error('Get recordings by study error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve recordings',
      details: error.message
    });
  }
}

async function getAllRecordings(req, res, supabase) {
  try {
    const { data: recordings, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve recordings',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: recordings || [],
      total: recordings?.length || 0
    });

  } catch (error) {
    console.error('Get all recordings error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve recordings',
      details: error.message
    });
  }
}

async function updateRecording(req, res, supabase) {
  try {
    const { recordingId, updates } = req.body;

    if (!recordingId) {
      return res.status(400).json({
        success: false,
        error: 'Recording ID is required'
      });
    }

    const { data: recording, error } = await supabase
      .from('recordings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update recording',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: recording
    });

  } catch (error) {
    console.error('Update recording error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update recording',
      details: error.message
    });
  }
}

async function deleteRecording(req, res, supabase) {
  try {
    const { recordingId } = req.body;

    if (!recordingId) {
      return res.status(400).json({
        success: false,
        error: 'Recording ID is required'
      });
    }

    const { error } = await supabase
      .from('recordings')
      .delete()
      .eq('id', recordingId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete recording',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recording deleted successfully'
    });

  } catch (error) {
    console.error('Delete recording error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete recording',
      details: error.message
    });
  }
}

// Study Sessions endpoints
app.all('/api/study-sessions*', async (req, res) => {
  try {
    console.log(`🔬 Study Sessions API Request: ${req.method} ${req.url}`);
    
    // Import the study sessions handler
    const studySessionsModule = await import('./api/study-sessions.js');
    const handler = studySessionsModule.default;
    
    // Call the handler with req and res
    await handler(req, res);
  } catch (error) {
    console.error('❌ Study Sessions API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Study sessions operation failed',
      message: error.message
    });
  }
});

// Study Blocks endpoints
app.all('/api/study-blocks*', async (req, res) => {
  try {
    console.log(`🧪 Study Blocks API Request: ${req.method} ${req.url}`);
    
    // Import the study blocks handler
    const studyBlocksModule = await import('./api/study-blocks.js');
    const handler = studyBlocksModule.default;
    
    // Call the handler with req and res
    await handler(req, res);
  } catch (error) {
    console.error('❌ Study Blocks API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Study blocks operation failed',
      message: error.message
    });
  }
});

// Block Templates endpoints
app.all('/api/block-templates*', async (req, res) => {
  try {
    console.log(`🧩 Block Templates API Request: ${req.method} ${req.url}`);
    
    // Import the block templates handler
    const blockTemplatesModule = await import('./api/block-templates.js');
    const handler = blockTemplatesModule.default;
    
    // Call the handler with req and res
    await handler(req, res);
  } catch (error) {
    console.error('❌ Block Templates API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Block templates operation failed',
      message: error.message
    });
  }
});

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
    console.log('');    console.log('📝 Available API Endpoints:');
    console.log('   POST /api/auth?action=register');
    console.log('   POST /api/auth?action=login');
    console.log('   GET  /api/auth?action=status');
    console.log('   POST /api/auth?action=logout');
    console.log('   GET  /api/profile');    console.log('   PUT  /api/profile');
    console.log('   GET  /api/studies');
    console.log('   POST /api/admin-setup');
    console.log('   GET  /api/admin/users');
    console.log('   GET  /api/admin/overview');
    console.log('   GET  /api/admin/activity');
    console.log('   POST /api/admin/user-actions (Create User)');
    console.log('   PUT  /api/admin/user-actions?userId=<id> (Update User)');
    console.log('   GET  /api/admin/analytics');
    console.log('   GET  /api/admin/analytics-overview');
    console.log('   GET  /api/admin/studies');
    console.log('   PUT  /api/admin/users/bulk');
    console.log('   GET  /api/admin/financial');
    console.log('   GET  /api/admin/financial-detailed');
    console.log('   GET  /api/admin/system-performance');
    console.log('   GET  /api/admin/user-behavior');
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
