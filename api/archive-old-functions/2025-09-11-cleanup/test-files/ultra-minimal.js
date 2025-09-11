/**
 * ULTRA MINIMAL API TEST
 * No dependencies, no Supabase, just pure Node.js
 */

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

    console.log('✅ Ultra minimal API hit - no dependencies');

    return res.status(200).json({
      success: true,
      message: 'Ultra minimal API working - no dependencies at all',
      method: req.method,
      query: req.query,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'unknown'
    });

  } catch (error) {
    console.error('❌ Ultra Minimal API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
