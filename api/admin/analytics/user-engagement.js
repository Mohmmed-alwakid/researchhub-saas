// User engagement analytics API endpoint
// GET /api/admin/analytics/user-engagement - Get user engagement data

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mock engagement data generator
const generateMockEngagementData = (range) => {
  const daysCount = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  }[range] || 30;

  // Generate daily active users
  const dailyActiveUsers = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate realistic DAU patterns with weekday/weekend variation
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseCount = isWeekend ? 180 : 280;
    const variance = Math.random() * 60 - 30; // ±30 users variance
    
    dailyActiveUsers.push({
      date: date.toISOString().split('T')[0],
      count: Math.max(0, Math.floor(baseCount + variance))
    });
  }

  // Users by role distribution
  const usersByRole = [
    {
      role: 'participant',
      count: 687,
      color: '#10B981' // green
    },
    {
      role: 'researcher',
      count: 432,
      color: '#3B82F6' // blue
    },
    {
      role: 'admin',
      count: 23,
      color: '#8B5CF6' // purple
    }
  ];

  // Registration trend (last 6 months)
  const registrationTrend = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const baseCounts = [45, 67, 89, 123, 98, 156];
  
  months.forEach((month, index) => {
    const prevCount = index > 0 ? baseCounts[index - 1] : baseCounts[index];
    const currentCount = baseCounts[index];
    const growth = ((currentCount - prevCount) / prevCount * 100).toFixed(1);
    
    registrationTrend.push({
      month,
      count: currentCount,
      growth: parseFloat(growth)
    });
  });

  return {
    dailyActiveUsers,
    usersByRole,
    registrationTrend
  };
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { range = '30d' } = req.query;

    // TODO: Replace with real Supabase queries
    // Example real implementation:
    
    // Daily active users
    // const { data: dauData, error: dauError } = await supabase
    //   .from('user_sessions')
    //   .select('user_id, session_start')
    //   .gte('session_start', startDate)
    //   .lte('session_start', endDate);

    // Users by role
    // const { data: roleData, error: roleError } = await supabase
    //   .from('users')
    //   .select('role')
    //   .eq('status', 'active');

    // Registration trend
    // const { data: regData, error: regError } = await supabase
    //   .from('users')
    //   .select('created_at')
    //   .gte('created_at', sixMonthsAgo)
    //   .order('created_at');

    // For now, return mock data
    const engagementData = generateMockEngagementData(range);

    return res.status(200).json({
      success: true,
      data: engagementData
    });

  } catch (error) {
    console.error('Error fetching user engagement data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user engagement data'
    });
  }
}
