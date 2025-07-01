// User metrics analytics API endpoint
// GET /api/admin/analytics/user-metrics - Get comprehensive user metrics

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mock user metrics data - replace with real Supabase queries in production
const generateMockUserMetrics = (range) => {
  const baseUsers = 1247;
  const activePercentage = 0.68;
  const growthRates = {
    '7d': 2.3,
    '30d': 8.7,
    '90d': 23.1,
    '1y': 87.4
  };

  const retentionRates = {
    '7d': 94.2,
    '30d': 82.6,
    '90d': 74.3,
    '1y': 68.9
  };

  return {
    totalUsers: Math.floor(baseUsers * (1 + (growthRates[range] || 0) / 100)),
    activeUsers: Math.floor(baseUsers * activePercentage),
    newUsersThisMonth: Math.floor(baseUsers * 0.12),
    userGrowthRate: growthRates[range] || 0,
    avgSessionDuration: Math.floor(Math.random() * 30) + 25, // 25-55 minutes
    retentionRate: retentionRates[range] || 70,
    churnRate: 100 - (retentionRates[range] || 70),
    topUserSegments: [
      {
        name: 'Active Researchers',
        count: Math.floor(baseUsers * 0.35),
        percentage: 35
      },
      {
        name: 'Regular Participants',
        count: Math.floor(baseUsers * 0.45),
        percentage: 45
      },
      {
        name: 'Power Users',
        count: Math.floor(baseUsers * 0.15),
        percentage: 15
      },
      {
        name: 'Occasional Users',
        count: Math.floor(baseUsers * 0.05),
        percentage: 5
      }
    ]
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
    // const { data: totalUsers, error: totalError } = await supabase
    //   .from('users')
    //   .select('id', { count: 'exact' });

    // const { data: activeUsers, error: activeError } = await supabase
    //   .from('users')
    //   .select('id', { count: 'exact' })
    //   .gte('last_login', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // const { data: newUsers, error: newError } = await supabase
    //   .from('users')
    //   .select('id', { count: 'exact' })
    //   .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // For now, return mock data
    const metrics = generateMockUserMetrics(range);

    return res.status(200).json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user metrics'
    });
  }
}
