/**
 * Simple test API to verify CommonJS conversion works
 */

// Export a simple handler
module.exports = async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return res.status(200).json({
      success: true,
      message: 'Simple test API working with CommonJS',
      method: req.method,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
