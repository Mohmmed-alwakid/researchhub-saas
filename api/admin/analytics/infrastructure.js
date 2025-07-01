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
    // Mock infrastructure data - in a real implementation, this would come from monitoring systems
    const infrastructureData = {
      services: [
        {
          id: 'api-gateway',
          name: 'API Gateway',
          status: 'healthy',
          uptime: 99.9,
          responseTime: Math.floor(20 + Math.random() * 30),
          lastCheck: new Date(Date.now() - Math.random() * 60000).toLocaleString(),
          region: 'US-East-1'
        },
        {
          id: 'database',
          name: 'Database',
          status: 'healthy',
          uptime: 99.8,
          responseTime: Math.floor(10 + Math.random() * 20),
          lastCheck: new Date(Date.now() - Math.random() * 60000).toLocaleString(),
          region: 'US-East-1'
        },
        {
          id: 'authentication',
          name: 'Authentication',
          status: 'healthy',
          uptime: 99.9,
          responseTime: Math.floor(15 + Math.random() * 25),
          lastCheck: new Date(Date.now() - Math.random() * 60000).toLocaleString(),
          region: 'Global'
        },
        {
          id: 'cdn',
          name: 'CDN',
          status: 'healthy',
          uptime: 99.95,
          responseTime: Math.floor(5 + Math.random() * 15),
          lastCheck: new Date(Date.now() - Math.random() * 60000).toLocaleString(),
          region: 'Global'
        },
        {
          id: 'file-storage',
          name: 'File Storage',
          status: 'healthy',
          uptime: 99.7,
          responseTime: Math.floor(25 + Math.random() * 35),
          lastCheck: new Date(Date.now() - Math.random() * 60000).toLocaleString(),
          region: 'US-East-1'
        },
        {
          id: 'websocket',
          name: 'WebSocket',
          status: Math.random() > 0.8 ? 'warning' : 'healthy',
          uptime: 99.5,
          responseTime: Math.floor(8 + Math.random() * 12),
          lastCheck: new Date(Date.now() - Math.random() * 60000).toLocaleString(),
          region: 'US-East-1'
        }
      ],
      database: {
        status: 'healthy',
        connectionPool: {
          active: Math.floor(15 + Math.random() * 20),
          idle: Math.floor(8 + Math.random() * 12),
          total: 50
        },
        queries: {
          slow: Math.floor(Math.random() * 3),
          total: Math.floor(1500 + Math.random() * 500),
          avgDuration: Math.floor(12 + Math.random() * 8)
        },
        storage: {
          used: 12.4 * 1024 * 1024 * 1024, // 12.4 GB
          total: 100 * 1024 * 1024 * 1024, // 100 GB
          percentage: 12.4
        }
      },
      resources: {
        cpu: {
          usage: Math.floor(25 + Math.random() * 30),
          cores: 8
        },
        memory: {
          usage: 6.4 * 1024 * 1024 * 1024, // 6.4 GB
          total: 16 * 1024 * 1024 * 1024   // 16 GB
        },
        storage: {
          usage: 45 * 1024 * 1024 * 1024,  // 45 GB
          total: 200 * 1024 * 1024 * 1024  // 200 GB
        },
        network: {
          inbound: Math.floor(500 + Math.random() * 300) * 1024, // KB/s
          outbound: Math.floor(800 + Math.random() * 400) * 1024  // KB/s
        }
      },
      regions: [
        {
          name: 'US-East-1 (Virginia)',
          status: 'healthy',
          latency: Math.floor(15 + Math.random() * 10),
          load: Math.floor(30 + Math.random() * 20)
        },
        {
          name: 'US-West-2 (Oregon)',
          status: 'healthy',
          latency: Math.floor(45 + Math.random() * 15),
          load: Math.floor(25 + Math.random() * 15)
        },
        {
          name: 'EU-West-1 (Ireland)',
          status: 'healthy',
          latency: Math.floor(85 + Math.random() * 20),
          load: Math.floor(20 + Math.random() * 25)
        },
        {
          name: 'AP-Southeast-1 (Singapore)',
          status: Math.random() > 0.9 ? 'warning' : 'healthy',
          latency: Math.floor(120 + Math.random() * 30),
          load: Math.floor(35 + Math.random() * 20)
        }
      ]
    };

    return res.status(200).json({
      success: true,
      data: infrastructureData
    });

  } catch (error) {
    console.error('Error fetching infrastructure data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch infrastructure data'
    });
  }
}
