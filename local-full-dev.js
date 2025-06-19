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
    }

    console.log('💰 Admin Financial report request from:', user.email);

    // Mock financial data
    const financialReport = {
      summary: {
        totalRevenue: 12450.50,
        activeSubscriptions: 45,
        cancelledSubscriptions: 8,
        churnRate: 15.09,
        mrr: 2890.00,
        totalCustomers: 53
      },
      trends: {
        revenue: Array.from({length: 30}, (_, i) => ({
          date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 500) + 100
        })),
        timeframe: req.query.timeframe || '30d'
      },
      breakdown: {
        byPlan: {
          'Basic': 5670.50,
          'Pro': 4890.00,
          'Enterprise': 1890.00
        },
        topCustomers: [
          { name: 'Research Corp', email: 'admin@researchcorp.com', totalRevenue: 890.00, subscriptionCount: 3 },
          { name: 'UX Studio', email: 'billing@uxstudio.com', totalRevenue: 650.00, subscriptionCount: 2 }
        ]
      },
      recentSubscriptions: [
        {
          id: 'sub_1',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          planType: 'Pro',
          amount: 29.99,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]
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
    console.log('   GET  /api/admin/studies');
    console.log('   PUT  /api/admin/users/bulk');
    console.log('   GET  /api/admin/financial');
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
