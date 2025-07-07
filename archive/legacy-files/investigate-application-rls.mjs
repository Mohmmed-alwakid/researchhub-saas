import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function investigateApplication() {
  console.log('🔍 Investigating the existing application...');

  const applicationId = '3556e16c-50b0-4279-9831-39200739d632f';
  const studyId = '2fd69681-3a09-49c5-b110-a06d8834aee8';
  const participantId = '9876c870-79e9-4106-99d6-9080049ec2aa';

  // Login as participant to get authenticated access
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123'
  });

  if (authError) {
    console.error('❌ Login failed:', authError);
    return;
  }

  // Create authenticated client
  const userSupabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`
      }
    }
  });

  console.log('🔍 Checking with authenticated client...');
  
  // Check with authenticated client - should see RLS-protected data
  const { data: authApps, error: authError2 } = await userSupabase
    .from('study_applications')
    .select('*')
    .eq('id', applicationId);

  console.log('Authenticated query result:', { authApps, authError2 });

  // Check all applications for this participant
  const { data: allUserApps, error: allError } = await userSupabase
    .from('study_applications')
    .select('*')
    .eq('participant_id', participantId);

  console.log('All applications for user:', { allUserApps, allError });

  console.log('🔍 Checking with anonymous client...');
  
  // Check with anonymous client - might not see RLS-protected data
  const { data: anonApps, error: anonError } = await supabase
    .from('study_applications')
    .select('*')
    .eq('id', applicationId);

  console.log('Anonymous query result:', { anonApps, anonError });

  // Check if we can see any applications with anonymous client
  const { data: allAnonApps, error: allAnonError } = await supabase
    .from('study_applications')
    .select('*');

  console.log('All applications (anonymous):', { count: allAnonApps?.length || 0, allAnonError });

  // Check study ownership to understand researcher access
  const { data: studyOwner, error: ownerError } = await supabase
    .from('studies')
    .select('researcher_id')
    .eq('id', studyId)
    .single();

  console.log('Study owner:', { studyOwner, ownerError });
}

investigateApplication();
