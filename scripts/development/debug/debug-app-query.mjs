import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function debugApplicationQuery() {
  console.log('=== Debugging Application Query ===\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

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

  // Try the exact query that the API would use
  console.log('\n🔍 Testing exact API query...');
  
  const { data: applications, error, count } = await supabase
    .from('study_applications')
    .select(`
      id,
      status,
      created_at,
      updated_at,
      participant_id,
      study_id,
      profiles!study_applications_participant_id_fkey (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('study_id', studyId)
    .order('created_at', { ascending: false });

  console.log('Query result:', {
    error: error?.message || 'none',
    count: applications?.length || 0,
    applications: applications
  });

  // Try simpler query
  console.log('\n🔍 Testing simpler query...');
  const { data: simpleApps, error: simpleError } = await supabase
    .from('study_applications')
    .select('*')
    .eq('study_id', studyId);

  console.log('Simple query result:', {
    error: simpleError?.message || 'none',
    count: simpleApps?.length || 0,
    applications: simpleApps
  });

  // Check if the study exists and belongs to this user
  console.log('\n🔍 Checking study ownership...');
  const { data: study, error: studyError } = await supabase
    .from('studies')
    .select('id, title, researcher_id')
    .eq('id', studyId)
    .single();

  console.log('Study check:', {
    error: studyError?.message || 'none',
    study: study,
    isOwner: study?.researcher_id === authData.user.id
  });

}

debugApplicationQuery().catch(console.error);
