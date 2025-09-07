// Debug script to test environment variables in Vercel
console.log('=== Environment Variables Debug ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');

if (process.env.SUPABASE_URL) {
  console.log('SUPABASE_URL starts with:', process.env.SUPABASE_URL.substring(0, 20) + '...');
}

try {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL || 'dummy',
    process.env.SUPABASE_ANON_KEY || 'dummy'
  );
  console.log('Supabase client creation: SUCCESS');
  
  // Test a simple query
  const { data, error } = await supabase.from('studies').select('count').limit(1);
  console.log('Database test query - Data:', data);
  console.log('Database test query - Error:', error);
  
} catch (error) {
  console.log('Supabase client creation FAILED:', error.message);
}

export default async function handler(req, res) {
  return res.status(200).json({
    success: true,
    envVarsSet: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
}
