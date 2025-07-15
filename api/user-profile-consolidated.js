/**
 * CONSOLIDATED USER PROFILE API
 * Merges: profile.js + user-enhanced.js
 * Handles: User profile management, enhanced user operations, role management
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.hM5DhDshOQOhXIepbPWiznEDgpN9MzGhB0kzlxGd_6Y';

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { success: false, error: 'Invalid or expired token', status: 401 };
    }

    // Check role if specified
    if (requiredRoles.length > 0) {
      const userRole = user.user_metadata?.role || 'participant';
      if (!requiredRoles.includes(userRole)) {
        return { 
          success: false, 
          error: `Access denied. Required roles: ${requiredRoles.join(', ')}`, 
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
 * Get user profile
 */
async function handleGetProfile(req, res) {
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

    // Check if user can access this profile
    if (targetUserId !== auth.user.id) {
      const userRole = auth.user.user_metadata?.role || 'participant';
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only view your own profile.'
        });
      }
    }

    // Try to get from users table first
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Get profile error:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      });
    }

    // If no profile in users table, create from auth user
    if (!userProfile) {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
      
      if (authError || !authUser.user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const newProfile = {
        id: authUser.user.id,
        email: authUser.user.email,
        first_name: authUser.user.user_metadata?.first_name || '',
        last_name: authUser.user.user_metadata?.last_name || '',
        role: authUser.user.user_metadata?.role || 'participant',
        created_at: authUser.user.created_at,
        updated_at: new Date().toISOString()
      };

      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from('users')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error('Create profile error:', createError);
        // Return auth user data as fallback
        return res.status(200).json({
          success: true,
          profile: newProfile,
          source: 'auth'
        });
      }

      return res.status(200).json({
        success: true,
        profile: createdProfile,
        source: 'created'
      });
    }

    return res.status(200).json({
      success: true,
      profile: userProfile,
      source: 'database'
    });

  } catch (error) {
    console.error('Get profile exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Update user profile
 */
async function handleUpdateProfile(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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

    // Check if user can update this profile
    if (targetUserId !== auth.user.id) {
      const userRole = auth.user.user_metadata?.role || 'participant';
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only update your own profile.'
        });
      }
    }

    const { 
      firstName, 
      lastName, 
      role, 
      organizationId, 
      bio, 
      location, 
      timezone,
      preferences 
    } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (role) updateData.role = role;
    if (organizationId !== undefined) updateData.organization_id = organizationId;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (preferences !== undefined) updateData.preferences = preferences;

    // Update in users table
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', targetUserId)
      .select()
      .single();

    if (updateError) {
      console.error('Update profile error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }

    // Also update auth metadata if it's the current user
    if (targetUserId === auth.user.id && (firstName || lastName || role)) {
      const authUpdateData = {};
      if (firstName) authUpdateData.first_name = firstName;
      if (lastName) authUpdateData.last_name = lastName;
      if (role) authUpdateData.role = role;

      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        { user_metadata: { ...auth.user.user_metadata, ...authUpdateData } }
      );

      if (authUpdateError) {
        console.error('Update auth metadata error:', authUpdateError);
        // Continue anyway, profile update succeeded
      }
    }

    return res.status(200).json({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Delete user profile/account
 */
async function handleDeleteProfile(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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

    // Check if user can delete this profile
    if (targetUserId !== auth.user.id) {
      const userRole = auth.user.user_metadata?.role || 'participant';
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only delete your own profile.'
        });
      }
    }

    // Delete from users table
    const { error: deleteProfileError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', targetUserId);

    if (deleteProfileError) {
      console.error('Delete profile error:', deleteProfileError);
    }

    // Delete auth user (this will cascade delete related data)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteAuthError) {
      console.error('Delete auth user error:', deleteAuthError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete user account'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User account deleted successfully'
    });

  } catch (error) {
    console.error('Delete profile exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Get user statistics/summary
 */
async function handleGetUserStats(req, res) {
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

    // Get various user statistics
    const stats = {
      profile: {},
      studies: { created: 0, participated: 0 },
      earnings: { total: 0, pending: 0 },
      activity: { lastLogin: null, joinDate: null }
    };

    try {
      // Get basic profile
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('created_at, role')
        .eq('id', targetUserId)
        .single();

      if (profile) {
        stats.profile.role = profile.role;
        stats.activity.joinDate = profile.created_at;
      }

      // Get study statistics based on role
      if (profile?.role === 'researcher' || profile?.role === 'admin') {
        const { count: studiesCreated } = await supabaseAdmin
          .from('studies')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', targetUserId);
        
        stats.studies.created = studiesCreated || 0;
      } else {
        const { count: studiesParticipated } = await supabaseAdmin
          .from('study_applications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', targetUserId)
          .eq('status', 'approved');
        
        stats.studies.participated = studiesParticipated || 0;
      }

      // Get earnings (for participants)
      if (profile?.role === 'participant') {
        const { data: wallet } = await supabaseAdmin
          .from('participant_wallets')
          .select('balance')
          .eq('user_id', targetUserId)
          .single();

        if (wallet) {
          stats.earnings.total = wallet.balance || 0;
        }
      }

    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Continue with partial stats
    }

    return res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get user stats exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Enhanced user search (admin only)
 */
async function handleSearchUsers(req, res) {
  try {
    const auth = await authenticateUser(req, ['admin']);
    if (!auth.success) {
      return res.status(auth.status).json({
        success: false,
        error: auth.error
      });
    }

    const { search, role, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('users')
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
      console.error('Search users error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to search users'
      });
    }

    return res.status(200).json({
      success: true,
      users: users || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Search users exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Update user role (admin only)
 */
async function handleUpdateUserRole(req, res) {
  if (req.method !== 'PUT') {
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

    const { user_id, role } = req.body;

    if (!user_id || !role) {
      return res.status(400).json({
        success: false,
        error: 'User ID and role are required'
      });
    }

    const validRoles = ['participant', 'researcher', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be: ' + validRoles.join(', ')
      });
    }

    // Update in users table
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', user_id)
      .select()
      .single();

    if (updateError) {
      console.error('Update user role error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update user role'
      });
    }

    // Update auth metadata
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { user_metadata: { role } }
    );

    if (authUpdateError) {
      console.error('Update auth role error:', authUpdateError);
      // Continue anyway, database update succeeded
    }

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('Update user role exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
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
    const { action, user_id } = req.query;

    console.log(`=== USER PROFILE ACTION: ${action} ===`);

    switch (action) {
      case 'get':
      case 'profile':
        return await handleGetProfile(req, res);
      
      case 'update':
        return await handleUpdateProfile(req, res);
      
      case 'delete':
        return await handleDeleteProfile(req, res);
      
      case 'stats':
        return await handleGetUserStats(req, res);
      
      case 'search':
        return await handleSearchUsers(req, res);
      
      case 'update-role':
        return await handleUpdateUserRole(req, res);
      
      default:
        // Default to get profile if no action specified
        if (req.method === 'GET') {
          return await handleGetProfile(req, res);
        } else if (req.method === 'PUT') {
          return await handleUpdateProfile(req, res);
        } else if (req.method === 'DELETE') {
          return await handleDeleteProfile(req, res);
        }

        return res.status(400).json({
          success: false,
          error: 'Invalid action',
          availableActions: [
            'get', 'profile', 'update', 'delete', 'stats', 'search', 'update-role'
          ]
        });
    }
  } catch (error) {
    console.error('User Profile handler exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
