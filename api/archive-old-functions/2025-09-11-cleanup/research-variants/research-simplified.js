/**
 * SIMPLIFIED RESEARCH API - DEBUGGING VERSION
 * Minimal implementation to isolate runtime issues
 */

// Use CommonJS require instead of ES6 imports to avoid module issues
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration with fallback values
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

let supabase = null;

// Initialize Supabase client
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
}

// Simple get studies function without complex dependencies
async function getStudies(req, res) {
  try {
    console.log('📚 [DEBUG] getStudies called - simplified version');
    
    if (!supabase) {
      console.log('📚 [DEBUG] No Supabase client, returning mock data');
      return res.status(200).json({
        success: true,
        data: [
          {
            id: 'demo-1',
            title: '[DEMO] Mobile App Usability Study',
            description: 'Test study to validate backend functionality',
            status: 'active',
            type: 'unmoderated',
            duration: 30,
            created_at: new Date().toISOString(),
            user_id: 'system'
          }
        ],
        source: 'mock_data_fallback'
      });
    }

    // Try to fetch from database
    console.log('📚 [DEBUG] Attempting database query...');
    const { data, error } = await supabase
      .from('studies')
      .select('*')
      .limit(10);

    if (error) {
      console.error('📚 [DEBUG] Database error:', error);
      // Return mock data on database error
      return res.status(200).json({
        success: true,
        data: [
          {
            id: 'demo-1',
            title: '[DEMO] Mobile App Usability Study',
            description: 'Test study - database connection failed',
            status: 'active',
            type: 'unmoderated',
            duration: 30,
            created_at: new Date().toISOString(),
            user_id: 'system'
          }
        ],
        source: 'mock_data_db_error',
        error: error.message
      });
    }

    console.log('📚 [DEBUG] Database query successful, rows:', data?.length || 0);
    return res.status(200).json({
      success: true,
      data: data || [],
      source: 'database'
    });

  } catch (error) {
    console.error('📚 [ERROR] getStudies failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}

// Main handler
module.exports = async function handler(req, res) {
  try {
    console.log('📚 [DEBUG] Research-simplified API called');
    console.log('📚 [DEBUG] Method:', req.method);
    console.log('📚 [DEBUG] Query params:', req.query);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const { action } = req.query;
    console.log('📚 [DEBUG] Action requested:', action);

    switch (action) {
      case 'get-studies':
        return await getStudies(req, res);
        
      case 'test-connection':
        return res.status(200).json({
          success: true,
          message: 'API is working',
          timestamp: new Date().toISOString(),
          environment: {
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
            supabaseClientReady: !!supabase
          }
        });
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action',
          availableActions: ['get-studies', 'test-connection']
        });
    }

  } catch (error) {
    console.error('📚 [ERROR] Handler failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
