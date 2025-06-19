// Consolidated Admin endpoint - handles all admin operations
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to verify admin access
async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No token provided');
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    throw new Error('Invalid token');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    throw new Error('Access denied. Admin role required.');
  }

  return user;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action, userId } = req.query;

  try {
    // Verify admin access for all operations
    const adminUser = await verifyAdmin(req);

    switch (action) {
      case 'users':
        return await handleUsers(req, res);
      
      case 'user-actions':
        return await handleUserActions(req, res, userId);
      
      case 'users-bulk':
        return await handleUsersBulk(req, res);
      
      case 'overview':
        return await handleOverview(req, res);
      
      case 'analytics':
        return await handleAnalytics(req, res);
      
      case 'financial':
        return await handleFinancial(req, res);
      
      case 'activity':
        return await handleActivity(req, res);
      
      case 'user-behavior':
        return await handleUserBehavior(req, res);
      
      case 'studies':
        return await handleStudies(req, res);
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action. Supported actions: users, user-actions, users-bulk, overview, analytics, financial, activity, user-behavior, studies' 
        });
    }
  } catch (error) {
    console.error('Admin endpoint error:', error);
    if (error.message.includes('Access denied') || error.message.includes('token')) {
      return res.status(401).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle user listing
async function handleUsers(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get all users from auth.users (admin only)
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }

    // Get profiles for additional user data
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*');

    // Combine user data with profiles
    const enrichedUsers = users.users.map(user => {
      const profile = profiles?.find(p => p.id === user.id);
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        first_name: user.user_metadata?.first_name || profile?.first_name || '',
        last_name: user.user_metadata?.last_name || profile?.last_name || '',
        role: user.user_metadata?.role || profile?.role || 'participant',
        status: user.email_confirmed_at ? 'active' : 'pending'
      };
    });

    return res.status(200).json({
      success: true,
      data: enrichedUsers,
      total: enrichedUsers.length
    });
  } catch (error) {
    console.error('Error in handleUsers:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle user actions (create, update, delete)
async function handleUserActions(req, res, userId) {
  try {
    if (req.method === 'POST') {
      // Create new user
      const { email, password, firstName, lastName, role = 'participant' } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, firstName, and lastName are required'
        });
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: role
        },
        email_confirm: true
      });

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      return res.status(201).json({
        success: true,
        data: {
          id: data.user.id,
          email: data.user.email,
          first_name: firstName,
          last_name: lastName,
          role: role,
          created_at: data.user.created_at
        }
      });
    } 
    else if (req.method === 'PUT' && userId) {
      // Update user
      const { firstName, lastName, role, email } = req.body;
      const updates = {};
      
      if (firstName || lastName || role) {
        updates.user_metadata = {};
        if (firstName) updates.user_metadata.first_name = firstName;
        if (lastName) updates.user_metadata.last_name = lastName;
        if (role) updates.user_metadata.role = role;
      }
      
      if (email) updates.email = email;

      const { data, error } = await supabase.auth.admin.updateUserById(userId, updates);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      // Update profile
      const profileUpdates = {};
      if (firstName) profileUpdates.first_name = firstName;
      if (lastName) profileUpdates.last_name = lastName;
      if (role) profileUpdates.role = role;
      profileUpdates.updated_at = new Date().toISOString();

      await supabase
        .from('profiles')
        .upsert({ id: userId, ...profileUpdates });

      return res.status(200).json({ success: true, data: data.user });
    } 
    else if (req.method === 'DELETE' && userId) {
      // Delete user
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      // Delete profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle bulk user operations
async function handleUsersBulk(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { userIds, action, data } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ success: false, error: 'userIds array is required' });
  }

  try {
    const results = [];
    
    for (const userId of userIds) {
      try {
        if (action === 'update_role' && data?.role) {
          const { error } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { role: data.role }
          });
          
          if (!error) {
            await supabase
              .from('profiles')
              .upsert({ id: userId, role: data.role, updated_at: new Date().toISOString() });
          }
          
          results.push({ userId, success: !error, error: error?.message });
        }
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    return res.status(200).json({ success: true, results });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle admin overview
async function handleOverview(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get user statistics
    const { data: users } = await supabase.auth.admin.listUsers();
    const totalUsers = users?.users?.length || 0;
    
    const activeUsers = users?.users?.filter(user => 
      user.last_sign_in_at && 
      new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length || 0;

    // Get study statistics
    const { data: studies, error: studiesError } = await supabase
      .from('studies')
      .select('id, status, created_at');

    const totalStudies = studies?.length || 0;
    const activeStudies = studies?.filter(study => study.status === 'active').length || 0;

    // Mock other statistics
    const stats = {
      totalUsers,
      activeUsers,
      totalStudies,
      activeStudies,
      totalResponses: Math.floor(totalStudies * 15.3),
      averageCompletionRate: 78.5,
      recentActivity: [
        { id: 1, type: 'user_registration', user: 'New user registered', timestamp: new Date().toISOString() },
        { id: 2, type: 'study_created', user: 'Study "UI Research" created', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: 3, type: 'response_submitted', user: 'Response submitted for Study #123', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }
      ]
    };

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle analytics
async function handleAnalytics(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Mock analytics data
    const analytics = {
      userGrowth: [
        { month: 'Jan', users: 120 },
        { month: 'Feb', users: 150 },
        { month: 'Mar', users: 180 },
        { month: 'Apr', users: 220 },
        { month: 'May', users: 280 },
        { month: 'Jun', users: 350 }
      ],
      studyMetrics: {
        totalStudies: 45,
        completedStudies: 38,
        averageResponseTime: 12.5,
        completionRate: 84.4
      },
      topStudies: [
        { name: 'Mobile App UX Research', responses: 156, completion: 92 },
        { name: 'Website Usability Study', responses: 134, completion: 88 },
        { name: 'Product Feature Testing', responses: 98, completion: 76 }
      ]
    };

    return res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle financial data
async function handleFinancial(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Mock financial data
    const financial = {
      revenue: {
        total: 24560,
        monthly: 4200,
        growth: 12.5
      },
      subscriptions: {
        active: 89,
        new: 12,
        churned: 3
      },
      metrics: [
        { month: 'Jan', revenue: 3200, subscriptions: 45 },
        { month: 'Feb', revenue: 3600, subscriptions: 52 },
        { month: 'Mar', revenue: 3900, subscriptions: 58 },
        { month: 'Apr', revenue: 4100, subscriptions: 67 },
        { month: 'May', revenue: 4200, subscriptions: 78 },
        { month: 'Jun', revenue: 4560, subscriptions: 89 }
      ]
    };

    return res.status(200).json({ success: true, data: financial });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle activity logs
async function handleActivity(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Mock activity data
    const activities = [
      { id: 1, type: 'user_login', user: 'john@example.com', timestamp: new Date().toISOString(), details: 'User logged in' },
      { id: 2, type: 'study_created', user: 'admin@example.com', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), details: 'Created study "Mobile App Research"' },
      { id: 3, type: 'response_submitted', user: 'participant@example.com', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), details: 'Submitted response for Study #123' }
    ];

    return res.status(200).json({ success: true, data: activities });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle user behavior analytics
async function handleUserBehavior(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Mock user behavior data
    const behavior = {
      engagementMetrics: {
        averageSessionDuration: 18.5,
        pagesPerSession: 4.2,
        bounceRate: 23.1
      },
      userFlow: [
        { step: 'Landing', users: 1000, dropoff: 0 },
        { step: 'Registration', users: 750, dropoff: 25 },
        { step: 'First Study', users: 600, dropoff: 20 },
        { step: 'Completion', users: 480, dropoff: 20 }
      ],
      popularFeatures: [
        { feature: 'Study Builder', usage: 85 },
        { feature: 'Analytics Dashboard', usage: 78 },
        { feature: 'User Management', usage: 65 }
      ]
    };

    return res.status(200).json({ success: true, data: behavior });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle studies management
async function handleStudies(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { data: studies, error } = await supabase
      .from('studies')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        updated_at,
        creator_id,
        profiles!inner(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const enrichedStudies = studies.map(study => ({
      id: study.id,
      title: study.title,
      description: study.description,
      status: study.status,
      created_at: study.created_at,
      updated_at: study.updated_at,
      creator: {
        name: `${study.profiles.first_name} ${study.profiles.last_name}`,
        email: study.profiles.email
      },
      participants: Math.floor(Math.random() * 50) + 10,
      responses: Math.floor(Math.random() * 30) + 5
    }));

    return res.status(200).json({ success: true, data: enrichedStudies });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
