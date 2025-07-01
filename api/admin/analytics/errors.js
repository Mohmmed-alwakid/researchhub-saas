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
    const { timeRange = '24h', search = '', status = 'all', type = 'all' } = req.query;
    
    // Generate mock error data
    const mockErrors = generateMockErrors();
    
    // Filter errors based on query parameters
    const filteredErrors = mockErrors.filter(error => {
      const matchesSearch = search === '' || error.message.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || error.status === status;
      const matchesType = type === 'all' || error.type === type;
      return matchesSearch && matchesStatus && matchesType;
    });

    const metrics = {
      totalErrors: filteredErrors.length,
      errorRate: 0.3 + Math.random() * 0.2, // 0.3-0.5%
      affectedUsers: Math.floor(50 + Math.random() * 30),
      resolvedToday: Math.floor(15 + Math.random() * 10),
      trending: {
        direction: Math.random() > 0.6 ? 'up' : 'down',
        percentage: Math.floor(5 + Math.random() * 15)
      },
      byType: {
        critical: filteredErrors.filter(e => e.type === 'critical').length,
        error: filteredErrors.filter(e => e.type === 'error').length,
        warning: filteredErrors.filter(e => e.type === 'warning').length
      },
      topErrors: filteredErrors.slice(0, 5)
    };

    return res.status(200).json({
      success: true,
      data: {
        metrics,
        errors: filteredErrors.slice(0, 50) // Limit to 50 most recent
      }
    });

  } catch (error) {
    console.error('Error fetching error data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch error data'
    });
  }
}

function generateMockErrors() {
  const errorTypes = ['critical', 'error', 'warning'];
  const statuses = ['new', 'acknowledged', 'resolved', 'ignored'];
  const messages = [
    'Database connection timeout',
    'Authentication service unavailable',
    'File upload failed - quota exceeded',
    'Memory usage exceeding threshold',
    'API rate limit exceeded',
    'SSL certificate validation failed',
    'Cache miss ratio too high',
    'WebSocket connection dropped',
    'Study creation validation error',
    'User session expired unexpectedly',
    'Template rendering failed',
    'Email delivery service timeout',
    'Search index out of sync',
    'Background job queue overflow',
    'CDN cache invalidation failed'
  ];

  const errors = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const type = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const firstOccurred = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const lastOccurred = new Date(now.getTime() - Math.random() * 2 * 60 * 60 * 1000);
    
    errors.push({
      id: `error_${i + 1}`,
      message,
      type,
      count: Math.floor(1 + Math.random() * 20),
      firstOccurred: firstOccurred.toLocaleString(),
      lastOccurred: lastOccurred.toLocaleString(),
      affectedUsers: Math.floor(1 + Math.random() * 10),
      stackTrace: type !== 'warning' ? generateMockStackTrace() : undefined,
      context: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        url: '/api/studies/create',
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        sessionId: `session_${Math.floor(Math.random() * 10000)}`
      },
      status,
      assignedTo: status === 'acknowledged' ? 'admin@researchhub.com' : undefined
    });
  }

  return errors.sort((a, b) => new Date(b.lastOccurred) - new Date(a.lastOccurred));
}

function generateMockStackTrace() {
  return `Error: Database connection timeout
    at DatabaseClient.connect (/app/lib/database.js:45:12)
    at StudyService.create (/app/services/study.js:23:8)
    at StudyController.createStudy (/app/controllers/study.js:67:15)
    at Router.handle (/app/routes/api.js:34:21)
    at next (/app/middleware/auth.js:18:5)
    at authenticate (/app/middleware/auth.js:42:3)
    at Layer.handle [as handle_request] (/node_modules/express/lib/router/layer.js:95:5)
    at next (/node_modules/express/lib/router/route.js:137:13)`;
}
