/**
 * SIMPLIFIED RESEARCH API TEST
 * Testing step-by-step to isolate the issue
 */

export default async function handler(req, res) {
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

  try {
    const { action } = req.query;

    console.log(`🧪 Test API - action: ${action}`);

    // Test 1: Basic functionality
    if (action === 'basic-test') {
      return res.status(200).json({
        success: true,
        message: 'Basic test passed',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version
      });
    }

    // Test 2: Environment variables
    if (action === 'env-test') {
      return res.status(200).json({
        success: true,
        message: 'Environment test',
        environment: {
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          nodeEnv: process.env.NODE_ENV || 'not set'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Test 3: Supabase import
    if (action === 'import-test') {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        return res.status(200).json({
          success: true,
          message: 'Supabase import successful',
          supabaseVersion: 'imported successfully',
          timestamp: new Date().toISOString()
        });
      } catch (importError) {
        return res.status(500).json({
          success: false,
          error: 'Supabase import failed',
          details: importError.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Test 4: Supabase client creation
    if (action === 'client-test') {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
          return res.status(500).json({
            success: false,
            error: 'Missing Supabase environment variables',
            timestamp: new Date().toISOString()
          });
        }

        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        
        return res.status(200).json({
          success: true,
          message: 'Supabase client created successfully',
          timestamp: new Date().toISOString()
        });
      } catch (clientError) {
        return res.status(500).json({
          success: false,
          error: 'Supabase client creation failed',
          details: clientError.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Test 5: Simple database query
    if (action === 'db-test') {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        
        // Simple query to test connection
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (error) {
          return res.status(500).json({
            success: false,
            error: 'Database query failed',
            details: error.message,
            timestamp: new Date().toISOString()
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Database connection test passed',
          timestamp: new Date().toISOString()
        });
      } catch (dbError) {
        return res.status(500).json({
          success: false,
          error: 'Database test failed',
          details: dbError.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Default response
    return res.status(200).json({
      success: true,
      message: 'Test API working',
      availableTests: [
        'basic-test',
        'env-test', 
        'import-test',
        'client-test',
        'db-test'
      ],
      usage: 'Add ?action=TEST_NAME to test specific functionality',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Test API failed',
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
