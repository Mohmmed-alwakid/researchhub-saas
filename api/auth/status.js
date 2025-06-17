export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: 'No valid token provided'
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    
    // For now, return a basic status since we're checking auth structure
    res.status(200).json({
      success: true,
      authenticated: true,
      message: 'Auth status check successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      authenticated: false,
      message: 'Invalid token'
    });
  }
}
