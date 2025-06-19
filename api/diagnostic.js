// Diagnostic endpoint to check environment variables and basic functionality
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasJwtRefreshSecret: !!process.env.JWT_REFRESH_SECRET,
        mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'not set'
      },
      request: {
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': req.headers['user-agent'] || 'not provided',
          'content-type': req.headers['content-type'] || 'not provided'
        }
      }
    };

    res.status(200).json({
      success: true,
      message: 'Diagnostic information',
      diagnostics
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Diagnostic endpoint error',
      message: error.message,
      stack: error.stack
    });
  }
}
