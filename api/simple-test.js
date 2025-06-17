// Simple test endpoint without Supabase to verify Vercel functions work (ES modules)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Simple test endpoint called');
    
    res.status(200).json({
      success: true,
      message: 'Simple test endpoint works',
      method: req.method,
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform
      }
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Test endpoint failed',
      message: error.message
    });
  }
};
