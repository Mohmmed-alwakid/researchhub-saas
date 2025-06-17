export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    res.status(200).json({
      success: true,
      message: 'ResearchHub API is running',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'production',
      functions: {
        total: 8,
        limit: 12,
        status: 'under_limit'
      },
      endpoints: {
        auth: {
          base: '/api/auth',
          register: '/api/auth?action=register',
          login: '/api/auth?action=login',
          logout: '/api/auth?action=logout',
          refresh: '/api/auth?action=refresh',
          profile: '/api/auth?action=profile',
          status: '/api/auth?action=status'
        },
        health: '/api/health',
        studies: '/api/studies',
        payments: '/api/payments/create-subscription',
        admin: {
          users: '/api/admin/users',
          analytics: '/api/admin/analytics'
        }
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
}
