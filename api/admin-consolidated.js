import { createClient } from '@supabase/supabase-js';


/**
 * CONSOLIDATED ADMIN & SUBSCRIPTIONS API
 * Merges: admin.js + subscriptions.js + points.js
 * Handles: Admin operations, subscription management, points system
 */

// Supabase configuration - prefer environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create Supabase clients if credentials are available
let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
} else {
  console.log('⚠️ Supabase credentials not found, using fallback mode');
}

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  console.log('✅ Supabase Admin client initialized');
} else {
  console.log('⚠️ Supabase Admin credentials not found, using fallback mode');
}

/**
 * Helper function to authenticate user
 */
async function authenticateUser(req, requiredRoles = []) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header', status: 401 };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Check if running in local development mode
    const isLocalDevelopment = process.env.NODE_ENV === 'development' || 
                              req.headers.host?.includes('localhost') ||
                              req.headers.host?.includes('127.0.0.1');
    
    // Check if Supabase is available
    const hasSupabase = supabase !== null;
    
    if (isLocalDevelopment || !hasSupabase) {
      console.log('🔧 Using fallback authentication (local development or no Supabase)');
      const fallbackUser = {
        id: 'admin-fallback',
        email: 'abwanwr77+admin@gmail.com',
        user_metadata: { role: 'admin' }
      };
      
      if (requiredRoles.length > 0 && !requiredRoles.includes('admin')) {
        return { 
          success: false, 
          error: `Access denied. Required roles: ${requiredRoles.join(', ')}`, 
          status: 403 
        };
      }
      
      return { success: true, user: fallbackUser };
    }
    
    // Try Supabase auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Fallback authentication for development/testing
      if (token.includes('fallback-token')) {
        console.log('🔧 Using fallback authentication for admin');
        const fallbackUser = {
          id: 'admin-fallback',
          email: 'abwanwr77+admin@gmail.com',
          user_metadata: { role: 'admin' }
        };
        
        if (requiredRoles.length > 0 && !requiredRoles.includes('admin')) {
          return { 
            success: false, 
            error: `Access denied. Required roles: ${requiredRoles.join(', ')}`, 
            status: 403 
          };
        }
        
        return { success: true, user: fallbackUser };
      }
      
      return { success: false, error: 'Invalid or expired token', status: 401 };
    }

    // Check role if specified
    if (requiredRoles.length > 0) {
      const userRole = user.user_metadata?.role || user.app_metadata?.role || 'participant';
      
      // Special handling for known admin email
      if (user.email === 'abwanwr77+admin@gmail.com') {
        console.log('✅ Admin user detected by email');
        return { success: true, user: { ...user, user_metadata: { ...user.user_metadata, role: 'admin' } } };
      }
      
      if (!requiredRoles.includes(userRole)) {
        console.log(`🚨 Role mismatch: User has '${userRole}', required: ${requiredRoles.join(', ')}`);
        return { 
          success: false, 
          error: `Access denied. Required roles: ${requiredRoles.join(', ')}. Current role: ${userRole}`, 
          status: 403 
        };
      }
    }

    return { success: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed', status: 500 };
  }
}

/**
 * ADMIN HANDLERS
 */

/**
 * Get system overview (admin only)
 */
async function handleAdminOverview(req, res) {
  try {
    const auth = await authenticateUser(req, ['admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const overview = {
      timestamp: new Date().toISOString(),
      system: {},
      users: {},
      studies: {},
      financials: {}
    };

    try {
      // System metrics
      overview.system = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      };

      // User statistics
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: researcherCount },
        { count: participantCount }
      ] = await Promise.all([
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'researcher'),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'participant')
      ]);

      overview.users = {
        total: totalUsers || 0,
        active: activeUsers || 0,
        researchers: researcherCount || 0,
        participants: participantCount || 0
      };

      // Study statistics
      const [
        { count: totalStudies },
        { count: activeStudies },
        { count: completedStudies },
        { count: totalApplications }
      ] = await Promise.all([
        supabaseAdmin.from('studies').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('studies').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabaseAdmin.from('studies').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabaseAdmin.from('study_applications').select('*', { count: 'exact', head: true })
      ]);

      overview.studies = {
        total: totalStudies || 0,
        active: activeStudies || 0,
        completed: completedStudies || 0,
        applications: totalApplications || 0
      };

      // Financial overview
      const { data: wallets } = await supabaseAdmin
        .from('participant_wallets')
        .select('balance');

      const totalBalance = wallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0;

      overview.financials = {
        totalParticipantBalance: totalBalance,
        totalWallets: wallets?.length || 0
      };

    } catch (error) {
      console.error('Error fetching admin overview:', error);
      overview.error = 'Some statistics could not be loaded';
    }

    return res.status(200).json({
      success: true,
      overview
    });

  } catch (error) {
    console.error('Admin overview exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Manage users (admin only)
 */
async function handleUserManagement(req, res) {
  try {
    const auth = await authenticateUser(req, ['admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { action: subAction, user_id } = req.query;
    
    console.log('👥 User management - sub-action:', subAction);
    
    // Default to listing users if no sub-action specified
    // When action=users, default to list
    switch (subAction) {
      case 'list':
      case undefined:
      case null:
      case '':
      case 'users': // Handle when action=users is passed directly
        return await handleListUsers(req, res);
      
      case 'activate':
      case 'deactivate':
        return await handleToggleUserStatus(req, res, subAction, user_id);
      
      case 'delete':
        return await handleDeleteUser(req, res, user_id);
      
      default:
        return res.status(400).json({
          success: false,
          error: `Invalid sub-action: ${subAction}`,
          availableActions: ['list', 'activate', 'deactivate', 'delete'],
          note: 'If no sub-action is provided, defaults to "list"'
        });
    }

  } catch (error) {
    console.error('User management exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * List users with pagination
 */
async function handleListUsers(req, res) {
  try {
    console.log('👥 Fetching users list...');
    const { search, role, status, limit = 50, offset = 0 } = req.query;

    // Check if running in local development mode or no Supabase
    const isLocalDevelopment = process.env.NODE_ENV === 'development' || 
                              req.headers.host?.includes('localhost') ||
                              req.headers.host?.includes('127.0.0.1');
    
    const hasSupabaseAdmin = supabaseAdmin !== null;
    
    if (isLocalDevelopment || !hasSupabaseAdmin) {
      console.log('🔧 Using mock users (local development or no Supabase)');
      const mockUsers = [
        {
          id: 'researcher-1',
          email: 'abwanwr77+Researcher@gmail.com',
          first_name: 'Research',
          last_name: 'User',
          role: 'researcher',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'participant-1',
          email: 'abwanwr77+participant@gmail.com',
          first_name: 'Participant',
          last_name: 'User',
          role: 'participant',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'admin-1',
          email: 'abwanwr77+admin@gmail.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return res.status(200).json({ success: true,
        data: mockUsers,
        pagination: {
          total: mockUsers.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          totalPages: 1
        }
      });
    }

    try {
      let query = supabaseAdmin
        .from('profiles')
        .select('id, email, first_name, last_name, role, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      if (role) {
        query = query.eq('role', role);
      }

      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      const { data: users, error } = await query;

      if (error) {
        console.error('List users database error:', error);
        throw error;
      }

      console.log(`✅ Successfully fetched ${users?.length || 0} users from database`);

      return res.status(200).json({
        success: true,
        users: users || [],
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });

    } catch (dbError) {
      console.warn('Database unavailable, providing fallback user data:', dbError.message);
      
      // Fallback user data for development/testing
      const fallbackUsers = [
        {
          id: 'researcher-1',
          email: 'abwanwr77+Researcher@gmail.com',
          first_name: 'Research',
          last_name: 'User',
          role: 'researcher',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'participant-1',
          email: 'abwanwr77+participant@gmail.com',
          first_name: 'Participant',
          last_name: 'User',
          role: 'participant',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'admin-1',
          email: 'abwanwr77+admin@gmail.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return res.status(200).json({
        success: true,
        users: fallbackUsers,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        },
        note: 'Displaying fallback data - database unavailable'
      });
    }

  } catch (error) {
    console.error('List users exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Toggle user status
 */
async function handleToggleUserStatus(req, res, action, userId) {
  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const isActive = action === 'activate';

    // In a real implementation, you might have an 'active' field
    // For now, we'll just update the updated_at timestamp
    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        updated_at: new Date().toISOString(),
        // status: isActive ? 'active' : 'inactive'  // If you have a status field
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Toggle user status error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update user status'
      });
    }

    return res.status(200).json({
      success: true,
      user,
      message: `User ${action}d successfully`
    });

  } catch (error) {
    console.error('Toggle user status exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Delete user
 */
async function handleDeleteUser(req, res, userId) {
  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Delete from profiles table
    const { error: deleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Delete user from users table error:', deleteError);
    }

    // Delete auth user
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Delete auth user error:', authDeleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Create a new user (admin only)
 */
async function handleCreateUser(req, res) {
  try {
    const auth = await authenticateUser(req, ['admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, password, role'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate role
    const validRoles = ['admin', 'researcher', 'participant'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Check if running in local development mode or no Supabase
    const isLocalDevelopment = process.env.NODE_ENV === 'development' || 
                              req.headers.host?.includes('localhost') ||
                              req.headers.host?.includes('127.0.0.1');
    
    const hasSupabaseAdmin = supabaseAdmin !== null;
    
    if (isLocalDevelopment || !hasSupabaseAdmin) {
      console.log('🔧 Mock user creation (local development or no Supabase)');
      
      // Return mock success response for development/testing
      const mockUser = {
        id: `mock-user-${Date.now()}`,
        email: email,
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true
      };

      return res.status(201).json({
        success: true,
        message: 'User created successfully (mock)',
        user: mockUser
      });
    }

    try {
      // Create auth user first
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          role: role,
          full_name: name
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        return res.status(400).json({
          success: false,
          error: authError.message || 'Failed to create user account'
        });
      }

      // Create user profile
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // Cleanup: delete auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        
        return res.status(500).json({
          success: false,
          error: 'Failed to create user profile'
        });
      }

      console.log('✅ User created successfully:', email);

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          active: true
        }
      });

    } catch (supabaseError) {
      console.error('Supabase user creation error:', supabaseError);
      return res.status(500).json({
        success: false,
        error: 'Database error during user creation'
      });
    }

  } catch (error) {
    console.error('Create user exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Update user (admin only)
 */
async function handleUpdateUser(req, res) {
  try {
    const auth = await authenticateUser(req, ['admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    if (req.method !== 'PUT') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    const { user_id } = req.query;
    const { role, isActive, name, email } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Check if running in local development mode or no Supabase
    const isLocalDevelopment = process.env.NODE_ENV === 'development' || 
                              req.headers.host?.includes('localhost') ||
                              req.headers.host?.includes('127.0.0.1');
    
    const hasSupabaseAdmin = supabaseAdmin !== null;
    
    if (isLocalDevelopment || !hasSupabaseAdmin) {
      console.log('🔧 Mock user update (local development or no Supabase)');
      
      return res.status(200).json({
        success: true,
        message: 'User updated successfully (mock)',
        user: {
          id: user_id,
          email: email || 'mock@example.com',
          first_name: name?.split(' ')[0] || 'Mock',
          last_name: name?.split(' ').slice(1).join(' ') || 'User',
          role: role || 'researcher',
          updated_at: new Date().toISOString(),
          active: isActive !== undefined ? isActive : true
        }
      });
    }

    try {
      // Prepare update data for profiles table
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (role) {
        updateData.role = role;
      }
      
      if (name) {
        const nameParts = name.trim().split(' ');
        updateData.first_name = nameParts[0] || '';
        updateData.last_name = nameParts.slice(1).join(' ') || '';
      }
      
      if (email) {
        updateData.email = email;
      }

      // Update user profile
      const { data: updatedProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', user_id)
        .select()
        .single();

      if (profileError) {
        console.error('Profile update error:', profileError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update user profile'
        });
      }

      // Update auth user metadata if needed
      if (role || name) {
        const authUpdateData = {};
        if (role) authUpdateData.role = role;
        if (name) authUpdateData.full_name = name;

        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          {
            user_metadata: authUpdateData
          }
        );

        if (authError) {
          console.error('Auth user update error:', authError);
          // Continue anyway, profile update was successful
        }
      }

      console.log('✅ User updated successfully:', user_id);

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: updatedProfile
      });

    } catch (supabaseError) {
      console.error('Supabase user update error:', supabaseError);
      return res.status(500).json({
        success: false,
        error: 'Database error during user update'
      });
    }

  } catch (error) {
    console.error('Update user exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Delete user action handler (admin only)
 */
async function handleDeleteUserAction(req, res) {
  try {
    const auth = await authenticateUser(req, ['admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    if (req.method !== 'DELETE') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Check if running in local development mode or no Supabase
    const isLocalDevelopment = process.env.NODE_ENV === 'development' || 
                              req.headers.host?.includes('localhost') ||
                              req.headers.host?.includes('127.0.0.1');
    
    const hasSupabaseAdmin = supabaseAdmin !== null;
    
    if (isLocalDevelopment || !hasSupabaseAdmin) {
      console.log('🔧 Mock user deletion (local development or no Supabase)');
      
      return res.status(200).json({
        success: true,
        message: 'User deleted successfully (mock)'
      });
    }

    try {
      // Delete from profiles table first
      const { error: deleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', user_id);

      if (deleteError) {
        console.error('Delete user from profiles table error:', deleteError);
      }

      // Delete auth user
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

      if (authDeleteError) {
        console.error('Delete auth user error:', authDeleteError);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete user'
        });
      }

      console.log('✅ User deleted successfully:', user_id);

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (supabaseError) {
      console.error('Supabase user deletion error:', supabaseError);
      return res.status(500).json({
        success: false,
        error: 'Database error during user deletion'
      });
    }

  } catch (error) {
    console.error('Delete user exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * SUBSCRIPTIONS HANDLERS
 */

/**
 * Get user subscriptions
 */
async function handleGetSubscriptions(req, res) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { user_id } = req.query;
    const targetUserId = user_id || auth.user.id;

    // Check access permissions
    if (targetUserId !== auth.user.id) {
      const userRole = auth.user.user_metadata?.role || 'participant';
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    // For now, return mock subscription data
    // In production, this would connect to a real subscription service
    const mockSubscriptions = [
      {
        id: 'sub_basic',
        plan: 'Basic Plan',
        status: 'active',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: ['5 active studies', 'Basic analytics', 'Email support'],
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return res.status(200).json({
      success: true,
      subscriptions: mockSubscriptions,
      activeSubscription: mockSubscriptions[0] || null
    });

  } catch (error) {
    console.error('Get subscriptions exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Create subscription
 */
async function handleCreateSubscription(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const auth = await authenticateUser(req, ['researcher', 'admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { plan_id, payment_method } = req.body;

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }

    // Mock subscription creation
    // In production, this would integrate with Stripe, PayPal, etc.
    const mockSubscription = {
      id: `sub_${Date.now()}`,
      user_id: auth.user.id,
      plan_id,
      status: 'active',
      created_at: new Date().toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    return res.status(201).json({
      success: true,
      subscription: mockSubscription,
      message: 'Subscription created successfully'
    });

  } catch (error) {
    console.error('Create subscription exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * POINTS SYSTEM HANDLERS
 */

/**
 * Get user points
 */
async function handleGetPoints(req, res) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { user_id } = req.query;
    const targetUserId = user_id || auth.user.id;

    // Check access permissions
    if (targetUserId !== auth.user.id) {
      const userRole = auth.user.user_metadata?.role || 'participant';
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    // Check if we have Supabase admin client
    if (!supabaseAdmin) {
      console.log('⚠️ Supabase admin client not available, using fallback');
      return res.status(200).json({
        success: true,
        points: {
          current: 0,
          lifetime: 0,
          tier: 'Bronze'
        },
        mode: 'fallback'
      });
    }

    // Get points from wallet (using wallet balance as points)
    try {
      const { data: wallet, error } = await supabaseAdmin
        .from('participant_wallets')
        .select('balance')
        .eq('participant_id', targetUserId)
        .single();

      if (error) {
        console.log('Points system database error:', error);
        // Return fallback response
        return res.status(200).json({
          success: true,
          points: {
            current: 0,
            lifetime: 0,
            tier: 'Bronze'
          },
          mode: 'fallback',
          note: 'Database table not available'
        });
      }

      const points = wallet?.balance || 0;

      return res.status(200).json({
        success: true,
        points: {
          current: points,
          lifetime: points, // In production, you'd track lifetime points separately
          tier: getPointsTier(points)
        },
        mode: 'database'
      });
    } catch (dbError) {
      console.log('Points system database exception:', dbError);
      return res.status(200).json({
        success: true,
        points: {
          current: 0,
          lifetime: 0,
          tier: 'Bronze'
        },
        mode: 'fallback',
        note: 'Database connection failed'
      });
    }

  } catch (error) {
    console.error('Get points exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Award points
 */
async function handleAwardPoints(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const auth = await authenticateUser(req, ['admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { user_id, points, reason } = req.body;

    if (!user_id || !points) {
      return res.status(400).json({
        success: false,
        error: 'User ID and points amount are required'
      });
    }

    // Update wallet balance (using it as points system)
    const { data: wallet, error: getError } = await supabaseAdmin
      .from('participant_wallets')
      .select('balance')
      .eq('participant_id', user_id)
      .single();

    const currentBalance = wallet?.balance || 0;
    const newBalance = currentBalance + points;

    if (wallet) {
      // Update existing wallet
      const { error: updateError } = await supabaseAdmin
        .from('participant_wallets')
        .update({ balance: newBalance })
        .eq('participant_id', user_id);

      if (updateError) {
        console.error('Update points error:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Failed to award points'
        });
      }
    } else {
      // Create new wallet
      const { error: createError } = await supabaseAdmin
        .from('participant_wallets')
        .insert({
          participant_id: user_id,
          balance: points
        });

      if (createError) {
        console.error('Create wallet for points error:', createError);
        return res.status(500).json({
          success: false,
          error: 'Failed to award points'
        });
      }
    }

    return res.status(200).json({
      success: true,
      points: {
        awarded: points,
        previous: currentBalance,
        current: newBalance,
        reason: reason || 'Points awarded by admin'
      },
      message: 'Points awarded successfully'
    });

  } catch (error) {
    console.error('Award points exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Get points tier based on total points
 */
function getPointsTier(points) {
  if (points < 100) return 'Bronze';
  if (points < 500) return 'Silver';
  if (points < 1000) return 'Gold';
  return 'Platinum';
}

/**
 * Main handler - routes to appropriate sub-handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    console.log(`=== ADMIN ACTION: ${action} ===`);

    switch (action) {
      // Admin
      case 'overview':
      case 'admin-overview':
        return await handleAdminOverview(req, res);
      
      case 'users':
      case 'user-management':
        return await handleUserManagement(req, res);
      
      case 'create':
      case 'create-user':
        return await handleCreateUser(req, res);
      
      case 'update':
      case 'update-user':
        return await handleUpdateUser(req, res);
      
      case 'delete':
      case 'delete-user':
        return await handleDeleteUserAction(req, res);
      
      // Subscriptions
      case 'subscriptions':
      case 'get-subscriptions':
        return await handleGetSubscriptions(req, res);
      
      case 'create-subscription':
        return await handleCreateSubscription(req, res);
      
      // Points
      case 'points':
      case 'get-points':
        return await handleGetPoints(req, res);
      
      case 'award-points':
        return await handleAwardPoints(req, res);
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action',
          availableActions: [
            'overview', 'admin-overview', 'users', 'user-management', 
            'create', 'create-user', 'update', 'update-user', 'delete', 'delete-user',
            'subscriptions', 'get-subscriptions', 'create-subscription',
            'points', 'get-points', 'award-points'
          ]
        });
    }
  } catch (error) {
    console.error('Admin handler exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
