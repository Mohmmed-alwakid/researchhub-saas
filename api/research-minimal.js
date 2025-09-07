/**
 * CONSOLIDATED RESEARCH MANAGEMENT API - v2.2 (Minimal Test Version)
 * Testing without middleware dependencies to isolate the issue
 */

// Convert ES6 imports to CommonJS for Vercel compatibility
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let supabaseAdmin = null;

// Initialize Supabase clients only if environment variables are available
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('📚 Supabase client initialized');
} else {
  console.log('📚 Supabase not configured, using file storage only');
}

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  console.log('📚 Supabase admin client initialized');
}

// Main handler function 
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

    const { action } = req.query;

    // Simple test actions to verify functionality
    switch (action) {
      case 'get-studies':
        return res.status(200).json({
          success: true,
          message: 'API working - minimal version without middleware',
          studies: [],
          timestamp: new Date().toISOString()
        });

      case 'health-check':
        return res.status(200).json({
          success: true,
          message: 'Health check passed',
          supabaseConfigured: !!supabase,
          adminConfigured: !!supabaseAdmin,
          timestamp: new Date().toISOString()
        });

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`
        });
    }

  } catch (error) {
    console.error('❌ Research Consolidated API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
