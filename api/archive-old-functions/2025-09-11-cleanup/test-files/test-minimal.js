import and connection
    const { createClient } = await import('@supabase/supabase-js');
import successful');


// Minimal test API to debug the issue
export default async function handler(req, res) {
  try {
    console.log('=== MINIMAL TEST API ===');
    
    // Check environment variables
    console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Missing environment variables',
        details: {
          SUPABASE_URL: !!process.env.SUPABASE_URL,
          SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY
        }
      });
    }

    // Test Supabase     console.log('Supabase     const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    console.log('Supabase client created successfully');

    // Test a simple database query
    const { data, error } = await supabase.from('studies').select('count').limit(1);
    console.log('Database query result - data:', data);
    console.log('Database query result - error:', error);

    return res.status(200).json({
      success: true,
      message: 'All tests passed',
      environmentVariables: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY
      },
      databaseTest: {
        success: !error,
        data: data,
        error: error?.message || null
      }
    });

  } catch (error) {
    console.error('ERROR in test handler:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
