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

    // Get timeframe parameter
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
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get user trends (daily registrations)
    const { data: userTrends, error: userTrendsError } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (userTrendsError) {
      console.error('Error fetching user trends:', userTrendsError);
    }

    // Get study trends (daily study creations)
    const { data: studyTrends, error: studyTrendsError } = await supabase
      .from('studies')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (studyTrendsError) {
      console.error('Error fetching study trends:', studyTrendsError);
    }

    // Get session trends (daily session counts)
    const { data: sessionTrends, error: sessionTrendsError } = await supabase
      .from('study_sessions')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (sessionTrendsError) {
      console.error('Error fetching session trends:', sessionTrendsError);
    }

    // Process trends data to group by date
    const processTrends = (data, defaultValue = 0) => {
      if (!data || data.length === 0) {
        return [];
      }

      const groupedData = {};
      data.forEach(item => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        groupedData[date] = (groupedData[date] || 0) + 1;
      });

      // Fill missing dates with 0
      const result = [];
      const currentDate = new Date(startDate);
      while (currentDate <= now) {
        const dateStr = currentDate.toISOString().split('T')[0];
        result.push({
          _id: dateStr,
          count: groupedData[dateStr] || defaultValue
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    };

    const analytics = {
      userTrends: processTrends(userTrends),
      studyTrends: processTrends(studyTrends),
      sessionTrends: processTrends(sessionTrends),
      timeframe
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
}
