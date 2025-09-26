/**
 * ENVIRONMENT DIAGNOSTIC API
 * Checks environment variables and dependencies
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
    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      environmentVariables: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        NODE_ENV: process.env.NODE_ENV || 'not set'
      },
      supabaseConfig: {
        urlConfigured: !!process.env.SUPABASE_URL,
        keyConfigured: !!process.env.SUPABASE_ANON_KEY,
        serviceKeyConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    };

    // Test Supabase import
    try {
      const { createClient } = await import('@supabase/supabase-js');
      diagnosis.supabaseImport = 'success';
      
      // Try to create client
      if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        diagnosis.supabaseClient = 'created successfully';
      } else {
        diagnosis.supabaseClient = 'cannot create - missing env vars';
      }
    } catch (importError) {
      diagnosis.supabaseImport = `failed: ${importError.message}`;
    }

    return res.status(200).json({
      success: true,
      message: 'Environment diagnostic complete',
      data: diagnosis
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Diagnostic failed',
      details: error.message,
      stack: error.stack
    });
  }
}
