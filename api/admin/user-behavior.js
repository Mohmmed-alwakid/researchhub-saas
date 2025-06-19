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
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get user engagement data (sessions per day)
    const { data: sessions, error: sessionsError } = await supabase
      .from('study_sessions')
      .select('created_at, user_id')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
    }

    // Get user logins/activity data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, last_login_at')
      .gte('last_login_at', startDate.toISOString());

    if (profilesError) {
      console.error('Error fetching user activity:', profilesError);
    }

    // Process user engagement data
    const dailyEngagement = {};
    const dailyActiveSessions = {};
    const sessionData = sessions || [];

    sessionData.forEach(session => {
      const date = new Date(session.created_at).toISOString().split('T')[0];
      
      if (!dailyEngagement[date]) {
        dailyEngagement[date] = {
          activeUsers: new Set(),
          totalSessions: 0
        };
      }
      
      dailyEngagement[date].activeUsers.add(session.user_id);
      dailyEngagement[date].totalSessions += 1;
    });

    // Convert to daily engagement metrics
    const userEngagement = [];
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = dailyEngagement[dateStr];
      
      const activeUsers = dayData ? dayData.activeUsers.size : 0;
      const totalSessions = dayData ? dayData.totalSessions : 0;
      const sessionsPerUser = activeUsers > 0 ? totalSessions / activeUsers : 0;

      userEngagement.push({
        date: dateStr,
        activeUsers,
        sessionsPerUser: Math.round(sessionsPerUser * 100) / 100
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Feature usage analysis (based on study types, session durations, etc.)
    const { data: studies, error: studiesError } = await supabase
      .from('studies')
      .select('id, title, type, status')
      .gte('created_at', startDate.toISOString());

    const featureUsage = {
      'Study Creation': (studies || []).length,
      'Session Recording': sessionData.length,
      'User Management': 0, // This would come from admin logs
      'Analytics Dashboard': 0, // This would come from page view logs
      'Data Export': 0 // This would come from export logs
    };

    // Device types analysis (simplified - would need user agent data in real implementation)
    const deviceTypes = {
      'Desktop': Math.floor(sessionData.length * 0.7), // Mock data - 70% desktop
      'Mobile': Math.floor(sessionData.length * 0.25), // Mock data - 25% mobile
      'Tablet': Math.floor(sessionData.length * 0.05)  // Mock data - 5% tablet
    };

    // Try to get actual device data if available
    const { data: deviceData, error: deviceError } = await supabase
      .from('session_metadata')
      .select('device_type')
      .gte('created_at', startDate.toISOString());

    if (!deviceError && deviceData) {
      const actualDeviceTypes = {};
      deviceData.forEach(session => {
        const device = session.device_type || 'Unknown';
        actualDeviceTypes[device] = (actualDeviceTypes[device] || 0) + 1;
      });
      
      // Use actual data if available
      if (Object.keys(actualDeviceTypes).length > 0) {
        Object.assign(deviceTypes, actualDeviceTypes);
      }
    }

    const behaviorAnalytics = {
      userEngagement,
      featureUsage,
      deviceTypes,
      timeframe
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
}
