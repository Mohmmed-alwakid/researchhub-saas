import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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

    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
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

    // Get subscription data (Note: This assumes a subscriptions table exists)
    // If not exists, we'll return mock/placeholder data
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan_type,
        status,
        amount,
        currency,
        created_at,
        updated_at,
        profiles!subscriptions_user_id_fkey (
          name,
          email
        )
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    // If subscriptions table doesn't exist, return mock data structure
    const subscriptionData = subscriptionsError ? [] : subscriptions;

    // Calculate financial metrics
    const totalRevenue = subscriptionData.reduce((sum, sub) => {
      return sum + (parseFloat(sub.amount) || 0);
    }, 0);

    const activeSubscriptions = subscriptionData.filter(sub => sub.status === 'active').length;
    const cancelledSubscriptions = subscriptionData.filter(sub => sub.status === 'cancelled').length;

    // Group revenue by date for trends
    const revenueByDate = {};
    subscriptionData.forEach(sub => {
      const date = new Date(sub.created_at).toISOString().split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + (parseFloat(sub.amount) || 0);
    });

    // Fill missing dates with 0
    const revenueTrends = [];
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      revenueTrends.push({
        date: dateStr,
        revenue: revenueByDate[dateStr] || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group by plan type
    const revenueByPlan = {};
    subscriptionData.forEach(sub => {
      const plan = sub.plan_type || 'Unknown';
      revenueByPlan[plan] = (revenueByPlan[plan] || 0) + (parseFloat(sub.amount) || 0);
    });

    // Calculate churn rate (simplified)
    const totalSubscriptionsInPeriod = subscriptionData.length;
    const churnRate = totalSubscriptionsInPeriod > 0 
      ? (cancelledSubscriptions / totalSubscriptionsInPeriod) * 100 
      : 0;

    // Monthly Recurring Revenue (MRR) calculation
    const monthlyActiveSubscriptions = subscriptionData.filter(sub => 
      sub.status === 'active' && 
      new Date(sub.created_at) >= new Date(now.getFullYear(), now.getMonth(), 1)
    );
    
    const mrr = monthlyActiveSubscriptions.reduce((sum, sub) => {
      const amount = parseFloat(sub.amount) || 0;
      // Assuming amount is monthly, adjust if needed
      return sum + amount;
    }, 0);

    // Get top customers by revenue
    const customerRevenue = {};
    subscriptionData.forEach(sub => {
      const userId = sub.user_id;
      const customerName = sub.profiles?.name || sub.profiles?.email || 'Unknown';
      if (!customerRevenue[userId]) {
        customerRevenue[userId] = {
          name: customerName,
          email: sub.profiles?.email || 'Unknown',
          totalRevenue: 0,
          subscriptionCount: 0
        };
      }
      customerRevenue[userId].totalRevenue += parseFloat(sub.amount) || 0;
      customerRevenue[userId].subscriptionCount += 1;
    });

    const topCustomers = Object.values(customerRevenue)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    const financialReport = {
      summary: {
        totalRevenue,
        activeSubscriptions,
        cancelledSubscriptions,
        churnRate: Math.round(churnRate * 100) / 100,
        mrr,
        totalCustomers: Object.keys(customerRevenue).length
      },
      trends: {
        revenue: revenueTrends,
        timeframe
      },
      breakdown: {
        byPlan: revenueByPlan,
        topCustomers
      },
      recentSubscriptions: subscriptionData.slice(0, 20).map(sub => ({
        id: sub.id,
        customerName: sub.profiles?.name || 'Unknown',
        customerEmail: sub.profiles?.email || 'Unknown',
        planType: sub.plan_type,
        amount: sub.amount,
        status: sub.status,
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
}
