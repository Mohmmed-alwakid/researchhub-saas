// Business Intelligence Analytics API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { timeRange = '3m' } = req.query;

    // Mock data for business intelligence analytics
    const mockData = {
      period: getPeriodLabel(timeRange),
      revenue: {
        totalRevenue: 234500,
        monthlyRecurringRevenue: 78300,
        averageOrderValue: 89,
        revenueGrowthRate: 24.5,
        churnRate: 5.2,
        lifetimeValue: 1240
      },
      customers: {
        totalCustomers: 15420,
        activeCustomers: 8930,
        newCustomers: 1890,
        customerAcquisitionCost: 45,
        customerSatisfactionScore: 8.7,
        retentionRate: 94.8
      },
      product: {
        totalStudies: 12450,
        averageStudyCompletion: 73.2,
        popularTemplates: [
          'User Interview Template',
          '5-Second Test Template',
          'Card Sort Template',
          'Usability Test Template',
          'Survey Template'
        ],
        featureAdoptionRate: 67.8
      },
      trends: generateTrendData(timeRange),
      segments: [
        {
          segment: 'Enterprise',
          revenue: 140700,
          customers: 234,
          percentage: 60.0
        },
        {
          segment: 'SMB',
          revenue: 70350,
          customers: 1890,
          percentage: 30.0
        },
        {
          segment: 'Startup',
          revenue: 23450,
          customers: 3456,
          percentage: 10.0
        }
      ],
      forecasts: [
        {
          metric: 'Monthly Revenue',
          current: 78300,
          projected: 95600,
          confidence: 85.2
        },
        {
          metric: 'Customer Acquisition',
          current: 1890,
          projected: 2340,
          confidence: 78.9
        },
        {
          metric: 'Customer Acquisition Cost',
          current: 45,
          projected: 38,
          confidence: 72.5
        },
        {
          metric: 'Churn Rate',
          current: 5.2,
          projected: 4.1,
          confidence: 68.7
        }
      ]
    };

    return res.status(200).json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Business intelligence analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch business intelligence data'
    });
  }
}

function getPeriodLabel(timeRange) {
  switch (timeRange) {
    case '1m': return 'Last Month';
    case '3m': return 'Last 3 Months';
    case '6m': return 'Last 6 Months';
    case '1y': return 'Last Year';
    default: return 'Last 3 Months';
  }
}

function generateTrendData(timeRange) {
  const months = timeRange === '1m' ? 1 : timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
  const trends = [];
  
  const today = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    
    // Generate realistic trend data with growth
    const monthMultiplier = (months - i) / months;
    const baseRevenue = 65000 + (monthMultiplier * 15000) + (Math.random() * 5000);
    const baseCustomers = 6000 + (monthMultiplier * 3000) + (Math.random() * 500);
    const baseStudies = 8000 + (monthMultiplier * 4000) + (Math.random() * 500);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(baseRevenue),
      customers: Math.floor(baseCustomers),
      studies: Math.floor(baseStudies)
    });
  }
  
  return trends;
}
