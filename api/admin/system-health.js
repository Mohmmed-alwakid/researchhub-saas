// API endpoint for system health monitoring

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Mock system health data - in production, this would collect real metrics
    const mockSystemHealth = {
      overall_status: 'healthy',
      metrics: [
        {
          id: 'api_response_time',
          name: 'API Response Time',
          value: 142,
          unit: 'ms',
          status: 'healthy',
          trend: 'stable',
          icon: 'Activity'
        },
        {
          id: 'database_connections',
          name: 'Database Connections',
          value: 23,
          unit: '',
          status: 'healthy',
          trend: 'up',
          icon: 'Database'
        },
        {
          id: 'memory_usage',
          name: 'Memory Usage',
          value: 67.5,
          unit: '%',
          status: 'warning',
          trend: 'up',
          icon: 'Zap'
        },
        {
          id: 'active_users',
          name: 'Active Users',
          value: 1284,
          unit: '',
          status: 'healthy',
          trend: 'up',
          icon: 'Users'
        },
        {
          id: 'error_rate',
          name: 'Error Rate',
          value: 0.12,
          unit: '%',
          status: 'healthy',
          trend: 'down',
          icon: 'AlertTriangle'
        },
        {
          id: 'cpu_usage',
          name: 'CPU Usage',
          value: 34.8,
          unit: '%',
          status: 'healthy',
          trend: 'stable',
          icon: 'Activity'
        }
      ],
      last_updated: new Date().toISOString()
    };

    // In production, you would:
    // 1. Check actual system metrics
    // 2. Query database performance
    // 3. Monitor API response times
    // 4. Check server resource usage
    // 5. Verify service availability

    // Simulate some dynamic behavior
    const currentHour = new Date().getHours();
    
    // Simulate higher memory usage during business hours
    if (currentHour >= 9 && currentHour <= 17) {
      mockSystemHealth.metrics[2].value = Math.min(85, mockSystemHealth.metrics[2].value + 15);
      if (mockSystemHealth.metrics[2].value > 80) {
        mockSystemHealth.metrics[2].status = 'critical';
        mockSystemHealth.overall_status = 'warning';
      }
    }

    // Simulate more active users during business hours
    if (currentHour >= 9 && currentHour <= 17) {
      mockSystemHealth.metrics[3].value = Math.floor(mockSystemHealth.metrics[3].value * 1.5);
    }

    return res.status(200).json({
      success: true,
      data: mockSystemHealth
    });

  } catch (error) {
    console.error('Error fetching system health:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch system health data'
    });
  }
}
