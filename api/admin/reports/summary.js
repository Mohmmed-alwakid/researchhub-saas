// API endpoint for administrative reports

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { period = 'month' } = req.query;
    
    // Mock reports data - in production, this would query real analytics
    const mockReportsData = [
      {
        id: 'user_analytics',
        name: 'User Analytics',
        reports: [
          {
            id: 'total_users',
            title: 'Total Users',
            description: 'Active registered users',
            value: 12486,
            change: 8.2,
            changeType: 'increase',
            period: period,
            icon: 'Users'
          },
          {
            id: 'new_registrations',
            title: 'New Registrations',
            description: 'Users registered this period',
            value: 384,
            change: 15.6,
            changeType: 'increase',
            period: period,
            icon: 'UserPlus'
          },
          {
            id: 'user_retention',
            title: 'User Retention',
            description: 'Users who returned this period',
            value: 76.4,
            change: 3.2,
            changeType: 'increase',
            period: period,
            icon: 'TrendingUp'
          },
          {
            id: 'daily_active_users',
            title: 'Daily Active Users',
            description: 'Average daily active users',
            value: 2847,
            change: 12.1,
            changeType: 'increase',
            period: period,
            icon: 'Activity'
          }
        ]
      },
      {
        id: 'study_analytics',
        name: 'Study Analytics',
        reports: [
          {
            id: 'total_studies',
            title: 'Total Studies',
            description: 'Studies created this period',
            value: 1253,
            change: 22.5,
            changeType: 'increase',
            period: period,
            icon: 'FileText'
          },
          {
            id: 'completed_studies',
            title: 'Completed Studies',
            description: 'Studies finished this period',
            value: 987,
            change: 18.9,
            changeType: 'increase',
            period: period,
            icon: 'CheckCircle'
          },
          {
            id: 'study_completion_rate',
            title: 'Completion Rate',
            description: 'Percentage of studies completed',
            value: 78.7,
            change: 4.3,
            changeType: 'increase',
            period: period,
            icon: 'BarChart3'
          },
          {
            id: 'participant_engagement',
            title: 'Participant Engagement',
            description: 'Average time per study',
            value: 847,
            change: 7.2,
            changeType: 'increase',
            period: period,
            icon: 'Clock'
          }
        ]
      },
      {
        id: 'system_performance',
        name: 'System Performance',
        reports: [
          {
            id: 'api_response_time',
            title: 'API Response Time',
            description: 'Average response time (ms)',
            value: 142,
            change: 5.8,
            changeType: 'decrease',
            period: period,
            icon: 'Zap'
          },
          {
            id: 'uptime_percentage',
            title: 'System Uptime',
            description: 'System availability percentage',
            value: 99.97,
            change: 0.1,
            changeType: 'increase',
            period: period,
            icon: 'Shield'
          },
          {
            id: 'error_rate',
            title: 'Error Rate',
            description: 'Percentage of failed requests',
            value: 0.12,
            change: 0.03,
            changeType: 'decrease',
            period: period,
            icon: 'AlertTriangle'
          },
          {
            id: 'database_performance',
            title: 'Database Performance',
            description: 'Average query time (ms)',
            value: 23.4,
            change: 2.1,
            changeType: 'decrease',
            period: period,
            icon: 'Database'
          }
        ]
      },
      {
        id: 'business_metrics',
        name: 'Business Metrics',
        reports: [
          {
            id: 'revenue',
            title: 'Revenue',
            description: 'Total revenue this period',
            value: 47250,
            change: 18.4,
            changeType: 'increase',
            period: period,
            icon: 'DollarSign'
          },
          {
            id: 'subscription_growth',
            title: 'Subscription Growth',
            description: 'New subscriptions this period',
            value: 127,
            change: 34.2,
            changeType: 'increase',
            period: period,
            icon: 'TrendingUp'
          },
          {
            id: 'churn_rate',
            title: 'Churn Rate',
            description: 'Percentage of cancelled subscriptions',
            value: 2.8,
            change: 0.4,
            changeType: 'decrease',
            period: period,
            icon: 'TrendingDown'
          },
          {
            id: 'customer_satisfaction',
            title: 'Customer Satisfaction',
            description: 'Average satisfaction score',
            value: 4.6,
            change: 0.2,
            changeType: 'increase',
            period: period,
            icon: 'Star'
          }
        ]
      }
    ];

    // Simulate different data based on period
    if (period === 'week') {
      // Reduce values for weekly data
      mockReportsData.forEach(category => {
        category.reports.forEach(report => {
          if (report.id.includes('total') || report.id.includes('revenue')) {
            report.value = Math.floor(report.value * 0.25);
          }
          if (report.id.includes('new') || report.id.includes('completed')) {
            report.value = Math.floor(report.value * 0.15);
          }
        });
      });
    } else if (period === 'quarter') {
      // Increase values for quarterly data
      mockReportsData.forEach(category => {
        category.reports.forEach(report => {
          if (report.id.includes('total') || report.id.includes('revenue')) {
            report.value = Math.floor(report.value * 3.2);
          }
          if (report.id.includes('new') || report.id.includes('completed')) {
            report.value = Math.floor(report.value * 2.8);
          }
        });
      });
    }

    return res.status(200).json({
      success: true,
      data: mockReportsData
    });

  } catch (error) {
    console.error('Error fetching reports data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch reports data'
    });
  }
}
