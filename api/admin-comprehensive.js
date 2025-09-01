/**
 * COMPREHENSIVE ADMIN PANEL API
 * Purpose: Complete admin functionality for user management, analytics, and system monitoring
 * Date: September 1, 2025
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://cgobqlfqvmhvbjwagzca.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnb2JxbGZxdm1odmJqd2FnemNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk5MjkzOCwiZXhwIjoyMDQ5NTY4OTM4fQ.lzNLcBWm8Vd8Z94IhCeaSmOdFa9l3YI2c6Jp_Xj1PuY';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnb2JxbGZxdm1odmJqd2FnemNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5OTI5MzgsImV4cCI6MjA0OTU2ODkzOH0.0_wBhcRWqQ_aTQWCrF_gLJvlEGkdCCUEeY6Q_xvUXn8';

// Create Supabase clients
let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// =====================================================================================
// ADMIN AUTHENTICATION & AUTHORIZATION
// =====================================================================================

async function verifyAdminAccess(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      throw new Error('Admin access required');
    }

    return { user, userData };
  } catch (error) {
    throw new Error(`Access denied: ${error.message}`);
  }
}

// =====================================================================================
// USER MANAGEMENT FUNCTIONS
// =====================================================================================

async function getAllUsers(req, res) {
  try {
    await verifyAdminAccess(req);

    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        role,
        status,
        created_at,
        last_login,
        login_attempts,
        locked_until,
        profile_completed,
        last_active
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }
    if (role) {
      query = query.eq('role', role);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: users, error, count } = await query;

    if (error) throw error;

    // Get usage stats for each user
    const userIds = users.map(user => user.id);
    const { data: usageStats } = await supabaseAdmin
      .from('user_usage_stats')
      .select('user_id, studies_created_this_period, studies_total, participants_total')
      .in('user_id', userIds);

    // Get subscription info
    const { data: subscriptions } = await supabaseAdmin
      .from('user_subscriptions')
      .select('user_id, plan_id, status, amount')
      .in('user_id', userIds)
      .eq('status', 'active');

    // Combine data
    const enrichedUsers = users.map(user => {
      const usage = usageStats?.find(u => u.user_id === user.id) || {};
      const subscription = subscriptions?.find(s => s.user_id === user.id) || {};
      
      return {
        ...user,
        usage: {
          studies_this_period: usage.studies_created_this_period || 0,
          studies_total: usage.studies_total || 0,
          participants_total: usage.participants_total || 0
        },
        subscription: {
          plan: subscription.plan_id || 'free',
          status: subscription.status || 'free',
          revenue: subscription.amount || 0
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        users: enrichedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || users.length,
          totalPages: Math.ceil((count || users.length) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function getUserDetails(req, res) {
  try {
    await verifyAdminAccess(req);

    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Get user basic info
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get usage stats
    const { data: usageStats } = await supabaseAdmin
      .from('user_usage_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get subscription info
    const { data: subscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    // Get recent usage events
    const { data: recentEvents } = await supabaseAdmin
      .from('usage_events')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(50);

    // Get user's studies
    const { data: studies } = await supabaseAdmin
      .from('studies')
      .select('id, title, status, created_at')
      .eq('researcher_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        user,
        usage: usageStats || {
          studies_created_this_period: 0,
          studies_total: 0,
          participants_total: 0,
          max_studies_allowed: 3
        },
        subscription: subscription || { plan_id: 'free', status: 'free' },
        recentEvents: recentEvents || [],
        recentStudies: studies || []
      }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function updateUserStatus(req, res) {
  try {
    await verifyAdminAccess(req);

    const { userId, status, reason = '' } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        error: 'User ID and status are required'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    await supabaseAdmin
      .from('usage_events')
      .insert({
        user_id: userId,
        event_type: 'admin_action',
        event_category: 'user_management',
        event_data: {
          action: 'status_update',
          old_status: data.status,
          new_status: status,
          reason,
          admin_id: req.user?.id
        }
      });

    return res.status(200).json({
      success: true,
      data: { user: data }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// =====================================================================================
// ANALYTICS & DASHBOARD FUNCTIONS
// =====================================================================================

async function getDashboardAnalytics(req, res) {
  try {
    await verifyAdminAccess(req);

    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' });

    // Active users (logged in last 30 days)
    const { count: activeUsers } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .gte('last_active', startDate.toISOString());

    // New users in period
    const { count: newUsers } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', startDate.toISOString());

    // Total studies
    const { count: totalStudies } = await supabaseAdmin
      .from('studies')
      .select('id', { count: 'exact' });

    // Studies created in period
    const { count: newStudies } = await supabaseAdmin
      .from('studies')
      .select('id', { count: 'exact' })
      .gte('created_at', startDate.toISOString());

    // Revenue analytics
    const { data: revenueData } = await supabaseAdmin
      .from('user_subscriptions')
      .select('plan_id, amount, status')
      .eq('status', 'active');

    const monthlyRevenue = revenueData?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;

    // Plan distribution
    const planDistribution = revenueData?.reduce((acc, sub) => {
      acc[sub.plan_id] = (acc[sub.plan_id] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get free users count
    const { count: freeUsers } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .not('id', 'in', `(${revenueData?.map(r => `'${r.user_id}'`).join(',') || "''"})`)
      .or('id.is.null');

    planDistribution.free = freeUsers || 0;

    // Usage events summary
    const { data: usageEvents } = await supabaseAdmin
      .from('usage_events')
      .select('event_type, event_category')
      .gte('occurred_at', startDate.toISOString());

    const eventSummary = usageEvents?.reduce((acc, event) => {
      const key = `${event.event_category}_${event.event_type}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}) || {};

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          newUsers: newUsers || 0,
          totalStudies: totalStudies || 0,
          newStudies: newStudies || 0,
          monthlyRevenue: monthlyRevenue,
          period
        },
        planDistribution,
        eventSummary,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function getRevenueAnalytics(req, res) {
  try {
    await verifyAdminAccess(req);

    const { period = '30d' } = req.query;

    // Get active subscriptions
    const { data: subscriptions } = await supabaseAdmin
      .from('user_subscriptions')
      .select(`
        plan_id,
        amount,
        currency,
        status,
        current_period_start,
        current_period_end,
        created_at
      `)
      .eq('status', 'active');

    // Calculate metrics
    const totalMRR = subscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;
    const totalARR = totalMRR * 12;
    
    // Plan breakdown
    const planRevenue = subscriptions?.reduce((acc, sub) => {
      const plan = sub.plan_id;
      if (!acc[plan]) {
        acc[plan] = { count: 0, revenue: 0 };
      }
      acc[plan].count += 1;
      acc[plan].revenue += sub.amount || 0;
      return acc;
    }, {}) || {};

    // Growth calculation (simplified)
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const currentMonthSubs = subscriptions?.filter(sub => 
      new Date(sub.created_at).getMonth() === currentMonth
    ) || [];
    
    const lastMonthSubs = subscriptions?.filter(sub => 
      new Date(sub.created_at).getMonth() === lastMonth
    ) || [];

    const growth = lastMonthSubs.length > 0 ? 
      ((currentMonthSubs.length - lastMonthSubs.length) / lastMonthSubs.length) * 100 : 0;

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalMRR,
          totalARR,
          activeSubscriptions: subscriptions?.length || 0,
          averageRevenuePerUser: subscriptions?.length ? totalMRR / subscriptions.length : 0,
          monthlyGrowthRate: growth
        },
        planBreakdown: planRevenue,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get revenue analytics error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// =====================================================================================
// SYSTEM MONITORING FUNCTIONS
// =====================================================================================

async function getSystemAlerts(req, res) {
  try {
    await verifyAdminAccess(req);

    const { status = 'open', severity = '', limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('system_alerts')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data: alerts, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: { alerts: alerts || [] }
    });

  } catch (error) {
    console.error('Get system alerts error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function acknowledgeAlert(req, res) {
  try {
    const { user } = await verifyAdminAccess(req);

    const { alertId } = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('system_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_by: user.id,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: { alert: data }
    });

  } catch (error) {
    console.error('Acknowledge alert error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// =====================================================================================
// NOTIFICATION MANAGEMENT
// =====================================================================================

async function sendNotification(req, res) {
  try {
    await verifyAdminAccess(req);

    const { 
      userIds = [], 
      title, 
      message, 
      type = 'info', 
      category = 'system',
      actionUrl = null,
      actionLabel = null 
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required'
      });
    }

    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      category,
      action_url: actionUrl,
      action_label: actionLabel
    }));

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: { 
        notifications: data,
        sent: data?.length || 0
      }
    });

  } catch (error) {
    console.error('Send notification error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// =====================================================================================
// MAIN HANDLER
// =====================================================================================

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if Supabase is configured
  if (!supabase || !supabaseAdmin) {
    return res.status(500).json({
      success: false,
      error: 'Database not configured'
    });
  }

  try {
    const { action } = req.query;
    
    switch (action) {
      // User Management
      case 'get-all-users':
        return getAllUsers(req, res);
      case 'get-user-details':
        return getUserDetails(req, res);
      case 'update-user-status':
        return updateUserStatus(req, res);
      
      // Analytics
      case 'dashboard-analytics':
        return getDashboardAnalytics(req, res);
      case 'revenue-analytics':
        return getRevenueAnalytics(req, res);
      
      // System Monitoring
      case 'system-alerts':
        return getSystemAlerts(req, res);
      case 'acknowledge-alert':
        return acknowledgeAlert(req, res);
      
      // Notifications
      case 'send-notification':
        return sendNotification(req, res);
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }
    
  } catch (error) {
    console.error('Admin API handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
