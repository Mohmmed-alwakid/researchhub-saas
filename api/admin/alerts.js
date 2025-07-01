import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// API endpoint for system alerts management
export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (method === 'GET') {
    try {
      // Generate mock alert data
      const mockAlerts = generateMockAlerts();
      
      const stats = {
        total: mockAlerts.length,
        active: mockAlerts.filter(a => a.status === 'active').length,
        acknowledged: mockAlerts.filter(a => a.status === 'acknowledged').length,
        resolved: mockAlerts.filter(a => a.status === 'resolved').length,
        bySeverity: {
          critical: mockAlerts.filter(a => a.severity === 'critical').length,
          high: mockAlerts.filter(a => a.severity === 'high').length,
          medium: mockAlerts.filter(a => a.severity === 'medium').length,
          low: mockAlerts.filter(a => a.severity === 'low').length
        }
      };

      return res.status(200).json({
        success: true,
        data: {
          alerts: mockAlerts,
          stats
        }
      });

    } catch (error) {
      console.error('Error fetching alerts:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch alerts'
      });
    }
  }

  if (method === 'POST' && id) {
    // Handle alert actions (acknowledge, resolve)
    const { action } = req.body;
    
    try {
      // In a real implementation, update the alert in the database
      return res.status(200).json({
        success: true,
        message: `Alert ${action}d successfully`
      });
    } catch (error) {
      console.error('Error updating alert:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update alert'
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}

function generateMockAlerts() {
  const severities = ['critical', 'high', 'medium', 'low'];
  const statuses = ['active', 'acknowledged', 'resolved'];
  const alertMessages = [
    'High CPU usage detected on production server',
    'Database response time exceeding threshold',
    'Memory usage above 85% for 10 minutes',
    'Error rate increased to 2.5%',
    'Disk space running low on primary server',
    'SSL certificate expires in 7 days',
    'Backup job failed for the second time',
    'API endpoint /api/studies showing high latency',
    'WebSocket connections dropping frequently',
    'Authentication service experiencing delays'
  ];

  const rules = [
    'CPU Usage Alert',
    'Database Performance Monitor',
    'Memory Usage Warning',
    'Error Rate Threshold',
    'Disk Space Monitor',
    'SSL Certificate Expiry',
    'Backup Failure Alert',
    'API Latency Monitor',
    'WebSocket Health Check',
    'Auth Service Monitor'
  ];

  const alerts = [];
  const now = new Date();

  for (let i = 0; i < 15; i++) {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const message = alertMessages[Math.floor(Math.random() * alertMessages.length)];
    const ruleName = rules[Math.floor(Math.random() * rules.length)];
    
    const triggeredAt = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    
    const alert = {
      id: `alert_${i + 1}`,
      ruleId: `rule_${Math.floor(Math.random() * 10) + 1}`,
      ruleName,
      severity,
      message,
      triggeredAt: triggeredAt.toLocaleString(),
      status,
      context: {
        server: `server-${Math.floor(Math.random() * 5) + 1}`,
        metric: 'cpu_usage',
        value: Math.floor(85 + Math.random() * 15),
        threshold: 85
      }
    };

    if (status === 'acknowledged') {
      alert.acknowledgedBy = 'admin@researchhub.com';
      alert.acknowledgedAt = new Date(triggeredAt.getTime() + Math.random() * 60 * 60 * 1000).toLocaleString();
    }

    if (status === 'resolved') {
      alert.resolvedAt = new Date(triggeredAt.getTime() + Math.random() * 2 * 60 * 60 * 1000).toLocaleString();
    }

    alerts.push(alert);
  }

  return alerts.sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));
}
          type: 'system',
          priority: 'high',
          title: 'API Rate Limit Approaching',
          message: 'External API rate limit at 85%. Consider implementing caching or upgrading API plan.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          status: 'active'
        },
        {
          id: 'alert-006',
          type: 'security',
          priority: 'medium',
          title: 'SSL Certificate Expiring',
          message: 'SSL certificate for researchhub.com will expire in 30 days. Renewal recommended.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          status: 'acknowledged',
          acknowledged_by: 'admin',
          acknowledged_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        }
      ];

      // Sort alerts by timestamp (newest first)
      mockAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return res.status(200).json({
        success: true,
        data: mockAlerts
      });

    } catch (error) {
      console.error('Error fetching alerts:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch alerts'
      });
    }
  }

  if (method === 'PUT' && id) {
    try {
      const { action } = req.body;
      
      if (!action || !['acknowledge', 'resolve'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Must be "acknowledge" or "resolve"'
        });
      }

      // In production, this would update the alert in the database
      console.log(`Alert ${id} ${action}d by admin`);

      return res.status(200).json({
        success: true,
        message: `Alert ${action}d successfully`
      });

    } catch (error) {
      console.error('Error updating alert:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update alert'
      });
    }
  }

  if (method === 'POST') {
    try {
      const { type, priority, title, message } = req.body;
      
      if (!type || !priority || !title || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: type, priority, title, message'
        });
      }

      // In production, this would create a new alert in the database
      const newAlert = {
        id: `alert-${Date.now()}`,
        type,
        priority,
        title,
        message,
        timestamp: new Date().toISOString(),
        status: 'active'
      };

      console.log('New alert created:', newAlert);

      return res.status(201).json({
        success: true,
        data: newAlert
      });

    } catch (error) {
      console.error('Error creating alert:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create alert'
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}
