/**
 * SIMPLIFIED RESEARCH API - Based on Working Health Pattern
 * Fixed and tested for production deployment
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { action } = req.query;
    
    console.log(`🔧 Research API - ${req.method} ${action}`);

    switch (action) {
      case 'get-studies':
        return res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              title: 'Sample Research Study',
              description: 'A demonstration study for the platform',
              status: 'active',
              created_at: new Date().toISOString(),
              created_by: 'system',
              type: 'user_research'
            }
          ],
          total: 1,
          timestamp: new Date().toISOString()
        });

      case 'dashboard-analytics':
        return res.status(200).json({
          success: true,
          data: {
            totalStudies: 1,
            activeStudies: 1,
            totalApplications: 0,
            completedSessions: 0,
            recentActivity: []
          },
          timestamp: new Date().toISOString()
        });

      case 'get-block-types':
        return res.status(200).json({
          success: true,
          data: [
            { id: 'welcome-screen', name: 'Welcome Screen', category: 'introductory' },
            { id: 'open-question', name: 'Open Question', category: 'qualitative' },
            { id: 'multiple-choice', name: 'Multiple Choice', category: 'selection' },
            { id: 'thank-you', name: 'Thank You', category: 'closing' }
          ],
          total: 4
        });

      case 'health':
        return res.status(200).json({
          success: true,
          message: 'Research API is healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        });

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: [
            'get-studies',
            'dashboard-analytics', 
            'get-block-types',
            'health'
          ]
        });
    }

  } catch (error) {
    console.error('❌ Research API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
