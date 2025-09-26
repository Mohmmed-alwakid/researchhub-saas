import { createClient } from '@supabase/supabase-js';


// Subscription management API endpoint
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

  const { action, id } = req.query;

  try {
    // Verify admin access for all operations
    await verifyAdmin(req);

    switch (action) {
      case 'plans':
        return await handlePlans(req, res);
      
      case 'plan':
        return await handlePlan(req, res, id);
      
      case 'subscriptions':
        return await handleSubscriptions(req, res);
      
      case 'subscription':
        return await handleSubscription(req, res, id);
      
      case 'analytics':
        return await handleSubscriptionAnalytics(req, res);
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action. Supported actions: plans, plan, subscriptions, subscription, analytics' 
        });
    }
  } catch (error) {
    console.error('Subscription endpoint error:', error);
    if (error.message.includes('Access denied') || error.message.includes('token')) {
      return res.status(401).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Handle subscription plans
async function handlePlans(req, res) {
  if (req.method === 'GET') {
    // Get all subscription plans
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select(`
        *,
        subscriptions:subscriptions(count)
      `)
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch plans' });
    }

    // Calculate subscriber count and revenue for each plan
    const enrichedPlans = await Promise.all(plans.map(async (plan) => {
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('plan_id', plan.id)
        .eq('status', 'active');

      const subscriberCount = subscriptions?.length || 0;
      const revenue = subscriberCount * plan.price;

      return {
        ...plan,
        subscriberCount,
        revenue
      };
    }));

    return res.status(200).json({
      success: true,
      data: enrichedPlans
    });
  }

  if (req.method === 'POST') {
    // Create new subscription plan
    const { name, description, price, interval, features, limits } = req.body;

    if (!name || price === undefined || !interval) {
      return res.status(400).json({
        success: false,
        error: 'Name, price, and interval are required'
      });
    }

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert([{
        name,
        description,
        price: parseFloat(price),
        interval,
        features: features || [],
        limits: limits || {},
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      data: plan
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

// Handle individual subscription plan
async function handlePlan(req, res, planId) {
  if (!planId) {
    return res.status(400).json({ success: false, error: 'Plan ID is required' });
  }

  if (req.method === 'GET') {
    // Get specific plan
    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    return res.status(200).json({
      success: true,
      data: plan
    });
  }

  if (req.method === 'PUT') {
    // Update plan
    const { name, description, price, interval, features, limits, is_active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (interval !== undefined) updateData.interval = interval;
    if (features !== undefined) updateData.features = features;
    if (limits !== undefined) updateData.limits = limits;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      console.error('Error updating plan:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      data: plan
    });
  }

  if (req.method === 'DELETE') {
    // Check if plan has active subscriptions
    const { data: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('plan_id', planId)
      .eq('status', 'active');

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete plan with active subscriptions'
      });
    }

    // Delete plan
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting plan:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Plan deleted successfully'
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

// Handle subscriptions
async function handleSubscriptions(req, res) {
  if (req.method === 'GET') {
    // Get all subscriptions with user and plan details
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        user:profiles!subscriptions_user_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        plan:subscription_plans!subscriptions_plan_id_fkey(
          id,
          name,
          price,
          interval
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch subscriptions' });
    }

    // Format the response
    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      userId: sub.user_id,
      userName: `${sub.user?.first_name || ''} ${sub.user?.last_name || ''}`.trim(),
      userEmail: sub.user?.email,
      planId: sub.plan_id,
      planName: sub.plan?.name,
      status: sub.status,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      amount: sub.plan?.price || 0,
      interval: sub.plan?.interval || 'month',
      createdAt: sub.created_at
    }));

    return res.status(200).json({
      success: true,
      data: formattedSubscriptions
    });
  }

  if (req.method === 'POST') {
    // Create new subscription
    const { userId, planId, status = 'active' } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Plan ID are required'
      });
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        error: 'User already has an active subscription'
      });
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: userId,
        plan_id: planId,
        status,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    // Update user's subscription info in profiles
    await supabase
      .from('profiles')
      .update({
        subscription_plan: (await supabase.from('subscription_plans').select('name').eq('id', planId).single()).data?.name || 'unknown',
        subscription_status: status
      })
      .eq('id', userId);

    return res.status(201).json({
      success: true,
      data: subscription
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

// Handle individual subscription
async function handleSubscription(req, res, subscriptionId) {
  if (!subscriptionId) {
    return res.status(400).json({ success: false, error: 'Subscription ID is required' });
  }

  if (req.method === 'PUT') {
    // Update subscription
    const { status } = req.body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    // Update user's subscription status in profiles
    if (status) {
      await supabase
        .from('profiles')
        .update({ subscription_status: status })
        .eq('id', subscription.user_id);
    }

    return res.status(200).json({
      success: true,
      data: subscription
    });
  }

  if (req.method === 'DELETE') {
    // Delete subscription
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) {
      console.error('Error deleting subscription:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

// Handle subscription analytics
async function handleSubscriptionAnalytics(req, res) {
  try {
    // Get subscription counts by status
    const { data: subscriptionStats } = await supabase
      .from('subscriptions')
      .select('status, plan_id, created_at, user_id');

    // Get plan details
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('id, name, price');

    // Calculate analytics
    const totalSubscriptions = subscriptionStats?.length || 0;
    const activeSubscriptions = subscriptionStats?.filter(s => s.status === 'active').length || 0;
    const canceledSubscriptions = subscriptionStats?.filter(s => s.status === 'canceled').length || 0;
    
    // Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0;
    subscriptionStats?.filter(s => s.status === 'active').forEach(sub => {
      const plan = plans?.find(p => p.id === sub.plan_id);
      if (plan) {
        mrr += plan.price;
      }
    });

    // Calculate churn rate (simplified)
    const churnRate = totalSubscriptions > 0 ? (canceledSubscriptions / totalSubscriptions) * 100 : 0;

    // Revenue by plan
    const revenueByPlan = {};
    plans?.forEach(plan => {
      const planSubscriptions = subscriptionStats?.filter(s => s.plan_id === plan.id && s.status === 'active').length || 0;
      revenueByPlan[plan.name] = planSubscriptions * plan.price;
    });

    // Monthly trends (simplified - last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthSubscriptions = subscriptionStats?.filter(s => {
        const createdDate = new Date(s.created_at);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length || 0;

      monthlyTrends.push({
        month: date.toLocaleString('default', { month: 'short' }),
        subscriptions: monthSubscriptions,
        revenue: monthSubscriptions * 29 // Average plan price
      });
    }

    const analytics = {
      summary: {
        totalSubscriptions,
        activeSubscriptions,
        canceledSubscriptions,
        churnRate: Math.round(churnRate * 100) / 100,
        mrr,
        totalCustomers: totalSubscriptions
      },
      trends: {
        monthly: monthlyTrends
      },
      breakdown: {
        byPlan: revenueByPlan
      }
    };

    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
