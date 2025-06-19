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

    // Get system metrics
    const [
      usersResult,
      studiesResult,
      sessionsResult,
      subscriptionsResult
    ] = await Promise.all([
      // Total users count
      supabase
        .from('profiles')
        .select('id, created_at', { count: 'exact' })
        .order('created_at', { ascending: false }),

      // Studies count
      supabase
        .from('studies')
        .select('id, status, created_at', { count: 'exact' })
        .order('created_at', { ascending: false }),

      // Sessions count (from study_sessions if that table exists)
      supabase
        .from('study_sessions')
        .select('id, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(1000), // Reasonable limit for counting

      // Subscriptions count
      supabase
        .from('profiles')
        .select('subscription_tier', { count: 'exact' })
        .not('subscription_tier', 'is', null)
        .neq('subscription_tier', 'free')
    ]);

    // Calculate growth percentages (comparing last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      recentUsersResult,
      previousUsersResult,
      recentStudiesResult,
      previousStudiesResult
    ] = await Promise.all([
      // Users in last 30 days
      supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString()),

      // Users in previous 30 days
      supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString()),

      // Studies in last 30 days
      supabase
        .from('studies')
        .select('id', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString()),

      // Studies in previous 30 days
      supabase
        .from('studies')
        .select('id', { count: 'exact' })
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString())
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const userGrowth = calculateGrowth(
      recentUsersResult.count || 0,
      previousUsersResult.count || 0
    );

    const studyGrowth = calculateGrowth(
      recentStudiesResult.count || 0,
      previousStudiesResult.count || 0
    );

    // Count active studies (status = 'active' or 'running')
    const { count: activeStudiesCount } = await supabase
      .from('studies')
      .select('id', { count: 'exact' })
      .in('status', ['active', 'running', 'published']);

    // Prepare response data
    const overview = {
      totalUsers: usersResult.count || 0,
      userGrowth: Math.round(userGrowth * 10) / 10,
      
      totalStudies: studiesResult.count || 0,
      activeStudies: activeStudiesCount || 0,
      studyGrowth: Math.round(studyGrowth * 10) / 10,
      
      totalSessions: sessionsResult.count || 0,
      sessionGrowth: 0, // Could implement if we track session timestamps
      
      activeSubscriptions: subscriptionsResult.count || 0,
      subscriptionGrowth: 0, // Could implement with subscription history
      
      // System health indicators
      systemHealth: 'healthy',
      lastUpdated: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch admin overview'
    });
  }
}
