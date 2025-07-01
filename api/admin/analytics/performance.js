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
    const { timeRange = '24h' } = req.query;
    
    // Mock performance data - in a real implementation, this would come from monitoring systems
    const performanceData = {
      overview: {
        avgResponseTime: Math.floor(200 + Math.random() * 100), // 200-300ms
        uptime: 99.8 + Math.random() * 0.2, // 99.8-100%
        throughput: Math.floor(150 + Math.random() * 50), // 150-200 requests/min
        errorRate: Math.random() * 0.5 // 0-0.5%
      },
      metrics: [
        {
          id: 'cpu-usage',
          name: 'CPU Usage',
          value: Math.floor(30 + Math.random() * 40),
          unit: '%',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          trendValue: Math.floor(Math.random() * 10),
          status: 'good',
          lastUpdated: 'just now'
        },
        {
          id: 'memory-usage',
          name: 'Memory Usage',
          value: Math.floor(60 + Math.random() * 20),
          unit: '%',
          trend: Math.random() > 0.5 ? 'up' : 'stable',
          trendValue: Math.floor(Math.random() * 5),
          status: 'warning',
          lastUpdated: '1 min ago'
        },
        {
          id: 'disk-io',
          name: 'Disk I/O',
          value: Math.floor(10 + Math.random() * 20),
          unit: 'MB/s',
          trend: 'stable',
          trendValue: 0,
          status: 'good',
          lastUpdated: '30 sec ago'
        },
        {
          id: 'network-latency',
          name: 'Network Latency',
          value: Math.floor(50 + Math.random() * 30),
          unit: 'ms',
          trend: 'down',
          trendValue: Math.floor(Math.random() * 8),
          status: 'good',
          lastUpdated: 'just now'
        },
        {
          id: 'api-response-time',
          name: 'API Response Time',
          value: Math.floor(180 + Math.random() * 80),
          unit: 'ms',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          trendValue: Math.floor(Math.random() * 15),
          status: 'good',
          lastUpdated: '15 sec ago'
        },
        {
          id: 'database-queries',
          name: 'Database Queries/sec',
          value: Math.floor(45 + Math.random() * 25),
          unit: '/s',
          trend: 'up',
          trendValue: Math.floor(Math.random() * 12),
          status: 'good',
          lastUpdated: '45 sec ago'
        }
      ],
      timeSeriesData: {
        timestamps: generateTimeStamps(timeRange),
        responseTime: generateTimeSeries(24, 200, 300),
        throughput: generateTimeSeries(24, 150, 200),
        errorRate: generateTimeSeries(24, 0, 1),
        cpuUsage: generateTimeSeries(24, 30, 70),
        memoryUsage: generateTimeSeries(24, 60, 80)
      }
    };

    return res.status(200).json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    console.error('Error fetching performance data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch performance data'
    });
  }
}

function generateTimeStamps(timeRange) {
  const now = new Date();
  const timestamps = [];
  let interval, count;

  switch (timeRange) {
    case '1h':
      interval = 5 * 60 * 1000; // 5 minutes
      count = 12;
      break;
    case '24h':
      interval = 60 * 60 * 1000; // 1 hour
      count = 24;
      break;
    case '7d':
      interval = 24 * 60 * 60 * 1000; // 1 day
      count = 7;
      break;
    case '30d':
      interval = 24 * 60 * 60 * 1000; // 1 day
      count = 30;
      break;
    default:
      interval = 60 * 60 * 1000;
      count = 24;
  }

  for (let i = count - 1; i >= 0; i--) {
    timestamps.push(new Date(now.getTime() - i * interval).toISOString());
  }

  return timestamps;
}

function generateTimeSeries(count, min, max) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push(Math.floor(min + Math.random() * (max - min)));
  }
  return data;
}
