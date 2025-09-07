// Debug API to test environment variables in production
export default async function handler(req, res) {
  console.log('=== Environment Variables Debug ===');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');

  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      console.log('SUPABASE_URL starts with:', process.env.SUPABASE_URL.substring(0, 30) + '...');
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
      console.log('✅ Supabase client creation: SUCCESS');
      
      // Test a simple query to see if database connection works
      const { data, error } = await supabase.from('studies').select('count').limit(1);
      console.log('Database test - Data:', data);
      console.log('Database test - Error:', error);
      
      return res.status(200).json({
        success: true,
        message: 'Environment variables and Supabase connection working',
        envVarsSet: {
          SUPABASE_URL: !!process.env.SUPABASE_URL,
          SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        databaseTest: {
          data: data,
          error: error?.message || null
        }
      });
      
    } else {
      return res.status(500).json({
        success: false,
        message: 'Missing environment variables',
        envVarsSet: {
          SUPABASE_URL: !!process.env.SUPABASE_URL,
          SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      });
    }
    
  } catch (error) {
    console.log('❌ Error in debug handler:', error.message);
    console.log('❌ Full error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error testing Supabase connection',
      error: error.message,
      envVarsSet: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  }
}
