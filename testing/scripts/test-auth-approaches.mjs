import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function testDifferentApproaches() {
  console.log('=== Testing Different Authentication Approaches ===\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // First login as researcher
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'abwanwr77+researcher@gmail.com',
    password: 'Testtest123'
  });

  if (authError) {
    console.error('❌ Login failed:', authError.message);
    return;
  }

  console.log('✅ Logged in as researcher:', authData.user.email);
  console.log('🔑 User ID:', authData.user.id);

  const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
  const userId = authData.user.id;

  // Test 1: Use SQL query with manual filtering
  console.log('\n🔍 Test 1: Using SQL query with manual filtering...');
  
  const { data: sqlResult, error: sqlError } = await supabase.rpc('get_researcher_applications', {
    p_study_id: studyId,
    p_researcher_id: userId
  });

  if (sqlError && sqlError.message.includes('function "get_researcher_applications" does not exist')) {
    console.log('⚠️ Function does not exist, creating it...');
    
    // Create the function
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION get_researcher_applications(p_study_id UUID, p_researcher_id UUID)
      RETURNS TABLE (
        id UUID,
        study_id UUID,
        participant_id UUID,
        status VARCHAR,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        participant_email TEXT,
        participant_first_name TEXT,
        participant_last_name TEXT
      )
      LANGUAGE SQL
      SECURITY DEFINER
      AS $$
        SELECT 
          sa.id,
          sa.study_id,
          sa.participant_id,
          sa.status,
          sa.created_at,
          sa.updated_at,
          p.email as participant_email,
          p.first_name as participant_first_name,
          p.last_name as participant_last_name
        FROM study_applications sa
        JOIN studies s ON sa.study_id = s.id
        JOIN profiles p ON sa.participant_id = p.id
        WHERE sa.study_id = p_study_id 
        AND s.researcher_id = p_researcher_id
        ORDER BY sa.created_at DESC;
      $$;
    `;

    console.log('Creating function...');
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    
    if (createError) {
      console.log('Creating via execute_sql...');
      const { error: execError } = await supabase
        .from('pg_stat_statements')
        .select('*')
        .limit(0); // This will fail but we just want to execute SQL
      
      console.log('Function creation result:', createError.message);
    }
  } else {
    console.log('SQL function result:', { 
      error: sqlError?.message || 'none', 
      count: sqlResult?.length || 0,
      results: sqlResult
    });
  }

  // Test 2: Try with a fresh authenticated client
  console.log('\n🔍 Test 2: Using fresh authenticated client...');
  
  const freshClient = createClient(supabaseUrl, supabaseAnonKey);
  const { error: signInError } = await freshClient.auth.signInWithPassword({
    email: 'abwanwr77+researcher@gmail.com',
    password: 'Testtest123'
  });

  if (!signInError) {
    const { data: freshResult, error: freshError } = await freshClient
      .from('study_applications')
      .select(`
        id,
        status,
        created_at,
        participant_id,
        study_id
      `)
      .eq('study_id', studyId);

    console.log('Fresh client result:', {
      error: freshError?.message || 'none',
      count: freshResult?.length || 0,
      results: freshResult
    });
  }

}

testDifferentApproaches().catch(console.error);
