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
      
      // Add analytics-overview action
      case 'analytics-overview':
        return handleAnalyticsOverview(req, res);
      
      // Add financial-detailed action  
      case 'financial-detailed':
        return handleFinancialDetailed(req, res);
        
      // Add system-performance action
      case 'system-performance':
        return handleSystemPerformance(req, res);
        
      // Add user-behavior action
      case 'user-behavior':
        return handleUserBehavior(req, res);
      
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
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      // Fallback to profiles table if auth.admin fails
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        return res.status(500).json({ success: false, error: 'Failed to fetch users' });
      }

      const enrichedUsers = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        last_sign_in_at: profile.last_login,
        email_confirmed_at: profile.is_email_verified ? profile.created_at : null,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        role: profile.role || 'participant',
        status: profile.status || 'active',
        subscription: profile.subscription_plan || 'free',
        subscription_status: profile.subscription_status || 'active'
      }));

      return res.status(200).json({
        success: true,
        data: enrichedUsers,
        total: enrichedUsers.length
      });
    }

    // Get profiles for additional user data
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*');

    // Combine user data with profiles
    const enrichedUsers = authUsers.users.map(user => {
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
        status: profile?.status || (user.email_confirmed_at ? 'active' : 'pending'),
        subscription: profile?.subscription_plan || 'free',
        subscription_status: profile?.subscription_status || 'active'
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
      }      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: role,
          status: 'active',
          subscription_plan: 'free',
          subscription_status: 'active',
          is_email_verified: true,
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

// Handle financial data with real Supabase queries
async function handleFinancial(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
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
    const newSubscriptions = (subscriptions || []).length;
    
    // Mock revenue calculation based on subscription tiers (you can enhance this based on your pricing)
    const revenuePerPlan = {
      'basic': 29,
      'pro': 79,
      'enterprise': 199
    };
    
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    
    (subscriptions || []).forEach(sub => {
      const planRevenue = revenuePerPlan[sub.subscription_plan] || 29;
      totalRevenue += planRevenue;
      
      // Calculate if subscription was created this month
      const subDate = new Date(sub.created_at);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      if (subDate >= thisMonth) {
        monthlyRevenue += planRevenue;
      }
    });

    // Create monthly breakdown
    const metrics = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthSubs = (subscriptions || []).filter(s => {
        const subDate = new Date(s.created_at);
        return subDate >= monthStart && subDate <= monthEnd;
      });
      
      const monthRevenue = monthSubs.reduce((sum, sub) => {
        return sum + (revenuePerPlan[sub.subscription_plan] || 29);
      }, 0);
      
      metrics.push({
        month: months[monthDate.getMonth()],
        revenue: monthRevenue,
        subscriptions: monthSubs.length
      });
    }

    const financial = {
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        growth: metrics.length > 1 ? 
          Math.round(((metrics[metrics.length - 1].revenue - metrics[metrics.length - 2].revenue) / Math.max(metrics[metrics.length - 2].revenue, 1)) * 100) : 0
      },
      subscriptions: {
        active: activeSubscriptions,
        new: newSubscriptions,
        churned: Math.max(0, (allUsers || []).length - activeSubscriptions - newSubscriptions)
      },
      metrics
    };

    return res.status(200).json({ success: true, data: financial });
  } catch (error) {
    console.error('Financial data error:', error);
    
    // Fallback to mock data if there's an error
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
    
    return res.status(200).json({ success: true, data: financial, fallback: true });
  }
}

// Handle detailed financial data with more granular information
async function handleFinancialDetailed(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
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
    
    // Fallback to mock detailed data
    const detailedFinancial = {
      overview: {
        totalRevenue: 24560,
        totalSubscribers: 89,
        averageRevenuePerUser: 276,
        customerLifetimeValue: 3312
      },
      revenueByPlan: {
        basic: { price: 29, count: 45, revenue: 1305 },
        pro: { price: 79, count: 35, revenue: 2765 },
        enterprise: { price: 199, count: 9, revenue: 1791 }
      },
      dailyTrends: [
        { date: '2025-06-12', revenue: 850, subscribers: 3 },
        { date: '2025-06-13', revenue: 920, subscribers: 4 },
        { date: '2025-06-14', revenue: 780, subscribers: 2 },
        { date: '2025-06-15', revenue: 1100, subscribers: 5 },
        { date: '2025-06-16', revenue: 950, subscribers: 3 },
        { date: '2025-06-17', revenue: 1200, subscribers: 6 },
        { date: '2025-06-18', revenue: 1050, subscribers: 4 }
      ],
      metrics: {
        churnRate: 3.2,
        conversionRate: 12.5,
        monthlyGrowthRate: 8.7
      },
      studyMetrics: {
        totalStudies: 156,
        activeStudies: 23,
        studyCreationTrend: 1.2
      }
    };
    
    return res.status(200).json({ success: true, data: detailedFinancial, fallback: true });
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

// Handle analytics overview with real data
async function handleAnalyticsOverview(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
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
      ...recentUsers.map(user => ({
        id: `user_${user.email}`,
        type: 'user_registered',
        description: 'New user registered',
        timestamp: user.created_at,
        user: user.email
      })),
      ...recentStudies.map(study => ({
        id: `study_${study.title}`,
        type: 'study_created',
        description: `Study "${study.title}" created`,
        timestamp: study.created_at,
        user: study.profiles.email
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    // Mock data for fields we don't have yet
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
}

// Handle user behavior analytics with real data
async function handleUserBehavior(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate timeframe
    let daysAgo = 30;
    switch (timeframe) {
      case '7d': daysAgo = 7; break;
      case '30d': daysAgo = 30; break;
      case '90d': daysAgo = 90; break;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get user registration trends
    const { data: userTrends } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    // Get study creation trends
    const { data: studyTrends } = await supabase
      .from('studies')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    // Group by date
    const groupByDate = (data, dateField) => {
      const grouped = {};
      data.forEach(item => {
        const date = new Date(item[dateField]).toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + 1;
      });
      return Object.entries(grouped).map(([date, count]) => ({ _id: date, count }));
    };

    const userRegistrationTrends = groupByDate(userTrends || [], 'created_at');
    const studyCreationTrends = groupByDate(studyTrends || [], 'created_at');

    // Generate session trends (mock for now)
    const sessionTrends = Array.from({length: daysAgo}, (_, i) => ({
      _id: new Date(Date.now() - (daysAgo-1-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 10
    }));

    const behaviorAnalytics = {
      userTrends: userRegistrationTrends,
      studyTrends: studyCreationTrends, 
      sessionTrends,
      timeframe
    };

    return res.status(200).json({ success: true, data: behaviorAnalytics });
  } catch (error) {
    console.error('User behavior analytics error:', error);
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
      `)      .order('created_at', { ascending: false });

    return res.status(200).json({ success: true, data: performanceMetrics });
  } catch (error) {
    console.error('System performance error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle system performance metrics
async function handleSystemPerformance(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
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

    // Get database activity metrics
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
    const totalUsers = (recentUsers || []).length;
    const activeUsers = (recentUsers || []).filter(u => u.last_sign_in_at && 
      new Date(u.last_sign_in_at) > startDate).length;
    const totalStudies = (recentStudies || []).length;
    const activeStudies = (recentStudies || []).filter(s => s.status === 'active').length;

    // Generate performance data based on real activity
    const performanceData = [];
    const hours = timeframe === '1h' ? 1 : timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
    
    for (let i = hours - 1; i >= 0; i--) {
      const hourDate = new Date(now);
      hourDate.setHours(hourDate.getHours() - i);
      
      // Calculate activity for this hour
      const hourStart = new Date(hourDate);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourEnd.getHours() + 1);
      
      const hourActivity = (recentUsers || []).filter(u => {
        const signInDate = u.last_sign_in_at ? new Date(u.last_sign_in_at) : null;
        return signInDate && signInDate >= hourStart && signInDate < hourEnd;
      }).length;
      
      // Simulate realistic performance metrics
      const baseLoad = 30 + (hourActivity * 5); // Base load + activity impact
      const cpuUsage = Math.min(95, baseLoad + Math.random() * 20);
      const memoryUsage = Math.min(90, baseLoad + Math.random() * 15);
      const responseTime = Math.max(50, 200 - (hourActivity * 2) + Math.random() * 100);
      
      performanceData.push({
        timestamp: hourStart.toISOString(),
        cpu: Math.round(cpuUsage),
        memory: Math.round(memoryUsage),
        responseTime: Math.round(responseTime),
        activeUsers: hourActivity
      });
    }

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
    
    // Fallback to mock data if there's an error
    const systemPerformanceData = {
      metrics: [
        { id: 'cpu', name: 'CPU Usage', value: 68, unit: '%', change: 5.2, status: 'healthy' },
        { id: 'memory', name: 'Memory Usage', value: 74, unit: '%', change: -2.1, status: 'healthy' },
        { id: 'response_time', name: 'Response Time', value: 145, unit: 'ms', change: -15, status: 'healthy' },
        { id: 'active_users', name: 'Active Users', value: 23, unit: '', change: 3, status: 'healthy' }
      ],
      performanceData: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        cpu: Math.floor(Math.random() * 30) + 50,
        memory: Math.floor(Math.random() * 25) + 60,
        responseTime: Math.floor(Math.random() * 100) + 100,
        activeUsers: Math.floor(Math.random() * 10) + 15
      })),
      usageStatistics: [
        { id: 'total_users', name: 'Total Users', value: 1247, unit: 'users', change: 23, percentage: 100 },
        { id: 'active_studies', name: 'Active Studies', value: 89, unit: 'studies', change: 7, percentage: 78 },
        { id: 'api_requests', name: 'API Requests', value: 15642, unit: 'requests', change: 891, percentage: 100 },
        { id: 'database_queries', name: 'Database Queries', value: 8329, unit: 'queries', change: 456, percentage: 100 }
      ],
      timeframe: 'mock',
      lastUpdated: new Date().toISOString()
    };
    
    return res.status(200).json({ success: true, data: systemPerformanceData, fallback: true });
  }
}
