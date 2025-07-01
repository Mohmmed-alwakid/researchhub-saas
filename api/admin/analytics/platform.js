// Platform Usage Analytics API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { timeRange = '30d' } = req.query;

    // Mock data for platform usage analytics
    const mockData = {
      overview: {
        totalUsers: 15420,
        activeUsers: 8930,
        totalStudies: 2340,
        totalSessions: 45230,
        avgSessionDuration: 1260, // seconds
        userGrowthRate: 18.5
      },
      userActivity: generateUserActivity(timeRange),
      featureUsage: [
        { feature: 'Study Builder', usageCount: 5640, uniqueUsers: 2100, percentage: 87.3 },
        { feature: 'Template Library', usageCount: 4120, uniqueUsers: 1850, percentage: 76.9 },
        { feature: 'Analytics Dashboard', usageCount: 3890, uniqueUsers: 1650, percentage: 68.7 },
        { feature: 'Collaboration Tools', usageCount: 2950, uniqueUsers: 1200, percentage: 49.9 },
        { feature: 'Export Features', usageCount: 2340, uniqueUsers: 980, percentage: 40.8 },
        { feature: 'Advanced Blocks', usageCount: 1890, uniqueUsers: 750, percentage: 31.2 },
        { feature: 'AI Insights', usageCount: 1560, uniqueUsers: 620, percentage: 25.8 },
        { feature: 'API Access', usageCount: 890, uniqueUsers: 340, percentage: 14.1 }
      ],
      deviceBreakdown: [
        { device: 'Desktop', users: 9870, percentage: 64.0 },
        { device: 'Mobile', users: 3890, percentage: 25.2 },
        { device: 'Tablet', users: 1660, percentage: 10.8 }
      ],
      geographicData: [
        { country: 'United States', users: 6890, percentage: 44.7 },
        { country: 'United Kingdom', users: 2340, percentage: 15.2 },
        { country: 'Canada', users: 1890, percentage: 12.3 },
        { country: 'Germany', users: 1560, percentage: 10.1 },
        { country: 'Australia', users: 1230, percentage: 8.0 },
        { country: 'France', users: 890, percentage: 5.8 },
        { country: 'Netherlands', users: 620, percentage: 4.0 }
      ]
    };

    return res.status(200).json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Platform analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch platform usage data'
    });
  }
}

function generateUserActivity(timeRange) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const activity = [];
  
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic activity data with some variance
    const baseActive = 250 + Math.random() * 100;
    const baseNew = 15 + Math.random() * 25;
    const baseReturning = baseActive - baseNew;
    const baseSessions = baseActive * (1.2 + Math.random() * 0.8);
    
    activity.push({
      date: date.toISOString().split('T')[0],
      dailyActiveUsers: Math.floor(baseActive),
      newUsers: Math.floor(baseNew),
      returningUsers: Math.floor(baseReturning),
      sessionCount: Math.floor(baseSessions)
    });
  }
  
  return activity;
}
