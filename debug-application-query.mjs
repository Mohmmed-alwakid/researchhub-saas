import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugApplicationQuery() {
  const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
  const participantId = '9876c870-79e9-4106-99d6-9080049ec2aa';
  
  console.log('🔍 Debugging application query...');
  console.log('Study ID:', studyId);
  console.log('Participant ID:', participantId);
  
  // Check all applications
  const { data: allApps, error: allError } = await supabase
    .from('study_applications')
    .select('*');
  console.log('\nAll applications:', allApps?.length || 0);
  allApps?.forEach(app => {
    console.log(`  - App ID: ${app.id}, Study: ${app.study_id}, Participant: ${app.participant_id}, Status: ${app.status}`);
  });
  
  // Check specific query matching our IDs
  const { data: specificApp, error: specificError } = await supabase
    .from('study_applications')
    .select('*')
    .eq('study_id', studyId)
    .eq('participant_id', participantId);
  console.log('\nSpecific query result:', { count: specificApp?.length || 0, error: specificError?.message });
  
  if (specificApp && specificApp.length > 0) {
    console.log('Found matching application:', specificApp[0]);
    
    // Test the exact query from the API
    const { data: apiQuery, error: apiError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('study_id', studyId)
      .eq('participant_id', participantId)
      .in('status', ['approved', 'accepted'])
      .single();
      
    console.log('\nAPI query result:', { data: !!apiQuery, error: apiError?.message });
    if (apiQuery) {
      console.log('API query found application:', apiQuery.status);
    }
  } else {
    console.log('❌ No application found with those IDs');
  }
}

debugApplicationQuery();
